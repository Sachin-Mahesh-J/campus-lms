package com.campus.lms.repository;

import com.campus.lms.entity.Grade;
import com.campus.lms.entity.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface GradeRepository extends JpaRepository<Grade, UUID> {

    Optional<Grade> findBySubmission(Submission submission);

    @Query("SELECT g FROM Grade g WHERE g.submission.assignment.id = :assignmentId")
    Page<Grade> findByAssignmentId(@Param("assignmentId") UUID assignmentId, Pageable pageable);
}


