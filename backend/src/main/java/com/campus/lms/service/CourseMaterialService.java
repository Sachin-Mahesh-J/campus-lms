package com.campus.lms.service;

import com.campus.lms.dto.material.CourseMaterialDto;
import com.campus.lms.dto.material.CourseMaterialRequest;
import com.campus.lms.entity.Batch;
import com.campus.lms.entity.CourseMaterial;
import com.campus.lms.entity.User;
import com.campus.lms.mapper.CourseMaterialMapper;
import com.campus.lms.repository.BatchRepository;
import com.campus.lms.repository.CourseMaterialRepository;
import com.campus.lms.repository.UserRepository;
import com.campus.lms.util.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseMaterialService {

    private final CourseMaterialRepository courseMaterialRepository;
    private final BatchRepository batchRepository;
    private final UserRepository userRepository;
    private final CourseMaterialMapper courseMaterialMapper;
    private final FileStorageService fileStorageService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<CourseMaterialDto> listMaterials(UUID batchId, String search, Pageable pageable) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
        Page<CourseMaterial> page;
        if (StringUtils.hasText(search)) {
            String q = search.toLowerCase(Locale.ROOT);
            page = courseMaterialRepository.findByBatchAndTitleContainingIgnoreCase(batch, q, pageable);
        } else {
            page = courseMaterialRepository.findByBatch(batch, pageable);
        }
        return page.map(courseMaterialMapper::toDto);
    }

    @Transactional
    public CourseMaterialDto uploadMaterial(CourseMaterialRequest request, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
        User uploader = getCurrentUser();

        try {
            FileStorageService.StoredFile stored = fileStorageService.storeMaterial(file);
            CourseMaterial material = CourseMaterial.builder()
                    .batch(batch)
                    .title(request.getTitle())
                    .filePath(stored.relativePath())
                    .fileSize(stored.size())
                    .checksum(stored.checksum())
                    .uploadedBy(uploader)
                    .build();
            material = courseMaterialRepository.save(material);
            auditLogService.record(
                    uploader,
                    "MATERIAL_UPLOAD",
                    "CourseMaterial",
                    material.getId(),
                    material.getTitle(),
                    null
            );
            return courseMaterialMapper.toDto(material);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload material", e);
        }
    }

    @Transactional
    public void deleteMaterial(UUID id) {
        CourseMaterial material = courseMaterialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course material not found"));
        if (material.getFilePath() != null) {
            fileStorageService.delete(material.getFilePath());
        }
        courseMaterialRepository.delete(material);
        auditLogService.record(
                null,
                "MATERIAL_DELETE",
                "CourseMaterial",
                material.getId(),
                material.getTitle(),
                null
        );
    }

    @Transactional(readOnly = true)
    public CourseMaterialDto getMaterial(UUID id) {
        CourseMaterial material = courseMaterialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course material not found"));
        return courseMaterialMapper.toDto(material);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }
}

