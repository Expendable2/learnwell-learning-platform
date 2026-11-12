import { randomBytes, scrypt as scryptCallback, createHash, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { seedCourses } from "./catalog.js";

const { Pool } = pg;
const scrypt = promisify(scryptCallback);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultDataPath = path.join(root, "data", "learnwell.json");
const dataPath = path.resolve(process.env.LEARNWELL_DATA_FILE || defaultDataPath);
const dataDirectory = path.dirname(dataPath);
const tempPath = `${dataPath}.tmp`;
const sessionLifetime = 1000 * 60 * 60 * 24 * 30;
const migrationDirectory = path.join(root, "server", "migrations");
const poolMaximum = Number.parseInt(process.env.PG_POOL_MAX || "10", 10);

let pool;
let localStore;
let writeQueue = Promise.resolve();

function createInitialStore() {
  return { users: [], sessions: [], courses: seedCourses, enrollments: [], certificates: [] };
}

async function loadLocalStore() {
  await mkdir(dataDirectory, { recursive: true });
  try {
    const saved = JSON.parse(await readFile(dataPath, "utf8"));
    return {
      users: Array.isArray(saved.users) ? saved.users : [],
      sessions: Array.isArray(saved.sessions) ? saved.sessions : [],
      courses: Array.isArray(saved.courses) && saved.courses.length ? saved.courses : seedCourses,
      enrollments: Array.isArray(saved.enrollments) ? saved.enrollments : [],
      certificates: Array.isArray(saved.certificates) ? saved.certificates : [],
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const initial = createInitialStore();
    await persistLocalStore(initial);
    return initial;
  }
}

async function persistLocalStore(store) {
  await writeFile(tempPath, JSON.stringify(store, null, 2), { encoding: "utf8", mode: 0o600 });
  await rename(tempPath, dataPath);
}

async function updateLocalStore(update) {
  const operation = writeQueue.then(async () => {
    const result = await update(localStore);
    await persistLocalStore(localStore);
    return result;
  });
  writeQueue = operation.catch(() => {});
  return operation;
}

function mapCourse(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    instructor: row.instructor,
    organization: row.organization,
    category: row.category,
    level: row.level,
    duration: row.duration,
    rating: row.rating,
    reviews: row.reviews,
    price: row.price,
    image: row.image,
    accent: row.accent,
    description: row.description,
    lessons: row.lessons,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function mapUser(row) {
  return row ? {
    id: row.id,
    name: row.name,
    email: row.email,
    salt: row.password_salt ?? row.salt,
    hash: row.password_hash,
    createdAt: new Date(row.created_at).toISOString(),
  } : null;
}

function mapCertificate(row) {
  return row ? {
    id: row.id,
    verificationCode: row.verification_code,
    userId: row.user_id,
    courseId: row.course_id,
    recipientName: row.recipient_name,
    courseTitle: row.course_title,
    instructor: row.instructor,
    issuedAt: new Date(row.issued_at).toISOString(),
  } : null;
}

function localCertificateFor(store, userId, courseId) {
  return store.certificates.find((item) => item.userId === userId && item.courseId === courseId) || null;
}

function localEnrollmentFor(store, userId, courseId) {
  return store.enrollments.find((item) => item.userId === userId && item.courseId === courseId) || null;
}

function localPublicEnrollment(store, enrollment) {
  const course = store.courses.find((item) => item.id === enrollment.courseId);
  if (!course) return null;
  const certificate = localCertificateFor(store, enrollment.userId, enrollment.courseId);
  return {
    course,
    completedLessons: enrollment.completedLessons,
    totalLessons: course.lessons.length,
    certificate,
  };
}

function addSessionToLocal(store, session, userId) {
  store.sessions = store.sessions.filter((item) => item.expiresAt > Date.now());
  store.sessions.push({ ...session, userId });
}

export async function initializeStore() {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required in production. Configure a managed PostgreSQL database.");
    }
    localStore = await loadLocalStore();
    console.info("Using local JSON storage for development; configure DATABASE_URL for shared PostgreSQL storage.");
    return;
  }
  if (!Number.isInteger(poolMaximum) || poolMaximum < 1 || poolMaximum > 100) {
    throw new Error("PG_POOL_MAX must be a whole number between 1 and 100.");
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: poolMaximum,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    idle_in_transaction_session_timeout: 30000,
    statement_timeout: 15000,
    maxLifetimeSeconds: 1800,
    allowExitOnIdle: false,
    ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
  });
  pool.on("error", (error) => console.error("Unexpected idle PostgreSQL client error:", error));

  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [845029171]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    const migrationFiles = (await readdir(migrationDirectory))
      .filter((name) => /^\d+_[\w-]+\.sql$/.test(name))
      .sort();
    if (migrationFiles.length === 0) throw new Error("No database migration files were found.");
    for (const migrationFile of migrationFiles) {
      const version = migrationFile.replace(/\.sql$/, "");
      const migration = await client.query("SELECT 1 FROM schema_migrations WHERE version = $1", [version]);
      if (migration.rowCount > 0) continue;

      await client.query("BEGIN");
      try {
        await client.query(await readFile(path.join(migrationDirectory, migrationFile), "utf8"));
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [version]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    for (const course of seedCourses) {
      await client.query(
        `INSERT INTO courses
          (id, title, instructor, organization, category, level, duration, rating, reviews, price, image, accent, description, lessons)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb)
         ON CONFLICT (id) DO NOTHING`,
        [
          course.id, course.title, course.instructor, course.organization, course.category,
          course.level, course.duration, course.rating, course.reviews, course.price,
          course.image, course.accent, course.description, JSON.stringify(course.lessons),
        ],
      );
    }
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock($1)", [845029171]);
    } finally {
      client.release();
    }
  }
  await pool.query("SELECT 1");
  console.info(`Connected to PostgreSQL with a ${poolMaximum}-connection pool.`);
}

