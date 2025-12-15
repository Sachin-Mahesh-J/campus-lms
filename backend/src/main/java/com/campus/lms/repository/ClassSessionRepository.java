package com.campus.lms.repository;

import com.campus.lms.entity.Batch;
import com.campus.lms.entity.ClassSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ClassSessionRepository extends JpaRepository<ClassSession, UUID> {

    List<ClassSession> findByBatchAndSessionDateBetween(Batch batch, LocalDate start, LocalDate end);

    Page<ClassSession> findByBatch(Batch batch, Pageable pageable);

    Page<ClassSession> findByBatchAndTitleContainingIgnoreCase(Batch batch, String title, Pageable pageable);
}


