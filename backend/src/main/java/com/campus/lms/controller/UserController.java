package com.campus.lms.controller;

import com.campus.lms.dto.user.UserCreateRequest;
import com.campus.lms.dto.user.UserDto;
import com.campus.lms.dto.user.UserUpdateRequest;
import com.campus.lms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public Page<UserDto> listUsers(@RequestParam(value = "search", required = false) String search,
                                   Pageable pageable) {
        return userService.listUsers(search, pageable);
    }

    @PostMapping
    public UserDto createUser(@Valid @RequestBody UserCreateRequest request) {
        return userService.createUser(request);
    }

    @GetMapping("/{id}")
    public UserDto getUser(@PathVariable UUID id) {
        return userService.getUser(id);
    }

    @PutMapping("/{id}")
    public UserDto updateUser(@PathVariable UUID id, @Valid @RequestBody UserUpdateRequest request) {
        return userService.updateUser(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable UUID id) {
        userService.disableUser(id);
    }

    @DeleteMapping("/{id}/hard")
    public void hardDeleteUser(@PathVariable UUID id) {
        userService.deleteUserPermanent(id);
    }
}


