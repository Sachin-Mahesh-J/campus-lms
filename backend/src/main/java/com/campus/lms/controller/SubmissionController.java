package com.campus.lms.controller;

import com.campus.lms.dto.submission.SubmissionDto;
import com.campus.lms.dto.submission.SubmissionRequest;
import com.campus.lms.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping("/{assignmentId}/submissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Page<SubmissionDto>> listSubmissions(
            @PathVariable UUID assignmentId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(submissionService.listSubmissions(assignmentId, pageable));
    }

    @GetMapping("/my-submissions")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Page<SubmissionDto>> listMySubmissions(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(submissionService.listMySubmissions(pageable));
    }

    @PostMapping("/{assignmentId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionDto> submitAssignment(
            @PathVariable UUID assignmentId,
            @RequestPart(required = false) @Valid SubmissionRequest request,
            @RequestPart(required = false) MultipartFile file) {
        if (request == null) {
            request = new SubmissionRequest();
        }
        return ResponseEntity.ok(submissionService.submitAssignment(assignmentId, request, file));
    }

    @GetMapping("/submissions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<SubmissionDto> getSubmission(@PathVariable UUID id) {
        return ResponseEntity.ok(submissionService.getSubmission(id));
    }
}

