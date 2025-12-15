package com.campus.lms.mapper;

import com.campus.lms.dto.material.CourseMaterialDto;
import com.campus.lms.entity.CourseMaterial;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CourseMaterialMapper {
    @Mapping(target = "batchId", source = "batch.id")
    @Mapping(target = "batchName", source = "batch.name")
    @Mapping(target = "uploadedById", source = "uploadedBy.id")
    @Mapping(target = "uploadedByName", source = "uploadedBy.fullName")
    CourseMaterialDto toDto(CourseMaterial material);
}

