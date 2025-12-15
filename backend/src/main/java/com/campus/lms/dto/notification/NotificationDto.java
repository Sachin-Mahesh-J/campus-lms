package com.campus.lms.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private UUID id;
    private UUID recipientId;
    private String type;
    private String title;
    private String message;
    private Map<String, Object> payload;
    private Instant sentAt;
    private Boolean delivered;
    private Integer retryCount;
}