export async function closeStore() {
  if (pool) await pool.end();
}

export async function healthCheck() {
  if (pool) {
    await pool.query("SELECT 1");
    return "postgres";
  }
  if (!localStore) throw new Error("Storage has not been initialized.");
  return "local";
}

export async function listCourses({ category = "", query = "", limit = 100 } = {}) {
  if (pool) {
    const result = await pool.query(
      `SELECT * FROM courses
       WHERE ($1 = '' OR lower(category) = lower($1))
         AND ($2 = '' OR title ILIKE $3 OR instructor ILIKE $3 OR category ILIKE $3 OR description ILIKE $3)
       ORDER BY created_at DESC, title ASC
       LIMIT $4`,
      [category.toLowerCase() === "all" ? "" : category, query, `%${query}%`, limit],
    );
    return result.rows.map(mapCourse);
  }
  const normalizedCategory = category.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  return localStore.courses.filter((course) => {
    const matchesCategory = !normalizedCategory || normalizedCategory === "all" || course.category.toLowerCase() === normalizedCategory;
    const searchable = `${course.title} ${course.instructor} ${course.category} ${course.description}`.toLowerCase();
    return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
  }).slice(0, limit);
}

export async function findUserByEmail(email) {
  if (pool) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return mapUser(result.rows[0]);
  }
  return localStore.users.find((user) => user.email === email) || null;
}

export async function registerUser(user, session) {
  if (pool) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "INSERT INTO users (id, name, email, password_salt, password_hash, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
        [user.id, user.name, user.email, user.salt, user.hash, user.createdAt],
      );
      await client.query("INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)", [session.id, user.id, new Date(session.expiresAt)]);
      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") return false;
      throw error;
    } finally {
      client.release();
    }
  }
  return updateLocalStore((store) => {
    if (store.users.some((item) => item.email === user.email)) return false;
    store.users.push(user);
    addSessionToLocal(store, session, user.id);
    return true;
  });
}

export async function createSessionForUser(session, userId) {
  if (pool) {
    await pool.query(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)",
      [session.id, userId, new Date(session.expiresAt)],
    );
    await pool.query("DELETE FROM sessions WHERE expires_at <= now()");
    return;
  }
  await updateLocalStore((store) => addSessionToLocal(store, session, userId));
}

export async function deleteSession(sessionId) {
  if (pool) {
    await pool.query("DELETE FROM sessions WHERE id = $1", [sessionId]);
    return;
  }
  await updateLocalStore((store) => {
    store.sessions = store.sessions.filter((session) => session.id !== sessionId);
  });
}

