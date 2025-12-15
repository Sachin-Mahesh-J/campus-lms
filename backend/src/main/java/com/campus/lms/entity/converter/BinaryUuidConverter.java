package com.campus.lms.entity.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.nio.ByteBuffer;
import java.util.UUID;

@Converter(autoApply = true)
public class BinaryUuidConverter implements AttributeConverter<UUID, byte[]> {

    @Override
    public byte[] convertToDatabaseColumn(UUID attribute) {
        if (attribute == null) {
            return null;
        }
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(attribute.getMostSignificantBits());
        bb.putLong(attribute.getLeastSignificantBits());
        return bb.array();
    }

    @Override
    public UUID convertToEntityAttribute(byte[] dbData) {
        if (dbData == null) {
            return null;
        }
        ByteBuffer bb = ByteBuffer.wrap(dbData);
        long most = bb.getLong();
        long least = bb.getLong();
        return new UUID(most, least);
    }
}


