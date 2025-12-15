package com.campus.lms.mapper;

import com.campus.lms.dto.grade.GradeDto;
import com.campus.lms.entity.Grade;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface GradeMapper {
    @Mapping(target = "submissionId", source = "submission.id")
    @Mapping(target = "graderId", source = "grader.id")
    @Mapping(target = "graderName", source = "grader.fullName")
    GradeDto toDto(Grade grade);
}