export async function getAuthenticatedUser(sessionId) {
  if (pool) {
    const result = await pool.query(
      `SELECT users.* FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.id = $1 AND sessions.expires_at > now()`,
      [sessionId],
    );
    return mapUser(result.rows[0]);
  }
  const session = localStore.sessions.find((item) => item.id === sessionId && item.expiresAt > Date.now());
  return session ? localStore.users.find((user) => user.id === session.userId) || null : null;
}

export async function getUserProfile(userId) {
  if (pool) {
    const [userResult, enrollmentResult] = await Promise.all([
      pool.query("SELECT * FROM users WHERE id = $1", [userId]),
      pool.query(
        `SELECT enrollments.user_id, enrollments.course_id, enrollments.completed_lessons, enrollments.enrolled_at,
                courses.*,
                certificates.id AS certificate_id, certificates.verification_code, certificates.recipient_name,
                certificates.course_title, certificates.instructor AS certificate_instructor, certificates.issued_at
         FROM enrollments
         JOIN courses ON courses.id = enrollments.course_id
         LEFT JOIN certificates ON certificates.user_id = enrollments.user_id AND certificates.course_id = enrollments.course_id
         WHERE enrollments.user_id = $1
         ORDER BY enrollments.enrolled_at DESC`,
        [userId],
      ),
    ]);
    const enrollments = enrollmentResult.rows.map((row) => ({
      course: mapCourse(row),
      completedLessons: row.completed_lessons,
      totalLessons: row.lessons.length,
      certificate: row.certificate_id ? {
        id: row.certificate_id,
        verificationCode: row.verification_code,
        issuedAt: new Date(row.issued_at).toISOString(),
        recipientName: row.recipient_name,
        courseTitle: row.course_title,
        instructor: row.certificate_instructor,
      } : null,
    }));
    return { user: mapUser(userResult.rows[0]), enrollments };
  }
  const user = localStore.users.find((item) => item.id === userId) || null;
  const enrollments = localStore.enrollments
    .filter((item) => item.userId === userId)
    .map((item) => localPublicEnrollment(localStore, item))
    .filter(Boolean);
  return { user, enrollments };
}

export async function createCourse(course) {
  if (pool) {
    await pool.query(
      `INSERT INTO courses
        (id, title, instructor, organization, category, level, duration, rating, reviews, price, image, accent, description, lessons, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15, $16)`,
      [
        course.id, course.title, course.instructor, course.organization, course.category,
        course.level, course.duration, course.rating, course.reviews, course.price,
        course.image, course.accent, course.description, JSON.stringify(course.lessons),
        course.createdBy, course.createdAt,
      ],
    );
    return;
  }
  await updateLocalStore((store) => store.courses.unshift(course));
}

export async function enrollUser(userId, courseId) {
  if (pool) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const courseResult = await client.query("SELECT * FROM courses WHERE id = $1", [courseId]);
      if (courseResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return { error: "Course not found.", status: 404 };
      }
      await client.query(
        "INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT (user_id, course_id) DO NOTHING",
        [userId, courseId],
      );
      const result = await client.query("SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2", [userId, courseId]);
      const enrollment = await getEnrollment(userId, courseId, result.rows[0], client);
      await client.query("COMMIT");
      return { enrollment };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  return updateLocalStore((store) => {
    const course = store.courses.find((item) => item.id === courseId);
    if (!course) return { error: "Course not found.", status: 404 };
    let enrollment = localEnrollmentFor(store, userId, courseId);
    if (!enrollment) {
      enrollment = { userId, courseId, completedLessons: 0, enrolledAt: new Date().toISOString() };
      store.enrollments.push(enrollment);
    }
    return { enrollment: localPublicEnrollment(store, enrollment) };
  });
}

async function getEnrollment(userId, courseId, enrollmentRow, client = pool) {
  const courseResult = await client.query("SELECT * FROM courses WHERE id = $1", [courseId]);
  const course = mapCourse(courseResult.rows[0]);
  const certificateResult = await client.query(
    "SELECT * FROM certificates WHERE user_id = $1 AND course_id = $2",
    [userId, courseId],
  );
  const certificate = mapCertificate(certificateResult.rows[0]);
  return {
    course,
    completedLessons: enrollmentRow.completed_lessons,
    totalLessons: course.lessons.length,
    certificate,
  };
}

