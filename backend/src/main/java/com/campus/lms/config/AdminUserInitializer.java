package com.campus.lms.config;

import com.campus.lms.entity.User;
import com.campus.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        userRepository.findByUsername("admin@lms.local")
                .or(() -> userRepository.findByEmail("admin@lms.local"))
                .orElseGet(() -> {
                    User admin = User.builder()
                            .username("admin@lms.local")
                            .email("admin@lms.local")
                            .fullName("System Administrator")
                            .role(User.Role.ADMIN)
                            .enabled(true)
                            .emailVerified(true)
                            .passwordHash(passwordEncoder.encode("Admin123!"))
                            .build();
                    return userRepository.save(admin);
                });
    }
}


