package com.campus.lms.controller;

import com.campus.lms.dto.enrollment.BulkEnrollRequest;
import com.campus.lms.dto.enrollment.EnrollmentDto;
import com.campus.lms.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping("/{batchId}/enrollments")
    public List<EnrollmentDto> listEnrollments(@PathVariable UUID batchId) {
        return enrollmentService.listByBatch(batchId);
    }

    @PostMapping("/{batchId}/enroll-bulk")
    public List<EnrollmentDto> bulkEnroll(@PathVariable UUID batchId,
                                          @Valid @RequestBody BulkEnrollRequest request) {
        return enrollmentService.bulkEnroll(batchId, request);
    }
}


