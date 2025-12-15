-- Database schema for Campus LMS (matches LMS-MVP-SPEC-FIXED-v2.0)

CREATE TABLE IF NOT EXISTS users (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN','TEACHER','STUDENT') NOT NULL,
    enabled BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    user_id BINARY(16) NOT NULL,
    token VARCHAR(500) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS courses (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    code VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    department VARCHAR(100),
    credits DECIMAL(3,1),
    start_date DATE,
    end_date DATE,
    created_by BINARY(16) NOT NULL,
    archived BOOLEAN DEFAULT false,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS batches (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    course_id BINARY(16) NOT NULL,
    name VARCHAR(100) NOT NULL,
    academic_year VARCHAR(9) NOT NULL,
    semester TINYINT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    batch_id BINARY(16) NOT NULL,
    student_id BINARY(16) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ACTIVE','DROPPED') DEFAULT 'ACTIVE',
    UNIQUE KEY uk_batch_student (batch_id, student_id),
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS class_sessions (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    batch_id BINARY(16) NOT NULL,
    title VARCHAR(200),
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(100),
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    class_session_id BINARY(16) NOT NULL,
    student_id BINARY(16) NOT NULL,
    status ENUM('PRESENT','ABSENT','LATE','EXCUSED') NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by BINARY(16),
    UNIQUE KEY uk_session_student (class_session_id, student_id),
    FOREIGN KEY (class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS course_materials (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    batch_id BINARY(16) NOT NULL,
    title VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    checksum VARCHAR(64),
    uploaded_by BINARY(16) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS assignments (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    batch_id BINARY(16) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    max_points DECIMAL(5,2) NOT NULL,
    allow_resubmission BOOLEAN DEFAULT false,
    created_by BINARY(16) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS submissions (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    assignment_id BINARY(16) NOT NULL,
    student_id BINARY(16) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content_text TEXT,
    file_path VARCHAR(500),
    file_size BIGINT,
    checksum VARCHAR(64),
    late BOOLEAN GENERATED ALWAYS AS (submitted_at > (SELECT due_date FROM assignments WHERE id = assignment_id)) STORED,
    submission_number INT DEFAULT 1,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id),
    UNIQUE KEY uk_assignment_student_latest (assignment_id, student_id, submission_number DESC)
);

CREATE TABLE IF NOT EXISTS grades (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    submission_id BINARY(16) NOT NULL UNIQUE,
    grader_id BINARY(16) NOT NULL,
    points_awarded DECIMAL(5,2) NOT NULL,
    feedback TEXT,
    graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (grader_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    recipient_id BINARY(16) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200),
    message TEXT,
    payload JSON,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered BOOLEAN DEFAULT false,
    retry_count TINYINT DEFAULT 0,
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id BINARY(16),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id BINARY(16),
    details JSON,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id)
);


