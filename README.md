# Campus Learning Management System (LMS)

A production-ready, single-campus Learning Management System built with Java 21, Spring Boot 3.3.x, React 18, TypeScript, and MySQL 8.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication with 15-minute access tokens
  - Refresh tokens stored in HttpOnly, Secure, SameSite=Strict cookies (30 days)
  - Role-based access control (Admin, Teacher, Student)
  - Password reset functionality

- **Course & Batch Management**
  - Create and manage courses
  - Organize courses into batches by academic year and semester
  - Archive courses

- **Student Enrollment**
  - Manual enrollment
  - Bulk enrollment via CSV or JSON

- **Class Scheduling & Attendance**
  - Create class sessions with date, time, and location
  - Bulk attendance recording
  - Track attendance status (Present, Absent, Late, Excused)

- **Assignments & Submissions**
  - Create assignments with due dates and max points
  - Support for text and file submissions
  - Resubmission support (configurable)
  - Automatic late submission detection

- **Grading & Feedback**
  - Grade submissions with points and feedback
  - View grades by assignment or student

- **Course Materials**
  - Upload teaching materials (files)
  - Download materials
  - Automatic file cleanup on deletion

- **Notifications**
  - Email notifications via SMTP
  - In-app notifications

- **Dashboards**
  - Role-specific dashboards (Admin, Teacher, Student)
  - Statistics and overview

- **Audit Logging**
  - Track all system actions
  - IP address logging

## Tech Stack

### Backend
- Java 21 (LTS)
- Spring Boot 3.3.5
- Spring Security
- Spring Data JPA
- MySQL 8.0+
- Maven
- Lombok
- MapStruct
- JJWT

### Frontend
- React 18
- TypeScript
- Vite
- React Router v6
- Axios
- Tailwind CSS
- React Hot Toast

## Prerequisites

- Java 21 JDK
- Maven 3.8+
- Node.js 18+ and npm
- MySQL 8.0+ (XAMPP or Docker)
- SMTP server (for email notifications - optional for development)

## Setup Instructions

### 1. Database Setup

#### Option A: Using XAMPP
1. Start XAMPP and ensure MySQL is running
2. Create a new database:
   ```sql
   CREATE DATABASE campus_lms;
   ```

#### Option B: Using Docker
```bash
docker run --name mysql-lms -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=campus_lms -p 3306:3306 -d mysql:8.0
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Update database configuration in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/campus_lms?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

3. Configure SMTP settings (optional for development):
   ```properties
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your_email@gmail.com
   spring.mail.password=your_app_password
   spring.mail.properties.mail.smtp.auth=true
   spring.mail.properties.mail.smtp.starttls.enable=true
   ```

4. Run the database schema:
   ```bash
   mysql -u root -p campus_lms < src/main/resources/schema.sql
   mysql -u root -p campus_lms < src/main/resources/data.sql
   ```

5. Build and run the backend:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

### 4. Default Credentials

After running `data.sql`, the default admin user is created. The password is set by the `AdminUserInitializer` on first startup.

**Default Admin Credentials:**
- Username: `admin@lms.local`
- Password: `Admin123!`

## Project Structure

```
campus-lms/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/campus/lms/
│   │   │   │   ├── config/          # Security, JWT, CORS, Mail configs
│   │   │   │   ├── controller/      # REST controllers
│   │   │   │   ├── service/         # Business logic
│   │   │   │   ├── repository/      # Data access layer
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   ├── dto/             # Data transfer objects
│   │   │   │   ├── mapper/          # MapStruct mappers
│   │   │   │   ├── security/        # JWT filter, UserDetailsService
│   │   │   │   ├── util/            # FileStorageService, EmailService
│   │   │   │   └── exception/       # Exception handlers
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── application-dev.properties
│   │   │       ├── application-prod.properties
│   │   │       ├── schema.sql
│   │   │       └── data.sql
│   │   └── test/
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/          # API client and services
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React contexts (Auth)
│   │   ├── pages/        # Page components
│   │   ├── types/        # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Courses
- `GET /api/courses` - List courses (with pagination and search)
- `POST /api/courses` - Create course
- `GET /api/courses/{id}` - Get course
- `PUT /api/courses/{id}` - Update course
- `POST /api/courses/{id}/archive` - Archive course

