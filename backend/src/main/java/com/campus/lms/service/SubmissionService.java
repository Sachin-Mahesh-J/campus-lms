package com.campus.lms.service;

import com.campus.lms.dto.submission.SubmissionDto;
import com.campus.lms.dto.submission.SubmissionRequest;
import com.campus.lms.entity.Assignment;
import com.campus.lms.entity.Submission;
import com.campus.lms.entity.User;
import com.campus.lms.mapper.SubmissionMapper;
import com.campus.lms.repository.AssignmentRepository;
import com.campus.lms.repository.SubmissionRepository;
import com.campus.lms.repository.UserRepository;
import com.campus.lms.util.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final SubmissionMapper submissionMapper;
    private final FileStorageService fileStorageService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<SubmissionDto> listSubmissions(UUID assignmentId, Pageable pageable) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
        return submissionRepository.findByAssignment(assignment, pageable)
                .map(submissionMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<SubmissionDto> listMySubmissions(Pageable pageable) {
        User student = getCurrentUser();
        return submissionRepository.findByStudent(student, pageable)
                .map(submissionMapper::toDto);
    }

    @Transactional
    public SubmissionDto submitAssignment(UUID assignmentId, SubmissionRequest request, MultipartFile file) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
        User student = getCurrentUser();

        // Check if resubmission is allowed
        Submission existing = submissionRepository
                .findTopByAssignmentAndStudentOrderBySubmissionNumberDesc(assignment, student)
                .orElse(null);

        if (existing != null && !Boolean.TRUE.equals(assignment.getAllowResubmission())) {
            throw new IllegalArgumentException("Resubmission not allowed for this assignment");
        }

        int nextSubmissionNumber = existing != null ? existing.getSubmissionNumber() + 1 : 1;

        String filePath = null;
        Long fileSize = null;
        String checksum = null;

        if (file != null && !file.isEmpty()) {
            try {
                FileStorageService.StoredFile stored = fileStorageService.storeSubmission(file);
                filePath = stored.relativePath();
                fileSize = stored.size();
                checksum = stored.checksum();
            } catch (Exception e) {
                throw new RuntimeException("Failed to store file", e);
            }
        }

        Submission submission = Submission.builder()
                .assignment(assignment)
                .student(student)
                .contentText(request.getContentText())
                .filePath(filePath)
                .fileSize(fileSize)
                .checksum(checksum)
                .submissionNumber(nextSubmissionNumber)
                .build();

        submission = submissionRepository.save(submission);
        auditLogService.record(
                student,
                "SUBMISSION_CREATE",
                "Submission",
                submission.getId(),
                assignment.getTitle(),
                null
        );
        return submissionMapper.toDto(submission);
    }

    @Transactional(readOnly = true)
    public SubmissionDto getSubmission(UUID id) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found"));
        return submissionMapper.toDto(submission);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }
}

