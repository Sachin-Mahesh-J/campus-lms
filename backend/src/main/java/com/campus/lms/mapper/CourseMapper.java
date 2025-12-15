package com.campus.lms.mapper;

import com.campus.lms.dto.course.CourseDto;
import com.campus.lms.entity.Course;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseMapper {

    CourseDto toDto(Course course);
}


