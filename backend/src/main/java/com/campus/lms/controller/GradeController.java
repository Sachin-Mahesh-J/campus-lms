package com.campus.lms.controller;

import com.campus.lms.dto.grade.GradeDto;
import com.campus.lms.dto.grade.GradeRequest;
import com.campus.lms.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    @PostMapping("/{assignmentId}/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<GradeDto> gradeSubmission(
            @PathVariable UUID assignmentId,
            @PathVariable UUID submissionId,
            @Valid @RequestBody GradeRequest request) {
        return ResponseEntity.ok(gradeService.gradeSubmission(assignmentId, submissionId, request));
    }

    @GetMapping("/{assignmentId}/grades")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Page<GradeDto>> listGrades(
            @PathVariable UUID assignmentId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(gradeService.listGrades(assignmentId, pageable));
    }

    @GetMapping("/grades/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<GradeDto> getGrade(@PathVariable UUID id) {
        return ResponseEntity.ok(gradeService.getGrade(id));
    }
}

