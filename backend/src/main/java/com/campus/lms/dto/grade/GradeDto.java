package com.campus.lms.dto.grade;

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
public class GradeDto {
    private UUID id;
    private UUID submissionId;
    private UUID graderId;
    private String graderName;
    private BigDecimal pointsAwarded;
    private String feedback;
    private Instant gradedAt;
}

