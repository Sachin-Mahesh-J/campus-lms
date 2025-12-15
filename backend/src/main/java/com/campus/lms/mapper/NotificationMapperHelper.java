package com.campus.lms.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class NotificationMapperHelper {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Named("jsonToMap")
    public Map<String, Object> jsonToMap(String json) {
        if (json == null || json.isEmpty()) {
            return new HashMap<>();
        }
        try {
            Map<String, Object> result = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
            return result != null ? result : new HashMap<>();
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
}

