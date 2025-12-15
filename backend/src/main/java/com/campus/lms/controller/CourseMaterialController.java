package com.campus.lms.controller;

import com.campus.lms.dto.material.CourseMaterialDto;
import com.campus.lms.dto.material.CourseMaterialRequest;
import com.campus.lms.service.CourseMaterialService;
import com.campus.lms.util.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class CourseMaterialController {

    private final CourseMaterialService courseMaterialService;
    private final FileStorageService fileStorageService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Page<CourseMaterialDto>> listMaterials(
            @RequestParam UUID batchId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(courseMaterialService.listMaterials(batchId, search, pageable));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<CourseMaterialDto> uploadMaterial(
            @RequestPart @Valid CourseMaterialRequest request,
            @RequestPart MultipartFile file) {
        return ResponseEntity.ok(courseMaterialService.uploadMaterial(request, file));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<CourseMaterialDto> getMaterial(@PathVariable UUID id) {
        return ResponseEntity.ok(courseMaterialService.getMaterial(id));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Resource> downloadMaterial(@PathVariable UUID id) throws IOException {
        CourseMaterialDto material = courseMaterialService.getMaterial(id);
        Path path = fileStorageService.resolvePath(material.getFilePath());
        Resource resource = new InputStreamResource(Files.newInputStream(path));

        String filename = URLEncoder.encode(material.getTitle(), StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Void> deleteMaterial(@PathVariable UUID id) {
        courseMaterialService.deleteMaterial(id);
        return ResponseEntity.ok().build();
    }
}

