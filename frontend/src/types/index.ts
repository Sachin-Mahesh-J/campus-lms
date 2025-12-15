export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresInSeconds: number;
  username: string;
  fullName: string;
  role: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string | null;
  department: string | null;
  credits: number | null;
  startDate: string | null;
  endDate: string | null;
  archived: boolean;
}

export interface Batch {
  id: string;
  courseId: string;
  name: string;
  academicYear: string;
  semester: number;
}

export interface Enrollment {
  id: string;
  batchId: string;
  studentId: string;
  studentName: string;
  enrolledAt: string;
  status: 'ACTIVE' | 'DROPPED';
}

export interface Assignment {
  id: string;
  batchId: string;
  batchName: string;
  title: string;
  description?: string;
  dueDate: string;
  maxPoints: number;
  allowResubmission: boolean;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  contentText?: string;
  filePath?: string;
  fileSize?: number;
  late: boolean;
  submissionNumber: number;
}

export interface Grade {
  id: string;
  submissionId: string;
  graderId: string;
  graderName: string;
  pointsAwarded: number;
  feedback?: string;
  gradedAt: string;
}

export interface ClassSession {
  id: string;
  batchId: string;
  batchName: string;
  title?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  location?: string;
}

export interface AttendanceRecord {
  id: string;
  classSessionId: string;
  classSessionTitle?: string;
  studentId: string;
  studentName: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  recordedAt: string;
  recordedById?: string;
  recordedByName?: string;
}

export interface CourseMaterial {
  id: string;
  batchId: string;
  batchName: string;
  title: string;
  filePath: string;
  fileSize?: number;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
}

export interface Dashboard {
  totalCourses?: number;
  totalAssignments?: number;
  pendingSubmissions?: number;
  completedAssignments?: number;
  attendanceRate?: number;
  totalBatches?: number;
  totalStudents?: number;
  pendingGradings?: number;
  totalUsers?: number;
  totalTeachers?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

