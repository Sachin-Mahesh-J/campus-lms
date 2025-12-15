package com.campus.lms.repository;

import com.campus.lms.entity.Assignment;
import com.campus.lms.entity.Submission;
import com.campus.lms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<Submission, UUID> {

    List<Submission> findByAssignment(Assignment assignment);

    Page<Submission> findByAssignment(Assignment assignment, Pageable pageable);

    Page<Submission> findByStudent(User student, Pageable pageable);

    Optional<Submission> findTopByAssignmentAndStudentOrderBySubmissionNumberDesc(Assignment assignment, User student);

    long countByStudentId(UUID studentId);

    @Query("SELECT COUNT(s) FROM Submission s WHERE s.assignment.createdBy.id = :teacherId AND NOT EXISTS (SELECT g FROM Grade g WHERE g.submission = s)")
    long countPendingGradingsByTeacher(@Param("teacherId") UUID teacherId);
}


