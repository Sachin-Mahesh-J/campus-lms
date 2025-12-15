package com.campus.lms.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {
    // Student dashboard fields
    private Long totalCourses;
    private Long totalAssignments;
    private Long pendingSubmissions;
    private Long completedAssignments;
    private Long attendanceRate; // percentage

    // Teacher dashboard fields
    private Long totalBatches;
    private Long totalStudents;
    private Long pendingGradings;

    // Admin dashboard fields
    private Long totalUsers;
    private Long totalTeachers;
}

