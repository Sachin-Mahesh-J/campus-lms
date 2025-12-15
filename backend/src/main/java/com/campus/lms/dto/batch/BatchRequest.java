package com.campus.lms.dto.batch;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class BatchRequest {

    @NotNull
    private UUID courseId;

    @NotBlank
    private String name;

    @NotBlank
    private String academicYear;

    @NotNull
    private Integer semester;
}


