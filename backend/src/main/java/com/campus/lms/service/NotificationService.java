package com.campus.lms.service;

import com.campus.lms.dto.notification.NotificationDto;
import com.campus.lms.entity.Notification;
import com.campus.lms.entity.User;
import com.campus.lms.mapper.NotificationMapper;
import com.campus.lms.repository.NotificationRepository;
import com.campus.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Transactional(readOnly = true)
    public Page<NotificationDto> listMyNotifications(Pageable pageable) {
        User recipient = getCurrentUser();
        return notificationRepository.findByRecipient(recipient, pageable)
                .map(notificationMapper::toDto);
    }

    @Transactional
    public void markAsDelivered(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        User recipient = getCurrentUser();
        if (!notification.getRecipient().getId().equals(recipient.getId())) {
            throw new IllegalArgumentException("Notification does not belong to current user");
        }
        notification.setDelivered(true);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public NotificationDto getNotification(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        User recipient = getCurrentUser();
        if (!notification.getRecipient().getId().equals(recipient.getId())) {
            throw new IllegalArgumentException("Notification does not belong to current user");
        }
        return notificationMapper.toDto(notification);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }
}

