package com.campus.lms.service;

import com.campus.lms.entity.AuditLog;
import com.campus.lms.entity.User;
import com.campus.lms.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void record(User actor, String action, String targetType, UUID targetId, String details, String ipAddress) {
        String detailsJson = toJson(details);
        AuditLog log = AuditLog.builder()
                .actor(actor)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .details(detailsJson)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(log);
    }

    private String toJson(String details) {
        if (details == null || details.isEmpty()) {
            return null;
        }
        // Minimal escaping for JSON string value
        String escaped = details
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
        return "{\"detail\":\"" + escaped + "\"}";
    }
}