export async function completeCourseProgress(user, courseId, completedLessons) {
  if (pool) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const courseResult = await client.query("SELECT * FROM courses WHERE id = $1 FOR SHARE", [courseId]);
      if (courseResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return { error: "Course not found.", status: 404 };
      }
      const course = mapCourse(courseResult.rows[0]);
      const enrollmentResult = await client.query(
        "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2 FOR UPDATE",
        [user.id, courseId],
      );
      if (enrollmentResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return { error: "Enroll in this course before updating progress.", status: 404 };
      }
      const enrollment = enrollmentResult.rows[0];
      if (completedLessons > course.lessons.length || completedLessons > enrollment.completed_lessons + 1) {
        await client.query("ROLLBACK");
        return { error: "Complete lessons in order to update your progress.", status: 400 };
      }

      const updated = await client.query(
        `UPDATE enrollments SET completed_lessons = GREATEST(completed_lessons, $3)
         WHERE user_id = $1 AND course_id = $2 RETURNING *`,
        [user.id, courseId, completedLessons],
      );
      if (updated.rows[0].completed_lessons === course.lessons.length) {
        await client.query(
          `INSERT INTO certificates
            (id, verification_code, user_id, course_id, recipient_name, course_title, instructor)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (user_id, course_id) DO NOTHING`,
          [randomBytes(16).toString("hex"), randomBytes(6).toString("hex").toUpperCase(), user.id, course.id, user.name, course.title, course.instructor],
        );
      }
      const result = await getEnrollment(user.id, courseId, updated.rows[0], client);
      await client.query("COMMIT");
      return { enrollment: result };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  return updateLocalStore((store) => {
    const course = store.courses.find((item) => item.id === courseId);
    if (!course) return { error: "Course not found.", status: 404 };
    const enrollment = localEnrollmentFor(store, user.id, courseId);
    if (!enrollment) return { error: "Enroll in this course before updating progress.", status: 404 };
    if (completedLessons > course.lessons.length || completedLessons > enrollment.completedLessons + 1) {
      return { error: "Complete lessons in order to update your progress.", status: 400 };
    }
    enrollment.completedLessons = Math.max(enrollment.completedLessons, completedLessons);
    if (enrollment.completedLessons === course.lessons.length && !localCertificateFor(store, user.id, courseId)) {
      store.certificates.push({
        id: randomBytes(16).toString("hex"),
        verificationCode: randomBytes(6).toString("hex").toUpperCase(),
        userId: user.id,
        courseId,
        recipientName: user.name,
        courseTitle: course.title,
        instructor: course.instructor,
        issuedAt: new Date().toISOString(),
      });
    }
    return { enrollment: localPublicEnrollment(store, enrollment) };
  });
}

export async function findCertificate(certificateId) {
  if (pool) {
    const result = await pool.query("SELECT * FROM certificates WHERE id = $1", [certificateId]);
    return mapCertificate(result.rows[0]);
  }
  return localStore.certificates.find((certificate) => certificate.id === certificateId) || null;
}

export async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const derived = await scrypt(password, salt, 64);
  return { salt, hash: derived.toString("hex") };
}

export async function verifyPassword(password, salt, expectedHash) {
  const derived = await scrypt(password, salt, 64);
  const expected = Buffer.from(expectedHash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function createSession() {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    session: { id: digest(token), expiresAt: Date.now() + sessionLifetime },
  };
}

export function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

export function getSessionCookie(token, secure = false) {
  return `learnwell_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionLifetime / 1000}${secure ? "; Secure" : ""}`;
}

export function clearSessionCookie(secure = false) {
  return `learnwell_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure ? "; Secure" : ""}`;
}

export function sessionToken(req) {
  const cookies = String(req.headers.cookie || "").split(";");
  const sessionCookie = cookies.map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith("learnwell_session="));
  const token = sessionCookie ? sessionCookie.slice("learnwell_session=".length) : "";
  return /^[a-f0-9]{64}$/.test(token) ? token : "";
}
