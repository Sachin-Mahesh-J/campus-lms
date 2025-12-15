package com.campus.lms.service;

import com.campus.lms.dto.dashboard.DashboardDto;
import com.campus.lms.entity.User;
import com.campus.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final BatchRepository batchRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    @Transactional(readOnly = true)
    public DashboardDto getStudentDashboard() {
        User student = getCurrentUser();
        UUID studentId = student.getId();

        long totalCourses = enrollmentRepository.countByStudentIdAndStatus(studentId, com.campus.lms.entity.Enrollment.Status.ACTIVE);
        long totalAssignments = assignmentRepository.countByStudentEnrollments(studentId);
        long pendingSubmissions = assignmentRepository.countPendingSubmissionsByStudent(studentId);
        long completedAssignments = submissionRepository.countByStudentId(studentId);
        long attendanceRate = calculateAttendanceRate(studentId);

        return DashboardDto.builder()
                .totalCourses(totalCourses)
                .totalAssignments(totalAssignments)
                .pendingSubmissions(pendingSubmissions)
                .completedAssignments(completedAssignments)
                .attendanceRate(attendanceRate)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardDto getTeacherDashboard() {
        User teacher = getCurrentUser();
        UUID teacherId = teacher.getId();

        long totalCourses = courseRepository.countByCreatedById(teacherId);
        long totalBatches = batchRepository.countByCourseCreatedById(teacherId);
        long totalStudents = enrollmentRepository.countByTeacherBatches(teacherId);
        long pendingGradings = submissionRepository.countPendingGradingsByTeacher(teacherId);
        long totalAssignments = assignmentRepository.countByCreatedById(teacherId);

        return DashboardDto.builder()
                .totalCourses(totalCourses)
                .totalBatches(totalBatches)
                .totalStudents(totalStudents)
                .pendingGradings(pendingGradings)
                .totalAssignments(totalAssignments)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardDto getAdminDashboard() {
        long totalUsers = userRepository.count();
        long totalCourses = courseRepository.count();
        long totalBatches = batchRepository.count();
        long totalStudents = userRepository.countByRole(com.campus.lms.entity.User.Role.STUDENT);
        long totalTeachers = userRepository.countByRole(com.campus.lms.entity.User.Role.TEACHER);

        return DashboardDto.builder()
                .totalUsers(totalUsers)
                .totalCourses(totalCourses)
                .totalBatches(totalBatches)
                .totalStudents(totalStudents)
                .totalTeachers(totalTeachers)
                .build();
    }

    private long calculateAttendanceRate(UUID studentId) {
        long totalRecords = attendanceRecordRepository.countByStudentId(studentId);
        if (totalRecords == 0) {
            return 0;
        }
        long presentRecords = attendanceRecordRepository.countByStudentIdAndStatus(
                studentId, com.campus.lms.entity.AttendanceRecord.Status.PRESENT);
        return (presentRecords * 100) / totalRecords;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }
}

