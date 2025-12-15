package com.campus.lms.repository;

import com.campus.lms.entity.Batch;
import com.campus.lms.entity.CourseMaterial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, UUID> {

    List<CourseMaterial> findByBatch(Batch batch);

    Page<CourseMaterial> findByBatch(Batch batch, Pageable pageable);

    Page<CourseMaterial> findByBatchAndTitleContainingIgnoreCase(Batch batch, String title, Pageable pageable);
}


