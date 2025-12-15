package com.campus.lms.service;

import com.campus.lms.dto.user.UserCreateRequest;
import com.campus.lms.dto.user.UserDto;
import com.campus.lms.dto.user.UserUpdateRequest;
import com.campus.lms.entity.User;
import com.campus.lms.mapper.UserMapper;
import com.campus.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<UserDto> listUsers(String search, Pageable pageable) {
        Page<User> page;
        if (StringUtils.hasText(search)) {
            String q = search.toLowerCase(Locale.ROOT);
            page = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q, pageable);
        } else {
            page = userRepository.findAll(pageable);
        }
        return page.map(userMapper::toDto);
    }

    @Transactional
    public UserDto createUser(UserCreateRequest request) {
        User actor = getCurrentUser();
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .role(User.Role.valueOf(request.getRole()))
                .enabled(true)
                .emailVerified(false)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();
        user = userRepository.save(user);
        auditLogService.record(
                actor,
                "USER_CREATE",
                "User",
                user.getId(),
                user.getUsername(),
                null
        );
        return userMapper.toDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto updateUser(UUID id, UserUpdateRequest request) {
        User actor = getCurrentUser();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setRole(User.Role.valueOf(request.getRole()));

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        user = userRepository.save(user);

        auditLogService.record(
                actor,
                "USER_UPDATE",
                "User",
                user.getId(),
                user.getUsername(),
                null
        );

        return userMapper.toDto(user);
    }

    /**
     * Soft delete - mark the user as disabled instead of removing the row to keep
     * referential integrity with related records.
     */
    @Transactional
    public void disableUser(UUID id) {
        User actor = getCurrentUser();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setEnabled(false);
        userRepository.save(user);

        auditLogService.record(
                actor,
                "USER_DISABLE",
                "User",
                user.getId(),
                user.getUsername(),
                null
        );
    }

    /**
     * Hard delete - physically remove the user record. This may fail if the user
     * is still referenced by other entities (e.g. courses, enrollments).
     */
    @Transactional
    public void deleteUserPermanent(UUID id) {
        User actor = getCurrentUser();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        try {
            userRepository.delete(user);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalStateException("Cannot hard delete user because it is referenced by other records");
        }

        auditLogService.record(
                actor,
                "USER_DELETE_HARD",
                "User",
                user.getId(),
                user.getUsername(),
                null
        );
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new IllegalStateException("No authenticated user in context");
        }
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }
}


