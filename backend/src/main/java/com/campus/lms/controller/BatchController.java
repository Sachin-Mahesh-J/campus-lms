package com.campus.lms.controller;

import com.campus.lms.dto.batch.BatchDto;
import com.campus.lms.dto.batch.BatchRequest;
import com.campus.lms.service.BatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public Page<BatchDto> listBatches(@RequestParam(value = "courseId", required = false) UUID courseId,
            Pageable pageable) {
        return batchService.listBatches(courseId, pageable);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public BatchDto createBatch(@Valid @RequestBody BatchRequest request) {
        return batchService.createBatch(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public BatchDto updateBatch(@PathVariable UUID id, @Valid @RequestBody BatchRequest request) {
        return batchService.updateBatch(id, request);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public void deleteBatch(@PathVariable UUID id) {
        batchService.deleteBatch(id);
    }
}
