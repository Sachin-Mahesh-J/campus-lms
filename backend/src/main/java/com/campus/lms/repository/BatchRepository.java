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

    @Query("""
            SELECT DISTINCT b
            FROM Batch b
            JOIN Enrollment e ON e.batch = b
            WHERE e.student.id = :studentId
              AND e.status = 'ACTIVE'
              AND (:courseId IS NULL OR b.course.id = :courseId)
            """)
    Page<Batch> findEnrolledBatches(@Param("studentId") UUID studentId,
            @Param("courseId") UUID courseId,
            Pageable pageable);

    @Query("SELECT COUNT(b) FROM Batch b WHERE b.course.createdBy.id = :teacherId")
    long countByCourseCreatedById(@Param("teacherId") UUID teacherId);
}
