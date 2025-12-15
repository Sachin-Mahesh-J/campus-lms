package com.campus.lms.dto.assignment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentDto {
    private UUID id;
    private UUID batchId;
    private String batchName;
    private String title;
    private String description;
    private Instant dueDate;
    private BigDecimal maxPoints;
    private Boolean allowResubmission;
    private UUID createdById;
    private String createdByName;
    private Instant createdAt;
}

