package com.campus.lms.dto.user;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class UserDto {

    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private boolean enabled;
}


