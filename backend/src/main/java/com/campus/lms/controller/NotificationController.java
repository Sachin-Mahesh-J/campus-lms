package com.campus.lms.controller;

import com.campus.lms.dto.notification.NotificationDto;
import com.campus.lms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Page<NotificationDto>> listMyNotifications(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(notificationService.listMyNotifications(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<NotificationDto> getNotification(@PathVariable UUID id) {
        return ResponseEntity.ok(notificationService.getNotification(id));
    }

    @PutMapping("/{id}/delivered")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Void> markAsDelivered(@PathVariable UUID id) {
        notificationService.markAsDelivered(id);
        return ResponseEntity.ok().build();
    }
}

