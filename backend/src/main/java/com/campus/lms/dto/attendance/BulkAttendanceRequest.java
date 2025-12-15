package com.campus.lms.dto.attendance;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BulkAttendanceRequest {
    @NotEmpty(message = "Records list cannot be empty")
    @Valid
    private List<AttendanceRecordRequest> records;

    @Data
    public static class AttendanceRecordRequest {
        @jakarta.validation.constraints.NotNull(message = "Student ID is required")
        private UUID studentId;

        @jakarta.validation.constraints.NotBlank(message = "Status is required")
        private String status;
    }
}

