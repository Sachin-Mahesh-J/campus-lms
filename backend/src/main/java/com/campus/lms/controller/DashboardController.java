package com.campus.lms.controller;

import com.campus.lms.dto.dashboard.DashboardDto;
import com.campus.lms.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<DashboardDto> getStudentDashboard() {
        return ResponseEntity.ok(dashboardService.getStudentDashboard());
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<DashboardDto> getTeacherDashboard() {
        return ResponseEntity.ok(dashboardService.getTeacherDashboard());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardDto> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }
}

