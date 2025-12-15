package com.campus.lms.dto.session;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassSessionDto {
    private UUID id;
    private UUID batchId;
    private String batchName;
    private String title;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
}

