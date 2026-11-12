CREATE TABLE users (
  id uuid PRIMARY KEY,
  name varchar(80) NOT NULL,
  email varchar(254) NOT NULL UNIQUE,
  password_salt char(32) NOT NULL,
  password_hash char(128) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id char(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sessions_expiry_idx ON sessions (expires_at);
CREATE INDEX sessions_user_idx ON sessions (user_id);

CREATE TABLE courses (
  id varchar(64) PRIMARY KEY,
  title varchar(100) NOT NULL,
  instructor varchar(80) NOT NULL,
  organization varchar(80) NOT NULL,
  category varchar(30) NOT NULL,
  level varchar(20) NOT NULL,
  duration varchar(30) NOT NULL,
  rating varchar(20) NOT NULL DEFAULT 'New',
  reviews varchar(20) NOT NULL DEFAULT '0',
  price varchar(20) NOT NULL DEFAULT 'Free',
  image text NOT NULL,
  accent varchar(20) NOT NULL,
  description varchar(600) NOT NULL,
  lessons jsonb NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX courses_category_created_idx ON courses (category, created_at DESC);
CREATE INDEX courses_created_idx ON courses (created_at DESC);

CREATE TABLE enrollments (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id varchar(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_lessons integer NOT NULL DEFAULT 0 CHECK (completed_lessons >= 0),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

CREATE INDEX enrollments_course_idx ON enrollments (course_id);

CREATE TABLE certificates (
  id varchar(32) PRIMARY KEY,
  verification_code varchar(12) NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id varchar(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  recipient_name varchar(80) NOT NULL,
  course_title varchar(100) NOT NULL,
  instructor varchar(80) NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX certificates_issued_idx ON certificates (issued_at DESC);
