import { useEffect, useMemo, useState } from "react";

const categories = ["All courses", "Design", "Data", "Business", "Development", "Marketing", "Personal growth", "Other"];

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.2 4.2" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    play: <><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4V8Z" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="Learnwell home">
      <span className="brand-mark">l<span>.</span></span>
      <span>learnwell</span>
    </a>
  );
}

function AuthModal({ course, enrollment: initialEnrollment, mode = "register", intent = "learn", onClose, onAuthenticated, onEnrollmentUpdated }) {
  const [flow, setFlow] = useState(() => initialEnrollment?.certificate ? "certificate" : initialEnrollment ? "lesson" : "auth");
  const [authMode, setAuthMode] = useState(mode);
  const [enrollment, setEnrollment] = useState(initialEnrollment);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function submitAuth(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());
    try {
      const { user } = await apiRequest(`/api/auth/${authMode}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      onAuthenticated(user, intent);
      if (course) {
        const { enrollment: nextEnrollment } = await apiRequest(`/api/enrollments/${course.id}`, { method: "PUT" });
        setEnrollment(nextEnrollment);
        onEnrollmentUpdated(nextEnrollment);
        setFlow(nextEnrollment.certificate ? "certificate" : "lesson");
      } else {
        setFlow("success");
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function completeLesson() {
    setBusy(true);
    setError("");
    try {
      const { enrollment: nextEnrollment } = await apiRequest(`/api/enrollments/${course.id}/progress`, {
        method: "PATCH",
        body: JSON.stringify({ completedLessons: enrollment.completedLessons + 1 }),
      });
      setEnrollment(nextEnrollment);
      onEnrollmentUpdated(nextEnrollment);
      if (nextEnrollment.certificate) setFlow("certificate");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  const currentLesson = course?.lessons?.[enrollment?.completedLessons];
  const certificate = enrollment?.certificate;

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" />
        </button>
        {flow === "success" ? (
          <div className="modal-success">
            <span className="success-icon"><Icon name="check" size={25} /></span>
            <h2 id="modal-title">Welcome to Learnwell.</h2>
            <p>Your account is ready. Track your learning and pick up where you left off anytime.</p>
            <button className="button button-primary modal-submit" onClick={onClose}>Sounds good</button>
          </div>
        ) : flow === "lesson" ? (
          <div className="lesson-flow">
            <span className="eyebrow">YOUR LEARNING SPACE</span>
            <h2 id="modal-title">{course.title}</h2>
            <p className="modal-copy">A self-paced course with {course.instructor}.</p>
            <div className="lesson-progress">
              <span>LESSON {enrollment.completedLessons + 1} OF {enrollment.totalLessons}</span>
              <div><i style={{ width: `${(enrollment.completedLessons / enrollment.totalLessons) * 100}%` }} /></div>
            </div>
            <div className="lesson-card">
              <span className="lesson-number">{String(enrollment.completedLessons + 1).padStart(2, "0")}</span>
              <h3>{currentLesson?.title}</h3>
              <p>{currentLesson?.content}</p>
              <div className="lesson-takeaway"><strong>Try this</strong><span>Write down one idea you can put into practice this week.</span></div>
            </div>
            <button
              className="button button-primary modal-submit"
              type="button"
              onClick={completeLesson}
              disabled={busy}
            >
              {busy ? "Saving progress…" : enrollment.completedLessons + 1 === enrollment.totalLessons ? "Complete course & earn certificate" : "Mark lesson complete"}
              <Icon name="arrow" size={18} />
            </button>
          </div>
        ) : flow === "certificate" ? (
          <div className="certificate-flow">
            <span className="eyebrow">A MOMENT WORTH CELEBRATING</span>
            <div className="earned-certificate">
              <span className="certificate-seal"><Icon name="check" size={22} /></span>
              <span className="certificate-label">LEARNWELL · CERTIFICATE OF COMPLETION</span>
              <h2 id="modal-title">A little learning.<br />A big step forward.</h2>
              <span className="certificate-recipient">{certificate?.recipientName}</span>
              <p>has completed</p>
              <strong className="certificate-course">{certificate?.courseTitle}</strong>
              <span className="certificate-instructor">Guided by {certificate?.instructor}</span>
              <span className="certificate-rule" />
              <span className="certificate-date">ISSUED {certificate?.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : ""}</span>
              <span className="certificate-date">VERIFY CODE · {certificate?.verificationCode}</span>
            </div>
            <button className="button button-primary modal-submit print-certificate" type="button" onClick={() => window.print()}>
              Print certificate <Icon name="arrow" size={18} />
            </button>
            <a className="certificate-verify" href={`/api/certificates/${certificate?.id}`} target="_blank" rel="noreferrer">Verify certificate</a>
            <button className="text-link certificate-done" type="button" onClick={onClose}>Back to exploring</button>
          </div>
        ) : (
          <>
            <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
            <h2 id="modal-title">{course ? "Start learning today" : intent === "teach" ? "Share what you know." : "Make room for what’s next."}</h2>
            <p className="modal-copy">
              {course ? `Join ${course.title} and learn at your own pace.` : intent === "teach" ? "Create an account to build and publish your first course." : "Create your free account and find a course that fits your goals."}
            </p>
            <form onSubmit={submitAuth}>
              {authMode === "register" && <>
                <label htmlFor="signup-name">Your name</label>
                <input id="signup-name" name="name" autoComplete="name" placeholder="Alex Morgan" minLength={2} maxLength={80} required />
              </>}
              <label htmlFor="signup-email">Email address</label>
              <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
              <label htmlFor="signup-password">Password</label>
              <input id="signup-password" name="password" type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} minLength={8} required />
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-primary modal-submit" type="submit">
                {busy ? "Please wait…" : course ? authMode === "register" ? "Create account & enroll" : "Sign in & enroll" : authMode === "register" ? "Create free account" : "Log in"}
                {!busy && <Icon name="arrow" size={18} />}
              </button>
            </form>
            <button className="text-link auth-switch" type="button" onClick={() => { setError(""); setAuthMode((current) => current === "register" ? "login" : "register"); }}>
              {authMode === "register" ? "Already have an account? Log in" : "New to Learnwell? Create an account"}
            </button>
            <p className="modal-terms">Learnwell awards certificates of completion. They are not accredited credentials.</p>
          </>
        )}
        {error && flow !== "auth" && <p className="form-error" role="alert">{error}</p>}
      </section>
    </div>
  );
}

function LearningDashboard({ enrollments, onClose, onOpenCourse }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="auth-modal dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="dashboard-title">
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
        <span className="eyebrow">YOUR LEARNING SPACE</span>
        <h2 id="dashboard-title">My learning</h2>
        <p className="modal-copy">Pick up where you left off or revisit a certificate you earned.</p>
        {enrollments.length ? (
          <div className="dashboard-list">
            {enrollments.map((item) => (
              <article className="dashboard-course" key={item.course.id}>
                <div>
                  <span className="dashboard-category">{item.course.category} · {item.completedLessons}/{item.totalLessons} lessons</span>
                  <strong>{item.course.title}</strong>
                  <div className="dashboard-progress"><i style={{ width: `${(item.completedLessons / item.totalLessons) * 100}%` }} /></div>
                </div>
                <button className="button button-outline" type="button" onClick={() => onOpenCourse(item)}>
                  {item.certificate ? "View certificate" : "Continue"} <Icon name="arrow" size={15} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty">
            <strong>Your next chapter starts here.</strong>
            <span>Enroll in a course and your progress will show up here.</span>
          </div>
        )}
      </section>
    </div>
  );
}

function CreateCourseModal({ user, onClose, onCreated }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function createCourse(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const lessons = String(formData.get("lessons") || "").split("\n").map((title) => title.trim()).filter(Boolean);
    const body = Object.fromEntries(formData.entries());
    body.lessons = lessons;
    try {
      const { course } = await apiRequest("/api/courses", { method: "POST", body: JSON.stringify(body) });
      onCreated(course);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="auth-modal create-course-modal" role="dialog" aria-modal="true" aria-labelledby="create-course-title">
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
        <span className="eyebrow">TEACH WHAT YOU KNOW</span>
        <h2 id="create-course-title">Create a course</h2>
        <p className="modal-copy">Your course will be published in the Learnwell catalog under {user.name}.</p>
        <form onSubmit={createCourse}>
          <label htmlFor="course-title">Course title</label>
          <input id="course-title" name="title" placeholder="e.g. The fundamentals of..." minLength={4} maxLength={100} required />
          <label htmlFor="course-description">What will learners learn?</label>
          <textarea id="course-description" name="description" rows="3" placeholder="Describe the practical skills learners will build." minLength={20} maxLength={600} required />
          <div className="form-row">
            <div><label htmlFor="course-category">Category</label><select id="course-category" name="category" required>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></div>
            <div><label htmlFor="course-level">Level</label><select id="course-level" name="level"><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All levels</option></select></div>
          </div>
          <div className="form-row">
            <div><label htmlFor="course-duration">Duration</label><input id="course-duration" name="duration" placeholder="4 weeks" maxLength="30" required /></div>
            <div><label htmlFor="course-organization">Organization <span>(optional)</span></label><input id="course-organization" name="organization" placeholder="Your studio or company" maxLength="80" /></div>
          </div>
          <label htmlFor="course-lessons">Lesson titles <span>(one per line, up to 20)</span></label>
          <textarea id="course-lessons" name="lessons" rows="4" placeholder={"Welcome and course overview\nYour first core skill\nPut it into practice"} required />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary modal-submit" type="submit" disabled={busy}>{busy ? "Publishing…" : "Publish course"} {!busy && <Icon name="arrow" size={18} />}</button>
        </form>
        <p className="modal-terms">Courses are free in this MVP. Certificates are issued after all lessons are completed.</p>
      </section>
    </div>
  );
}

function CourseCard({ course, onEnroll }) {
  return (
    <article className="course-card">
      <div className={`course-image ${course.accent}`}>
        <img src={course.image} alt="" loading="lazy" />
        <span className="course-level">{course.level}</span>
        <button
          className="play-button"
          type="button"
          aria-label={`Learn about ${course.title}`}
          onClick={() => onEnroll(course)}
        >
          <Icon name="play" size={18} />
        </button>
      </div>
      <div className="course-content">
        <div className="course-organization">{course.organization}</div>
        <h3>{course.title}</h3>
        <p className="course-instructor">with {course.instructor}</p>
        <p className="course-description">{course.description}</p>
        <div className="course-meta">
          <span><Icon name="star" size={15} /> <strong>{course.rating}</strong> <span className="review-count">({course.reviews})</span></span>
          <span><Icon name="clock" size={15} /> {course.duration}</span>
        </div>
        <div className="course-footer">
          <span><strong>{course.price}</strong> <span>/ course</span></span>
          <button type="button" onClick={() => onEnroll(course)} aria-label={`Enroll in ${course.title}`}>
            View course <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

function App() {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [accountError, setAccountError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All courses");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalCourse, setModalCourse] = useState(null);
  const [modalEnrollment, setModalEnrollment] = useState(null);
  const [authMode, setAuthMode] = useState("register");
  const [authIntent, setAuthIntent] = useState("learn");
  const [modalOpen, setModalOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    apiRequest("/api/me")
      .then(({ user: currentUser, enrollments: currentEnrollments }) => {
        setUser(currentUser);
        setEnrollments(currentEnrollments);
      })
      .catch((profileError) => {
        if (!profileError.message.includes("sign in") && !profileError.message.includes("expired")) {
          setAccountError(profileError.message);
        }
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (activeCategory !== "All courses") params.set("category", activeCategory);
    if (search.trim()) params.set("q", search.trim());

    setLoading(true);
    setError("");
    fetch(`/api/courses?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("We couldn’t load courses right now.");
        return response.json();
      })
      .then((data) => setCourses(data.courses))
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") setError(fetchError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [activeCategory, search]);

  const courseCount = useMemo(() => String(courses.length).padStart(2, "0"), [courses.length]);

  function openSignup(mode = "register", intent = "learn", course = null) {
    setAuthMode(mode);
    setAuthIntent(intent);
    setModalCourse(course);
    setModalEnrollment(null);
    setModalOpen(true);
    setDashboardOpen(false);
    setCreateCourseOpen(false);
    setMobileMenuOpen(false);
  }

  async function openCourse(course, existingEnrollment = null) {
    setMobileMenuOpen(false);
    setDashboardOpen(false);
    if (!user) {
      openSignup("register", "learn", course);
      return;
    }

    try {
      const { enrollment } = existingEnrollment
        ? { enrollment: existingEnrollment }
        : await apiRequest(`/api/enrollments/${course.id}`, { method: "PUT" });
      setModalCourse(course);
      setModalEnrollment(enrollment);
      setModalOpen(true);
      updateEnrollment(enrollment);
    } catch (requestError) {
      setAccountError(requestError.message);
    }
  }

  function updateEnrollment(enrollment) {
    setEnrollments((current) => {
      const next = current.filter((item) => item.course.id !== enrollment.course.id);
      return [...next, enrollment];
    });
  }

  function handleAuthenticated(authenticatedUser, intent) {
    setUser(authenticatedUser);
    setAccountError("");
    apiRequest("/api/me")
      .then(({ enrollments: currentEnrollments }) => setEnrollments(currentEnrollments))
      .catch((profileError) => setAccountError(profileError.message));
    if (intent === "teach") {
      setModalOpen(false);
      setCreateCourseOpen(true);
    }
  }

  function startCourseCreation() {
    if (user) {
      setCreateCourseOpen(true);
      setModalOpen(false);
      setDashboardOpen(false);
    } else {
      openSignup("register", "teach");
    }
    setMobileMenuOpen(false);
  }

  async function signOut() {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      setUser(null);
      setEnrollments([]);
      setDashboardOpen(false);
    } catch (requestError) {
      setAccountError(requestError.message);
    }
  }

  function scrollToCourses() {
    document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div id="top">
      <div className="announcement">
        <span className="announcement-pill">NEW</span>
        <span>Big goals deserve a little momentum. <strong>Start a new skill today.</strong></span>
        <button type="button" onClick={scrollToCourses} aria-label="Explore courses"><Icon name="arrow" size={16} /></button>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <Logo />
          <nav className={mobileMenuOpen ? "main-nav nav-open" : "main-nav"} aria-label="Main navigation">
            <a href="#courses" onClick={() => setMobileMenuOpen(false)}>Explore</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#for-teams" onClick={() => setMobileMenuOpen(false)}>For teams</a>
            <a href="#teach" onClick={(event) => { event.preventDefault(); startCourseCreation(); }}>Teach</a>
          </nav>
          <div className="header-actions">
            {user ? (
              <>
                <button className="text-button sign-in" type="button" onClick={() => setDashboardOpen(true)}>My learning</button>
                <button className="button button-dark header-cta" type="button" onClick={signOut}>Sign out</button>
              </>
            ) : (
              <>
                <button className="text-button sign-in" type="button" onClick={() => openSignup("login")}>Log in</button>
                <button className="button button-dark header-cta" type="button" onClick={() => openSignup()}>Get started <Icon name="arrow" size={17} /></button>
              </>
            )}
          </div>
          <button className="icon-button mobile-menu" type="button" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} onClick={() => setMobileMenuOpen((open) => !open)}>
            <Icon name={mobileMenuOpen ? "close" : "menu"} />
          </button>
        </div>
      </header>
      {accountError && <div className="account-notice" role="alert">{accountError}<button type="button" onClick={() => setAccountError("")} aria-label="Dismiss message"><Icon name="close" size={15} /></button></div>}

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> LEARNING THAT MOVES YOU</div>
            <h1>Make your next<br />move a <span>smart one.</span></h1>
            <p className="hero-description">Build real-world skills, learn from people who do the work, and earn credentials that take you further.</p>
            <div className="hero-actions">
              <button className="button button-primary" type="button" onClick={scrollToCourses}>Find your next course <Icon name="arrow" size={18} /></button>
              <a className="play-link" href="#how-it-works"><span className="play-link-icon"><Icon name="play" size={16} /></span> See how it works</a>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack" aria-hidden="true">
                <span>AM</span><span>JK</span><span>RL</span><span>+</span>
              </div>
              <div><strong>Join 2.4M+ curious minds</strong><small>Learning something new every day</small></div>
            </div>
          </div>
          <div className="hero-art" aria-label="A learner studying at a sunny desk">
            <img className="hero-photo" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=90" alt="Learners sharing ideas around a laptop" />
            <div className="art-shape art-shape-one" />
            <div className="art-shape art-shape-two" />
            <div className="floating-card certificate-card">
              <span className="certificate-icon"><Icon name="check" size={19} /></span>
              <span><strong>New skills, made official</strong><small>Certificates that open doors</small></span>
            </div>
            <div className="floating-card progress-card">
              <div className="progress-card-top"><span className="progress-dot" /><span>WEEKLY PROGRESS</span></div>
              <strong>You're on a roll.</strong>
              <div className="progress-bars"><i /><i /><i /><i /><i /><i /><i /></div>
              <small>4 days of learning this week</small>
            </div>
            <span className="art-caption">A little progress adds up.</span>
          </div>
          <div className="hero-bottom-note"><span>01</span> / 03 <span className="note-line" /> GROW AT YOUR OWN PACE</div>
        </section>

        <section className="trust-strip" aria-label="Learner impact">
          <p>Good things happen when you keep learning.</p>
          <div><strong>2.4M+</strong><span>learners worldwide</span></div>
          <div><strong>180+</strong><span>countries reached</span></div>
          <div><strong>4.8<span className="metric-star">★</span></strong><span>average course rating</span></div>
        </section>

        <section className="courses-section section-wrap" id="courses">
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT BIG THING</div>
              <h2>Skills worth<br className="desktop-break" /> showing up for.</h2>
            </div>
            <div className="section-intro">
              <p>Practical courses, thoughtful teachers, and a community rooting for your progress.</p>
              <a href="#all-courses" onClick={() => setActiveCategory("All courses")}>Browse all courses <Icon name="arrow" size={17} /></a>
            </div>
          </div>
          <div className="course-tools">
            <div className="category-tabs" role="tablist" aria-label="Filter courses by category">
              {categories.map((category) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category}
                  className={activeCategory === category ? "category-tab active" : "category-tab"}
                  key={category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <label className="search-box">
              <Icon name="search" size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="What do you want to learn?" aria-label="Search courses" />
              <span>⌘ K</span>
            </label>
          </div>
          <div className="results-label" id="all-courses">
            <span>{activeCategory === "All courses" ? "POPULAR RIGHT NOW" : `${activeCategory.toUpperCase()} COURSES`}</span>
            <span>{loading ? "Loading…" : `${courseCount} COURSES`}</span>
          </div>
          {error ? (
            <div className="empty-state" role="alert">{error} Please refresh the page to try again.</div>
          ) : loading ? (
            <div className="course-grid" aria-label="Loading courses">
              {Array.from({ length: 4 }, (_, index) => <div className="course-skeleton" key={index} />)}
            </div>
          ) : courses.length ? (
            <div className="course-grid">
              {courses.map((course) => <CourseCard key={course.id} course={course} onEnroll={openCourse} />)}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-search"><Icon name="search" size={21} /></span>
              <strong>No courses found just yet.</strong>
              <span>Try a different search or explore all of our courses.</span>
              <button type="button" className="text-link" onClick={() => { setSearch(""); setActiveCategory("All courses"); }}>Clear filters</button>
            </div>
          )}
          <div className="browse-bottom">
            <span>Showing {courses.length} thoughtfully made courses</span>
            <button className="button button-outline" type="button" onClick={() => setActiveCategory("All courses")}>Explore all learning <Icon name="arrow" size={17} /></button>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="how-visual">
            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85" alt="A learner working through an online lesson" loading="lazy" />
            <div className="learning-sticker"><span>LEARN<br />A LITTLE.<br /><b>GO A LOT.</b></span></div>
            <div className="completion-note"><span className="completion-check"><Icon name="check" size={17} /></span><span><strong>Look what you did.</strong><small>Certificate earned</small></span></div>
          </div>
          <div className="how-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> SMALL STEPS. BIG MOMENTUM.</div>
            <h2>Learn on your terms.<br /><span>Grow for real.</span></h2>
            <p className="how-lede">A new skill should fit your life, not the other way around. Make progress in the pockets of time you already have.</p>
            <div className="steps">
              <div className="step"><span>01</span><div><strong>Pick a direction</strong><p>Choose a skill, a goal, or simply something you’re curious about.</p></div></div>
              <div className="step"><span>02</span><div><strong>Learn from the doers</strong><p>Get practical guidance from instructors who know the work inside out.</p></div></div>
              <div className="step"><span>03</span><div><strong>Make it yours</strong><p>Practice as you go, celebrate the wins, and share your certificate proudly.</p></div></div>
            </div>
            <button className="text-link how-link" type="button" onClick={scrollToCourses}>Find a course to get started <Icon name="arrow" size={17} /></button>
          </div>
        </section>

        <section className="team-banner" id="for-teams">
          <div className="team-decoration">LW</div>
          <div><span className="eyebrow">FOR TEAMS WITH BIG IDEAS</span><h2>Make learning part<br />of how you work.</h2></div>
          <p>Give your people space to grow with flexible learning paths built around the skills your team needs next.</p>
          <button className="button button-light" type="button" onClick={() => openSignup()}>Explore team learning <Icon name="arrow" size={17} /></button>
        </section>

        <section className="closing-cta">
          <div className="eyebrow"><span className="eyebrow-line" /> THE FUTURE IS A SKILL AWAY</div>
          <h2>Curiosity looks good<br />on <span>you.</span></h2>
          <p>Wherever you’re headed, take the next step with Learnwell.</p>
          <button className="button button-primary" type="button" onClick={() => openSignup()}>Start learning for free <Icon name="arrow" size={18} /></button>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-col"><Logo /><p>A little learning can take you anywhere.</p><div className="social-links"><a href="#top" aria-label="Instagram">ig</a><a href="#top" aria-label="LinkedIn">in</a><a href="#top" aria-label="YouTube">yt</a></div></div>
          <div className="footer-column"><strong>Explore</strong><a href="#courses">All courses</a><a href="#courses">Career paths</a><a href="#courses">Certificates</a></div>
          <div className="footer-column"><strong>Learnwell</strong><a href="#how-it-works">Our approach</a><a href="#for-teams">For teams</a><a href="#top">About us</a></div>
          <div className="footer-column"><strong>Say hello</strong><a href="mailto:hello@learnwell.example">Contact</a><a href="#top">Help center</a><a href="#teach" onClick={(event) => { event.preventDefault(); startCourseCreation(); }}>Become an instructor</a></div>
          <div className="footer-newsletter"><strong>A little inspiration, now and then.</strong><span>Get good reads and new courses in your inbox.</span><form onSubmit={(event) => { event.preventDefault(); openSignup(); }}><input type="email" aria-label="Newsletter email address" placeholder="Your email address" required /><button aria-label="Subscribe"><Icon name="arrow" size={17} /></button></form></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Learnwell Learning, Inc.</span><div><a href="#top">Privacy</a><a href="#top">Terms</a><a href="#top">Accessibility</a></div><span>Made for your next chapter <span className="footer-heart">♥</span></span></div>
      </footer>

      {modalOpen && (
        <AuthModal
          key={`${modalCourse?.id || "auth"}-${authMode}`}
          course={modalCourse}
          enrollment={modalEnrollment}
          mode={authMode}
          intent={authIntent}
          onClose={() => setModalOpen(false)}
          onAuthenticated={handleAuthenticated}
          onEnrollmentUpdated={updateEnrollment}
        />
      )}
      {dashboardOpen && <LearningDashboard enrollments={enrollments} onClose={() => setDashboardOpen(false)} onOpenCourse={(item) => openCourse(item.course, item)} />}
      {createCourseOpen && <CreateCourseModal user={user} onClose={() => setCreateCourseOpen(false)} onCreated={(course) => { setCourses((current) => [course, ...current]); setCreateCourseOpen(false); }} />}
    </div>
  );
}

export default App;
