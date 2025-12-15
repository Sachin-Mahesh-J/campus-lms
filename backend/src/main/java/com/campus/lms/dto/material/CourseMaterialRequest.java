package com.campus.lms.dto.material;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CourseMaterialRequest {
    @NotNull(message = "Batch ID is required")
    private UUID batchId;

    @NotBlank(message = "Title is required")
    private String title;
}

