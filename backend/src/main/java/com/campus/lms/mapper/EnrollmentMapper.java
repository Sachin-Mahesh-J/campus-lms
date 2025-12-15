package com.campus.lms.mapper;

import com.campus.lms.dto.enrollment.EnrollmentDto;
import com.campus.lms.entity.Enrollment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {

    @Mapping(target = "batchId", source = "batch.id")
    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.fullName")
    @Mapping(target = "status", expression = "java(enrollment.getStatus().name())")
    EnrollmentDto toDto(Enrollment enrollment);
}


