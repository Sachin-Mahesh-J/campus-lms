package com.campus.lms.mapper;

import com.campus.lms.dto.user.UserDto;
import com.campus.lms.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    UserDto toDto(User user);
}


