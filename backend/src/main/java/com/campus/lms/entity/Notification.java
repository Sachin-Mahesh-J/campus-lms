package com.campus.lms.entity;

import com.campus.lms.entity.converter.BinaryUuidConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @Convert(converter = BinaryUuidConverter.class)
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false, columnDefinition = "BINARY(16)")
    private User recipient;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "title", length = 200)
    private String title;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "payload", columnDefinition = "JSON")
    private String payload;

    @Column(name = "sent_at", insertable = false, updatable = false)
    private Instant sentAt;

    @Column(name = "delivered")
    private Boolean delivered = Boolean.FALSE;

    @Column(name = "retry_count")
    private Integer retryCount = 0;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}


