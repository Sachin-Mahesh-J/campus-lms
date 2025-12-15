package com.campus.lms.dto.material;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseMaterialDto {
    private UUID id;
    private UUID batchId;
    private String batchName;
    private String title;
    private String filePath;
    private Long fileSize;
    private String checksum;
    private UUID uploadedById;
    private String uploadedByName;
    private Instant uploadedAt;
}

