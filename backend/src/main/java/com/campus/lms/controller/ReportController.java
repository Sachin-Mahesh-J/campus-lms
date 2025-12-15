package com.campus.lms.controller;

import com.campus.lms.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Map<String, Object>> getAttendanceReport(
            @RequestParam(required = false) UUID batchId,
            @RequestParam(required = false) UUID studentId) {
        return ResponseEntity.ok(reportService.buildAttendanceReport(batchId, studentId));
    }

    @GetMapping("/grades")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Map<String, Object>> getGradesReport(
            @RequestParam(required = false) UUID batchId,
            @RequestParam(required = false) UUID studentId) {
        return ResponseEntity.ok(reportService.buildGradesReport(batchId, studentId));
    }
}

