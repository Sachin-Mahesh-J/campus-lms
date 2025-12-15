package com.campus.lms.dto.enrollment;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class BulkEnrollRequest {

    @NotEmpty
    private List<UUID> studentIds;
}


