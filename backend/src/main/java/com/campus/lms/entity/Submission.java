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
@Table(name = "submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    @Convert(converter = BinaryUuidConverter.class)
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false, columnDefinition = "BINARY(16)")
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, columnDefinition = "BINARY(16)")
    private User student;

    @Column(name = "submitted_at", insertable = false, updatable = false)
    private Instant submittedAt;

    @Column(name = "content_text", columnDefinition = "TEXT")
    private String contentText;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "checksum", length = 64)
    private String checksum;

    // late is generated column in DB; map as read-only
    @Column(name = "late", insertable = false, updatable = false)
    private Boolean late;

    @Column(name = "submission_number")
    private Integer submissionNumber;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (submissionNumber == null) {
            submissionNumber = 1;
        }
    }
}


