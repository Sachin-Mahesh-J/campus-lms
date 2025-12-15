package com.campus.lms.mapper;

import com.campus.lms.dto.notification.NotificationDto;
import com.campus.lms.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = NotificationMapperHelper.class)
public interface NotificationMapper {
    @Mapping(target = "recipientId", source = "recipient.id")
    @Mapping(target = "payload", source = "payload", qualifiedByName = "jsonToMap")
    NotificationDto toDto(Notification notification);
}

