package com.campus.lms.dto.attendance;

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
public class AttendanceRecordDto {
    private UUID id;
    private UUID classSessionId;
    private String classSessionTitle;
    private UUID studentId;
    private String studentName;
    private String status;
    private Instant recordedAt;
    private UUID recordedById;
    private String recordedByName;
}

