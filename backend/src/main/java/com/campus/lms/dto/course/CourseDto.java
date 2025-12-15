package com.campus.lms.dto.course;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CourseDto {

    private UUID id;
    private String code;
    private String title;
    private String description;
    private String department;
    private BigDecimal credits;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean archived;
}


