package com.campus.lms.controller;

import com.campus.lms.dto.session.ClassSessionDto;
import com.campus.lms.dto.session.ClassSessionRequest;
import com.campus.lms.service.ClassSessionService;
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
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class ClassSessionController {

    private final ClassSessionService classSessionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Page<ClassSessionDto>> listSessions(
            @RequestParam UUID batchId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(classSessionService.listSessions(batchId, search, pageable));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ClassSessionDto> createSession(@Valid @RequestBody ClassSessionRequest request) {
        return ResponseEntity.ok(classSessionService.createSession(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<ClassSessionDto> getSession(@PathVariable UUID id) {
        return ResponseEntity.ok(classSessionService.getSession(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ClassSessionDto> updateSession(
            @PathVariable UUID id,
            @Valid @RequestBody ClassSessionRequest request) {
        return ResponseEntity.ok(classSessionService.updateSession(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Void> deleteSession(@PathVariable UUID id) {
        classSessionService.deleteSession(id);
        return ResponseEntity.ok().build();
    }
}

