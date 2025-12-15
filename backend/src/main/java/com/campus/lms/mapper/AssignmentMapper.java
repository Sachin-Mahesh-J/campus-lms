package com.campus.lms.mapper;

import com.campus.lms.dto.assignment.AssignmentDto;
import com.campus.lms.entity.Assignment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssignmentMapper {
    @Mapping(target = "batchId", source = "batch.id")
    @Mapping(target = "batchName", source = "batch.name")
    @Mapping(target = "createdById", source = "createdBy.id")
    @Mapping(target = "createdByName", source = "createdBy.fullName")
    AssignmentDto toDto(Assignment assignment);
}

