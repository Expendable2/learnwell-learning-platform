import express from "express";
import { randomBytes, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { publicCourse } from "./catalog.js";
import {
  closeStore,
  completeCourseProgress,
  clearSessionCookie,
  createSession,
  createCourse,
  createSessionForUser,
  deleteSession,
  digest,
  enrollUser,
  findCertificate,
  findUserByEmail,
  getAuthenticatedUser,
  getSessionCookie,
  hashPassword,
  getUserProfile,
  healthCheck,
  initializeStore,
  listCourses,
  registerUser,
  safeUser,
  sessionToken,
  verifyPassword,
} from "./store.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const categories = ["Design", "Data", "Business", "Development", "Marketing", "Personal growth", "Other"];
const allowedLevels = ["Beginner", "Intermediate", "Advanced", "All levels"];

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "32kb" }));

function isSecureRequest(req) {
  return req.secure || process.env.COOKIE_SECURE === "true";
}

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

function publicEnrollment(enrollment) {
  return { ...enrollment, course: publicCourse(enrollment.course) };
}

function publicEnrollmentResult(result) {
  return result.enrollment ? { ...result, enrollment: publicEnrollment(result.enrollment) } : result;
}

async function requireUser(req, res, next) {
  const token = sessionToken(req);
  if (!token) return sendError(res, 401, "Please sign in to continue.");

  const sessionId = digest(token);
  const user = await getAuthenticatedUser(sessionId);
  if (!user) return sendError(res, 401, "Your session has expired. Please sign in again.");

  req.user = user;
  req.sessionId = sessionId;
  return next();
}

app.get("/api/courses", async (req, res) => {
  const category = String(req.query.category || "").trim().slice(0, 30);
  const query = String(req.query.q || "").trim().slice(0, 100);
  const results = await listCourses({ category, query, limit: 100 });
  res.json({ courses: results.map(publicCourse) });
});

app.post("/api/auth/register", async (req, res) => {
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 2 || name.length > 80) return sendError(res, 400, "Name must be between 2 and 80 characters.");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendError(res, 400, "Enter a valid email address.");
  if (password.length < 8 || password.length > 128) return sendError(res, 400, "Password must be between 8 and 128 characters.");

  const passwordData = await hashPassword(password);
  const user = { id: randomUUID(), name, email, ...passwordData, createdAt: new Date().toISOString() };
  const { token, session } = createSession();
  const created = await registerUser(user, session);
  if (!created) return sendError(res, 409, "An account with that email already exists. Please sign in.");

  res.setHeader("Set-Cookie", getSessionCookie(token, isSecureRequest(req)));
  res.status(201).json({ user: safeUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const user = await findUserByEmail(email);
  const valid = user ? await verifyPassword(password, user.salt, user.hash) : false;
  if (!valid) return sendError(res, 401, "Email or password is incorrect.");

  const { token, session } = createSession();
  await createSessionForUser(session, user.id);
  res.setHeader("Set-Cookie", getSessionCookie(token, isSecureRequest(req)));
  res.json({ user: safeUser(user) });
});

app.post("/api/auth/logout", async (req, res) => {
  const token = sessionToken(req);
  if (token) {
    await deleteSession(digest(token));
  }
  res.setHeader("Set-Cookie", clearSessionCookie(isSecureRequest(req)));
  res.json({ ok: true });
});

app.get("/api/me", async (req, res) => {
  const token = sessionToken(req);
  const user = token ? await getAuthenticatedUser(digest(token)) : null;
  if (!user) return res.json({ user: null, enrollments: [] });
  const profile = await getUserProfile(user.id);
  res.json({ user: safeUser(user), enrollments: profile.enrollments.map(publicEnrollment) });
});

app.post("/api/courses", requireUser, async (req, res) => {
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const level = typeof body.level === "string" ? body.level.trim() : "";
  const duration = typeof body.duration === "string" ? body.duration.trim() : "";
  const organization = typeof body.organization === "string" ? body.organization.trim() : "";
  const lessonTitles = Array.isArray(body.lessons)
    ? body.lessons.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];
  const lessonVideoUrls = Array.isArray(body.lessonVideoUrls)
    ? body.lessonVideoUrls.filter((item) => typeof item === "string").map((item) => item.trim())
    : [];
  const lessonQuizLines = Array.isArray(body.lessonQuizLines)
    ? body.lessonQuizLines.filter((item) => typeof item === "string").map((item) => item.trim())
    : [];

  if (title.length < 4 || title.length > 100) return sendError(res, 400, "Course title must be between 4 and 100 characters.");
  if (description.length < 20 || description.length > 600) return sendError(res, 400, "Description must be between 20 and 600 characters.");
  if (!categories.includes(category)) return sendError(res, 400, "Choose a course category.");
  if (!allowedLevels.includes(level)) return sendError(res, 400, "Choose a course level.");
  if (!/^[\w\s-]{2,30}$/.test(duration)) return sendError(res, 400, "Enter a course duration, for example 4 weeks.");
  if (organization.length > 80) return sendError(res, 400, "Organization must be 80 characters or fewer.");
  if (lessonTitles.length < 1 || lessonTitles.length > 20 || lessonTitles.some((item) => item.length > 100)) {
    return sendError(res, 400, "Add between 1 and 20 lesson titles, each no longer than 100 characters.");
  }
  if (lessonVideoUrls.length !== lessonTitles.length || lessonQuizLines.length !== lessonTitles.length) {
    return sendError(res, 400, "Add one video URL and one quiz question for every lesson.");
  }

  const videoUrls = lessonVideoUrls.map((videoUrl) => {
    try {
      const parsed = new URL(videoUrl);
      let videoId = "";
      if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(parsed.hostname)) {
        videoId = parsed.pathname === "/watch" ? parsed.searchParams.get("v") || "" : parsed.pathname.split("/").filter(Boolean).at(-1) || "";
      } else if (["youtu.be", "www.youtu.be"].includes(parsed.hostname)) {
        videoId = parsed.pathname.split("/").filter(Boolean)[0] || "";
      }
      return /^[A-Za-z0-9_-]{11}$/.test(videoId) ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
    } catch {
      return null;
    }
  });
  if (videoUrls.some((videoUrl) => !videoUrl)) {
    return sendError(res, 400, "Use a valid YouTube video URL for each lesson.");
  }

  const lessonQuizzes = lessonQuizLines.map((line) => {
    const [question, ...parts] = line.split("|").map((part) => part.trim());
    const options = parts.slice(0, 4);
    const correctAnswer = Number(parts[4]);
    if (
      !question || question.length > 300 || parts.length !== 5 ||
      options.some((option) => !option || option.length > 160) ||
      !Number.isInteger(correctAnswer) || correctAnswer < 1 || correctAnswer > 4
    ) return null;
    return { questions: [{ question, options, correctIndex: correctAnswer - 1 }] };
  });
  if (lessonQuizzes.some((quiz) => !quiz)) {
    return sendError(res, 400, "Each quiz line needs a question, four answers, and the correct answer number (1-4), separated by |.");
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  const accents = ["lavender", "mint", "peach", "blue"];
  const course = {
    id: `${slug}-${randomBytes(3).toString("hex")}`,
    title,
    instructor: req.user.name,
    organization: organization || "Independent instructor",
    category,
    level,
    duration,
    rating: "New",
    reviews: "0",
    price: "Free",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
    accent: accents[Math.floor(Math.random() * accents.length)],
    description,
    lessons: lessonTitles.map((lessonTitle, index) => ({
      title: lessonTitle,
      content: `Start with one clear goal for this lesson. Explore ${lessonTitle.toLowerCase()}, capture your key takeaway, and decide how you can put it into practice.`,
      videoUrl: videoUrls[index],
      quiz: lessonQuizzes[index],
      index,
    })),
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
  };
  await createCourse(course);
  res.status(201).json({ course: publicCourse(course) });
});

