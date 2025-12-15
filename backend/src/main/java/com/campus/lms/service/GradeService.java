package com.campus.lms.service;

import com.campus.lms.dto.grade.GradeDto;
import com.campus.lms.dto.grade.GradeRequest;
import com.campus.lms.entity.Grade;
import com.campus.lms.entity.Submission;
import com.campus.lms.entity.User;
import com.campus.lms.mapper.GradeMapper;
import com.campus.lms.repository.GradeRepository;
import com.campus.lms.repository.SubmissionRepository;
import com.campus.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final GradeMapper gradeMapper;
    private final AuditLogService auditLogService;

    @Transactional
    public GradeDto gradeSubmission(UUID assignmentId, UUID submissionId, GradeRequest request) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found"));
        if (!submission.getAssignment().getId().equals(assignmentId)) {
            throw new IllegalArgumentException("Submission does not belong to this assignment");
        }
        User grader = getCurrentUser();

        // Validate points
        if (request.getPointsAwarded().compareTo(submission.getAssignment().getMaxPoints()) > 0) {
            throw new IllegalArgumentException("Points awarded cannot exceed max points");
        }

        Grade grade = gradeRepository.findBySubmission(submission).orElse(null);
        if (grade != null) {
            grade.setPointsAwarded(request.getPointsAwarded());
            grade.setFeedback(request.getFeedback());
            grade.setGrader(grader);
        } else {
            grade = Grade.builder()
                    .submission(submission)
                    .grader(grader)
                    .pointsAwarded(request.getPointsAwarded())
                    .feedback(request.getFeedback())
                    .build();
        }
        grade = gradeRepository.save(grade);
        auditLogService.record(
                grader,
                "GRADE_SUBMISSION",
                "Grade",
                grade.getId(),
                submission.getAssignment().getTitle(),
                null
        );
        return gradeMapper.toDto(grade);
    }

    @Transactional(readOnly = true)
    public Page<GradeDto> listGrades(UUID assignmentId, Pageable pageable) {
        return gradeRepository.findByAssignmentId(assignmentId, pageable)
                .map(gradeMapper::toDto);
    }

    @Transactional(readOnly = true)
    public GradeDto getGrade(UUID id) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Grade not found"));
        return gradeMapper.toDto(grade);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }
}

