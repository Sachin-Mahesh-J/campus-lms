package com.campus.lms.dto.assignment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
public class AssignmentRequest {
    private UUID batchId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Due date is required")
    private Instant dueDate;

    @NotNull(message = "Max points is required")
    @Positive(message = "Max points must be positive")
    private BigDecimal maxPoints;

    private Boolean allowResubmission;
}

