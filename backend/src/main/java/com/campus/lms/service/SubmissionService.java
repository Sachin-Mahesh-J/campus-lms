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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.Instant;
import java.util.Objects;
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
        Assignment assignment = assignmentRepository.findById(Objects.requireNonNull(assignmentId, "assignmentId"))
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

        User currentUser = getCurrentUser();
        assertCanAccessAssignmentSubmissions(currentUser, assignment);

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
        Assignment assignment = assignmentRepository.findById(Objects.requireNonNull(assignmentId, "assignmentId"))
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

        submission = Objects.requireNonNull(submissionRepository.save(Objects.requireNonNull(submission, "submission")), "savedSubmission");
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
        Submission submission = submissionRepository.findById(Objects.requireNonNull(id, "id"))
                .orElseThrow(() -> new IllegalArgumentException("Submission not found"));
        User currentUser = getCurrentUser();
        assertCanAccessSubmission(currentUser, submission);
        return submissionMapper.toDto(submission);
    }

    @Transactional(readOnly = true)
    public SubmissionDownload getSubmissionDownload(UUID submissionId) {
        Submission submission = submissionRepository.findById(Objects.requireNonNull(submissionId, "submissionId"))
                .orElseThrow(() -> new IllegalArgumentException("Submission not found"));

        User currentUser = getCurrentUser();
        assertCanAccessSubmission(currentUser, submission);

        if (!StringUtils.hasText(submission.getFilePath())) {
            throw new IllegalArgumentException("No file attached for this submission");
        }

        Path path = fileStorageService.resolvePath(submission.getFilePath());

        String ext = "";
        String filePath = submission.getFilePath();
        int dot = filePath.lastIndexOf('.');
        if (dot != -1 && dot < filePath.length() - 1) {
            ext = filePath.substring(dot);
        }

        String safeAssignment = safeFilenamePart(submission.getAssignment().getTitle());
        String safeStudent = safeFilenamePart(submission.getStudent().getFullName());
        Instant submittedAt = submission.getSubmittedAt();
        String timestamp = submittedAt != null ? submittedAt.toString().replace(":", "-") : "unknown-time";
        String filename = safeAssignment + "-" + safeStudent + "-attempt" + submission.getSubmissionNumber() + "-" + timestamp + ext;

        return new SubmissionDownload(path, filename, submission.getFileSize());
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }

    private void assertCanAccessAssignmentSubmissions(User currentUser, Assignment assignment) {
        if (currentUser.getRole() == User.Role.ADMIN) return;
        if (currentUser.getRole() == User.Role.TEACHER) {
            if (assignment.getCreatedBy() == null || !assignment.getCreatedBy().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Access Denied");
            }
            return;
        }
        throw new AccessDeniedException("Access Denied");
    }

    private void assertCanAccessSubmission(User currentUser, Submission submission) {
        if (currentUser.getRole() == User.Role.ADMIN) return;
        if (currentUser.getRole() == User.Role.TEACHER) {
            Assignment assignment = submission.getAssignment();
            if (assignment == null || assignment.getCreatedBy() == null || !assignment.getCreatedBy().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Access Denied");
            }
            return;
        }
        if (currentUser.getRole() == User.Role.STUDENT) {
            if (submission.getStudent() == null || !submission.getStudent().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Access Denied");
            }
            return;
        }
        throw new AccessDeniedException("Access Denied");
    }

    private String safeFilenamePart(String input) {
        if (!StringUtils.hasText(input)) return "unknown";
        // keep it simple and filesystem-friendly
        String cleaned = input
                .trim()
                .replaceAll("[\\\\/:*?\"<>|]+", "_")
                .replaceAll("\\s+", "_")
                .trim();
        return cleaned.substring(0, Math.min(cleaned.length(), 60));
    }

    public record SubmissionDownload(Path path, String filename, Long size) {}
}

