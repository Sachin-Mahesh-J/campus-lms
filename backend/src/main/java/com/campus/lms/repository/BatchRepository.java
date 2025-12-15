package com.campus.lms.repository;

import com.campus.lms.entity.Batch;
import com.campus.lms.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface BatchRepository extends JpaRepository<Batch, UUID> {

    Page<Batch> findByCourseAndNameContainingIgnoreCase(Course course, String name, Pageable pageable);

    @Query("SELECT COUNT(b) FROM Batch b WHERE b.course.createdBy.id = :teacherId")
    long countByCourseCreatedById(@Param("teacherId") UUID teacherId);
}


