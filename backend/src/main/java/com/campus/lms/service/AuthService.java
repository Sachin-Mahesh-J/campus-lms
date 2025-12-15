package com.campus.lms.service;

import com.campus.lms.dto.auth.ForgotPasswordRequest;
import com.campus.lms.dto.auth.LoginRequest;
import com.campus.lms.dto.auth.LoginResponse;
import com.campus.lms.dto.auth.ResetPasswordRequest;
import com.campus.lms.entity.RefreshToken;
import com.campus.lms.entity.User;
import com.campus.lms.repository.RefreshTokenRepository;
import com.campus.lms.repository.UserRepository;
import com.campus.lms.security.JwtTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Value("${app.security.jwt.refresh-token-validity-days}")
    private int refreshTokenValidityDays;

    // Simple in-memory rate limiter per IP for login
    private final Map<String, LoginRate> loginRates = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 10;
    private static final long WINDOW_SECONDS = 900; // 15 minutes

    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String clientIp = resolveClientIp(httpRequest);
        enforceRateLimit(clientIp);

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            registerFailure(clientIp);
            auditLogService.record(
                    null,
                    "LOGIN_FAILED",
                    "User",
                    null,
                    request.getUsernameOrEmail(),
                    clientIp
            );
            throw ex;
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        String accessToken = jwtTokenService.generateAccessToken(user);
        createAndSetRefreshToken(user, httpResponse);

        auditLogService.record(
                user,
                "LOGIN_SUCCESS",
                "User",
                user.getId(),
                null,
                clientIp
        );

        return LoginResponse.builder()
                .accessToken(accessToken)
                .expiresInSeconds(jwtTokenService.getAccessTokenValiditySeconds())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public LoginResponse refresh(String refreshToken, HttpServletResponse response) {
        if (!StringUtils.hasText(refreshToken)) {
            throw new BadCredentialsException("Missing refresh token");
        }
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));
        if (Boolean.TRUE.equals(token.getRevoked()) || token.getExpiryDate().isBefore(Instant.now())) {
            throw new BadCredentialsException("Refresh token expired or revoked");
        }
        User user = token.getUser();
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        String accessToken = jwtTokenService.generateAccessToken(user);
        createAndSetRefreshToken(user, response);
        return LoginResponse.builder()
                .accessToken(accessToken)
                .expiresInSeconds(jwtTokenService.getAccessTokenValiditySeconds())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        if (!StringUtils.hasText(refreshToken)) {
            return;
        }
        refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            auditLogService.record(
                    token.getUser(),
                    "LOGOUT",
                    "RefreshToken",
                    token.getId(),
                    null,
                    null
            );
        });
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String token = generatePasswordResetToken(user);
            String resetLink = "http://localhost:5173/reset-password?token=" + token;
            emailService.sendEmail(user.getEmail(), "LMS Password Reset",
                    "Click the following link to reset your password:\n" + resetLink);
            auditLogService.record(
                    user,
                    "PASSWORD_RESET_REQUEST",
                    "User",
                    user.getId(),
                    null,
                    null
            );
        });
    }

    public void resetPassword(ResetPasswordRequest request) {
        String decoded = new String(Base64.getUrlDecoder().decode(request.getToken()));
        String[] parts = decoded.split(":");
        if (parts.length != 3) {
            throw new BadCredentialsException("Invalid reset token");
        }
        String username = parts[0];
        long expiresEpoch = Long.parseLong(parts[1]);
        Instant expires = Instant.ofEpochSecond(expiresEpoch);
        if (Instant.now().isAfter(expires)) {
            throw new BadCredentialsException("Reset token expired");
        }
        String checksum = parts[2];
        String expected = Base64.getUrlEncoder().withoutPadding()
                .encodeToString((username + ":" + expiresEpoch + ":secret").getBytes());
        if (!expected.equals(checksum)) {
            throw new BadCredentialsException("Invalid reset token");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        validatePasswordPolicy(request.getNewPassword());
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.record(
                user,
                "PASSWORD_RESET",
                "User",
                user.getId(),
                null,
                null
        );
    }

    private String generatePasswordResetToken(User user) {
        Instant expires = Instant.now().plus(30, ChronoUnit.MINUTES);
        long epoch = expires.getEpochSecond();
        String checksum = Base64.getUrlEncoder().withoutPadding()
                .encodeToString((user.getUsername() + ":" + epoch + ":secret").getBytes());
        String tokenPayload = user.getUsername() + ":" + epoch + ":" + checksum;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenPayload.getBytes());
    }

    private void createAndSetRefreshToken(User user, HttpServletResponse response) {
        String tokenValue = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plus(refreshTokenValidityDays, ChronoUnit.DAYS);
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(tokenValue)
                .expiryDate(expiry)
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        String cookie = "refreshToken=" + tokenValue +
                "; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=" + (refreshTokenValidityDays * 24L * 60 * 60);
        response.addHeader("Set-Cookie", cookie);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xf)) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void enforceRateLimit(String ip) {
        LoginRate rate = loginRates.computeIfAbsent(ip, k -> new LoginRate());
        long now = Instant.now().getEpochSecond();
        if (now - rate.windowStart > WINDOW_SECONDS) {
            rate.windowStart = now;
            rate.attempts = 0;
        }
        if (rate.attempts >= MAX_ATTEMPTS) {
            throw new BadCredentialsException("Too many login attempts. Please try again later.");
        }
    }

    private void registerFailure(String ip) {
        LoginRate rate = loginRates.computeIfAbsent(ip, k -> new LoginRate());
        rate.attempts++;
    }

    private void validatePasswordPolicy(String password) {
        if (password.length() < 8 || !password.matches(".*[A-Za-z].*") || !password.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Password must be at least 8 characters and contain letters and numbers");
        }
    }

    private static class LoginRate {
        long windowStart = Instant.now().getEpochSecond();
        int attempts = 0;
    }
}


