package com.campus.lms.mapper;

import com.campus.lms.dto.attendance.AttendanceRecordDto;
import com.campus.lms.entity.AttendanceRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AttendanceMapper {
    @Mapping(target = "classSessionId", source = "classSession.id")
    @Mapping(target = "classSessionTitle", source = "classSession.title")
    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.fullName")
    @Mapping(target = "status", source = "status", defaultValue = "ABSENT")
    @Mapping(target = "recordedById", source = "recordedBy.id")
    @Mapping(target = "recordedByName", source = "recordedBy.fullName")
    AttendanceRecordDto toDto(AttendanceRecord record);
}

