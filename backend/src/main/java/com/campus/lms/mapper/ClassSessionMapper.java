package com.campus.lms.mapper;

import com.campus.lms.dto.session.ClassSessionDto;
import com.campus.lms.entity.ClassSession;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ClassSessionMapper {
    @Mapping(target = "batchId", source = "batch.id")
    @Mapping(target = "batchName", source = "batch.name")
    ClassSessionDto toDto(ClassSession classSession);
}

