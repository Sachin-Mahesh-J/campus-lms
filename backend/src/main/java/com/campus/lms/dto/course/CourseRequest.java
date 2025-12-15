package com.campus.lms.dto.course;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class CourseRequest {

    @NotBlank
    private String code;

    @NotBlank
    private String title;

    private String description;

    private String department;

    private BigDecimal credits;

    private LocalDate startDate;

    private LocalDate endDate;
}


