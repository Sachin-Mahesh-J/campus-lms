package com.campus.lms.repository;

import com.campus.lms.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {

    Page<Course> findByTitleContainingIgnoreCaseOrCodeContainingIgnoreCase(String title, String code,
            Pageable pageable);

    @Query("""
            SELECT DISTINCT c
            FROM Course c
            JOIN Batch b ON b.course = c
            JOIN Enrollment e ON e.batch = b
            WHERE e.student.id = :studentId
              AND e.status = 'ACTIVE'
              AND (
                    :q IS NULL OR
                    LOWER(c.title) LIKE LOWER(CONCAT('%', :q, '%')) OR
                    LOWER(c.code) LIKE LOWER(CONCAT('%', :q, '%'))
              )
            """)
    Page<Course> findEnrolledCourses(@Param("studentId") UUID studentId,
            @Param("q") String q,
            Pageable pageable);

    long countByCreatedById(UUID createdById);
}
