package com.campus.lms.controller;

import com.campus.lms.dto.attendance.AttendanceRecordDto;
import com.campus.lms.dto.attendance.BulkAttendanceRequest;
import com.campus.lms.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/{sessionId}/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Page<AttendanceRecordDto>> listAttendance(
            @PathVariable UUID sessionId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(attendanceService.listAttendance(sessionId, pageable));
    }

    @PostMapping("/{sessionId}/attendance-bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<AttendanceRecordDto>> recordBulkAttendance(
            @PathVariable UUID sessionId,
            @Valid @RequestBody BulkAttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.recordBulkAttendance(sessionId, request));
    }

    @GetMapping("/attendance/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<AttendanceRecordDto> getAttendance(@PathVariable UUID id) {
        return ResponseEntity.ok(attendanceService.getAttendance(id));
    }
}

