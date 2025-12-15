package com.campus.lms.dto.enrollment;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class EnrollmentDto {

    private UUID id;
    private UUID batchId;
    private UUID studentId;
    private String studentName;
    private String status;
    private Instant enrolledAt;
}


