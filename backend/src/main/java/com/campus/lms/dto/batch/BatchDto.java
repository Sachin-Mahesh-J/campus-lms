package com.campus.lms.dto.batch;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class BatchDto {

    private UUID id;
    private UUID courseId;
    private String name;
    private String academicYear;
    private int semester;
}


