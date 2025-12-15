package com.campus.lms.dto.submission;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionDto {
    private UUID id;
    private UUID assignmentId;
    private String assignmentTitle;
    private UUID studentId;
    private String studentName;
    private Instant submittedAt;
    private String contentText;
    private String filePath;
    private Long fileSize;
    private String checksum;
    private Boolean late;
    private Integer submissionNumber;
}

