package com.campus.lms.mapper;

import com.campus.lms.dto.batch.BatchDto;
import com.campus.lms.entity.Batch;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BatchMapper {

    @Mapping(target = "courseId", source = "course.id")
    BatchDto toDto(Batch batch);
}


