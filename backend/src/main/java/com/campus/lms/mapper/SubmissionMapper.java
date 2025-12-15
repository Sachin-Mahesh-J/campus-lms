package com.campus.lms.mapper;

import com.campus.lms.dto.submission.SubmissionDto;
import com.campus.lms.entity.Submission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SubmissionMapper {
    @Mapping(target = "assignmentId", source = "assignment.id")
    @Mapping(target = "assignmentTitle", source = "assignment.title")
    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.fullName")
    SubmissionDto toDto(Submission submission);
}

