package com.campus.lms.repository;

import com.campus.lms.entity.Batch;
import com.campus.lms.entity.Enrollment;
import com.campus.lms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    Optional<Enrollment> findByBatchAndStudent(Batch batch, User student);

    List<Enrollment> findByBatch(Batch batch);

    List<Enrollment> findByStudent(User student);

    boolean existsByStudentIdAndBatchIdAndStatus(UUID studentId, UUID batchId, Enrollment.Status status);

    long countByStudentIdAndStatus(UUID studentId, Enrollment.Status status);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.batch.course.createdBy.id = :teacherId")
    long countByTeacherBatches(@Param("teacherId") UUID teacherId);
}
