package com.campus.lms.repository;

import com.campus.lms.entity.RefreshToken;
import com.campus.lms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findByUserAndExpiryDateBefore(User user, Instant expiry);
}


