package com.campus.lms.repository;

import com.campus.lms.entity.Notification;
import com.campus.lms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByRecipient(User recipient);

    Page<Notification> findByRecipient(User recipient, Pageable pageable);
}


