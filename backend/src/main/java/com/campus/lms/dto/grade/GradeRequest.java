package com.campus.lms.dto.grade;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class GradeRequest {
    @NotNull(message = "Points awarded is required")
    @PositiveOrZero(message = "Points awarded must be positive or zero")
    private BigDecimal pointsAwarded;

    private String feedback;
}

