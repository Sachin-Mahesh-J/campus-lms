package com.campus.lms.repository;

import com.campus.lms.entity.Assignment;
import com.campus.lms.entity.Batch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {

  List<Assignment> findByBatch(Batch batch);

  Page<Assignment> findByBatch(Batch batch, Pageable pageable);

  Page<Assignment> findByBatchAndTitleContainingIgnoreCase(Batch batch, String title, Pageable pageable);

  Page<Assignment> findByTitleContainingIgnoreCase(String title, Pageable pageable);

  @Query("""
      SELECT DISTINCT a
      FROM Assignment a
      JOIN Enrollment e ON e.batch = a.batch
      WHERE e.student.id = :studentId
        AND e.status = 'ACTIVE'
        AND (:batchId IS NULL OR a.batch.id = :batchId)
        AND (
              :q IS NULL OR
              LOWER(a.title) LIKE LOWER(CONCAT('%', :q, '%'))
        )
      """)
  Page<Assignment> findVisibleAssignmentsForStudent(@Param("studentId") UUID studentId,
      @Param("batchId") UUID batchId,
      @Param("q") String q,
      Pageable pageable);

  long countByCreatedById(UUID createdById);

  @Query("""
      SELECT COUNT(DISTINCT a)
      FROM Assignment a
      JOIN Enrollment e ON e.batch = a.batch
      WHERE e.student.id = :studentId
        AND e.status = 'ACTIVE'
      """)
  long countByStudentEnrollments(@Param("studentId") UUID studentId);

  @Query("""
      SELECT COUNT(DISTINCT a)
      FROM Assignment a
      JOIN Enrollment e ON e.batch = a.batch
      WHERE e.student.id = :studentId
        AND e.status = 'ACTIVE'
        AND NOT EXISTS (
              SELECT s
              FROM Submission s
              WHERE s.assignment = a
                AND s.student.id = :studentId
        )
      """)
  long countPendingSubmissionsByStudent(@Param("studentId") UUID studentId);
}