app.put("/api/enrollments/:courseId", requireUser, async (req, res) => {
  const result = await enrollUser(req.user.id, req.params.courseId);
  if (result.error) return sendError(res, result.status, result.error);
  res.json(publicEnrollmentResult(result));
});

app.patch("/api/enrollments/:courseId/progress", requireUser, async (req, res) => {
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const completedLessons = body.completedLessons;
  if (!Number.isInteger(completedLessons) || completedLessons < 0) {
    return sendError(res, 400, "Lesson progress must be a non-negative whole number.");
  }
  const quizAnswers = body.quizAnswers;
  if (quizAnswers !== undefined && (!Array.isArray(quizAnswers) || quizAnswers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3))) {
    return sendError(res, 400, "Quiz answers must be valid answer choices.");
  }

  const result = await completeCourseProgress(req.user, req.params.courseId, completedLessons, quizAnswers);
  if (result.error) return res.status(result.status).json({ error: result.error, score: result.score, total: result.total, passed: false });
  res.json(publicEnrollmentResult(result));
});

app.get("/api/certificates/:certificateId", async (req, res) => {
  const certificate = await findCertificate(req.params.certificateId);
  if (!certificate) return sendError(res, 404, "Certificate not found.");
  res.json({
    certificate: {
      verificationCode: certificate.verificationCode,
      recipientName: certificate.recipientName,
      courseTitle: certificate.courseTitle,
      instructor: certificate.instructor,
      issuedAt: certificate.issuedAt,
    },
  });
});

app.get("/api/health", async (_req, res) => {
  const storage = await healthCheck();
  res.json({ status: "ok", storage });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(root, "dist")));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(root, "dist", "index.html"));
  });
}

app.use((error, _req, res, _next) => {
  console.error("Learnwell request failed:", error);
  if (res.headersSent) return;
  if (error instanceof SyntaxError && "body" in error) {
    return sendError(res, 400, "Request body must be valid JSON.");
  }
  return sendError(res, 500, "Something went wrong. Please try again.");
});

try {
  await initializeStore();
} catch (error) {
  console.error("Learnwell could not initialize storage:", error);
  await closeStore();
  process.exit(1);
}

const server = app.listen(port, () => {
  console.log(`Learnwell API listening on http://localhost:${port}`);
});

let isShuttingDown = false;
async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.info(`Received ${signal}; shutting down gracefully.`);
  const hardStop = setTimeout(() => {
    console.error("Graceful shutdown timed out.");
    process.exit(1);
  }, 10000);
  hardStop.unref();
  server.close(async (error) => {
    try {
      await closeStore();
      if (error) throw error;
      process.exitCode = 0;
    } catch (shutdownError) {
      console.error("Graceful shutdown failed:", shutdownError);
      process.exitCode = 1;
    } finally {
      clearTimeout(hardStop);
    }
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