### Batches
- `GET /api/batches` - List batches
- `POST /api/batches` - Create batch
- `GET /api/batches/{id}` - Get batch
- `PUT /api/batches/{id}` - Update batch
- `DELETE /api/batches/{id}` - Delete batch
- `POST /api/batches/{id}/enroll-bulk` - Bulk enroll students

### Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/{id}` - Get assignment
- `PUT /api/assignments/{id}` - Update assignment
- `DELETE /api/assignments/{id}` - Delete assignment
- `POST /api/assignments/{id}/submit` - Submit assignment (Student)
- `POST /api/assignments/{assignmentId}/submissions/{submissionId}/grade` - Grade submission (Teacher)

### Class Sessions & Attendance
- `GET /api/sessions` - List class sessions
- `POST /api/sessions` - Create class session
- `GET /api/sessions/{id}` - Get class session
- `POST /api/sessions/{id}/attendance-bulk` - Record bulk attendance

### Course Materials
- `GET /api/materials` - List materials
- `POST /api/materials/upload` - Upload material (multipart)
- `GET /api/materials/{id}` - Get material
- `DELETE /api/materials/{id}` - Delete material

### Dashboards
- `GET /api/dashboard/student` - Student dashboard
- `GET /api/dashboard/teacher` - Teacher dashboard
- `GET /api/dashboard/admin` - Admin dashboard

All list endpoints support pagination:
- `?page=0&size=20&sort=createdAt,desc&search=keyword`

## File Storage

Files are stored in the `./storage/` directory:
- `./storage/uploads/materials/` - Course materials
- `./storage/uploads/submissions/` - Assignment submissions

Files are automatically deleted when the associated entity is deleted.

## Security

- JWT access tokens expire after 15 minutes
- Refresh tokens are stored in HttpOnly, Secure, SameSite=Strict cookies
- Refresh tokens expire after 30 days
- Rate limiting on login endpoint (10 attempts per IP per 15 minutes)
- Password policy: minimum 8 characters, at least 1 letter and 1 number
- All endpoints protected with `@PreAuthorize` annotations

## Development

### Running in Development Mode

Backend:
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Frontend:
```bash
cd frontend
npm run dev
```

### Building for Production

Backend:
```bash
cd backend
mvn clean package
java -jar target/lms-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

Frontend:
```bash
cd frontend
npm run build
# Serve the dist/ directory with a web server
```

## Configuration

### Backend Configuration

Key configuration properties in `application.properties`:
- `app.security.jwt.secret` - JWT secret (change in production!)
- `app.security.jwt.access-token-validity-seconds` - Access token validity (default: 900)
- `app.security.jwt.refresh-token-validity-days` - Refresh token validity (default: 30)
- `app.storage.base-path` - File storage base path (default: ./storage)
- `spring.servlet.multipart.max-file-size` - Max file size (default: 50MB)

### Frontend Configuration

The frontend is configured to proxy API requests to `http://localhost:8080` in development (see `vite.config.ts`).

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check database credentials in `application.properties`
- Verify database exists: `SHOW DATABASES;`

### Port Already in Use
- Backend: Change `server.port` in `application.properties`
- Frontend: Change port in `vite.config.ts` or use `npm run dev -- --port 3000`

### JWT Token Issues
- Clear browser cookies
- Check JWT secret in `application.properties`
- Verify token expiration settings

### File Upload Issues
- Check `app.storage.base-path` exists and is writable
- Verify `spring.servlet.multipart.max-file-size` is sufficient

## License

This project is proprietary software for single-campus use.

## Support

For issues and questions, please contact the development team.
