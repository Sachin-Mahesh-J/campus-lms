package com.campus.lms.dto.auth;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LoginResponse {

    private String accessToken;
    private long expiresInSeconds;
    private String username;
    private String fullName;
    private String role;
}


