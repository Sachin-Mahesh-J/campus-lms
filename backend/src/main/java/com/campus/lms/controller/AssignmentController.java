package com.campus.lms.controller;

import com.campus.lms.dto.assignment.AssignmentDto;
import com.campus.lms.dto.assignment.AssignmentRequest;
import com.campus.lms.service.AssignmentService;
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
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Page<AssignmentDto>> listAssignments(
            @RequestParam(required = false) UUID batchId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(assignmentService.listAssignments(batchId, search, pageable));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<AssignmentDto> createAssignment(@Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.createAssignment(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<AssignmentDto> getAssignment(@PathVariable UUID id) {
        return ResponseEntity.ok(assignmentService.getAssignment(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<AssignmentDto> updateAssignment(
            @PathVariable UUID id,
            @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.updateAssignment(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Void> deleteAssignment(@PathVariable UUID id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok().build();
    }
}

