package com.campus.lms.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {

    @NotBlank
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String fullName;

    @NotNull
    private String role; // ADMIN/TEACHER/STUDENT

    /**
     * Optional. If provided and not blank, the user's password will be updated.
     */
    private String password;

    /**
     * Optional. If provided, the user's enabled flag will be updated.
     */
    private Boolean enabled;
}



