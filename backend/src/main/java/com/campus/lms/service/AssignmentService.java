package com.campus.lms.service;

import com.campus.lms.dto.assignment.AssignmentDto;
import com.campus.lms.dto.assignment.AssignmentRequest;
import com.campus.lms.entity.Assignment;
import com.campus.lms.entity.Batch;
import com.campus.lms.entity.Enrollment;
import com.campus.lms.entity.User;
import com.campus.lms.mapper.AssignmentMapper;
import com.campus.lms.repository.AssignmentRepository;
import com.campus.lms.repository.BatchRepository;
import com.campus.lms.repository.EnrollmentRepository;
import com.campus.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final BatchRepository batchRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssignmentMapper assignmentMapper;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<AssignmentDto> listAssignments(UUID batchId, String search, Pageable pageable) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == User.Role.STUDENT) {
            String q = StringUtils.hasText(search) ? search.toLowerCase(Locale.ROOT) : null;
            return assignmentRepository.findVisibleAssignmentsForStudent(currentUser.getId(), batchId, q, pageable)
                    .map(assignmentMapper::toDto);
        }
        Page<Assignment> page;
        if (batchId != null) {
            Batch batch = batchRepository.findById(batchId)
                    .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
            if (StringUtils.hasText(search)) {
                String q = search.toLowerCase(Locale.ROOT);
                page = assignmentRepository.findByBatchAndTitleContainingIgnoreCase(batch, q, pageable);
            } else {
                page = assignmentRepository.findByBatch(batch, pageable);
            }
        } else {
            if (StringUtils.hasText(search)) {
                String q = search.toLowerCase(Locale.ROOT);
                page = assignmentRepository.findByTitleContainingIgnoreCase(q, pageable);
            } else {
                page = assignmentRepository.findAll(pageable);
            }
        }
        return page.map(assignmentMapper::toDto);
    }

    @Transactional
    public AssignmentDto createAssignment(AssignmentRequest request) {
        User creator = getCurrentUser();
        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
        Assignment assignment = Assignment.builder()
                .batch(batch)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .maxPoints(request.getMaxPoints())
                .allowResubmission(request.getAllowResubmission() != null ? request.getAllowResubmission() : false)
                .createdBy(creator)
                .build();
        assignment = assignmentRepository.save(assignment);
        auditLogService.record(
                creator,
                "ASSIGNMENT_CREATE",
                "Assignment",
                assignment.getId(),
                assignment.getTitle(),
                null);
        return assignmentMapper.toDto(assignment);
    }

    @Transactional
    public AssignmentDto updateAssignment(UUID id, AssignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
        if (request.getBatchId() != null) {
            Batch batch = batchRepository.findById(request.getBatchId())
                    .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
            assignment.setBatch(batch);
        }
        if (request.getTitle() != null) {
            assignment.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            assignment.setDescription(request.getDescription());
        }
        if (request.getDueDate() != null) {
            assignment.setDueDate(request.getDueDate());
        }
        if (request.getMaxPoints() != null) {
            assignment.setMaxPoints(request.getMaxPoints());
        }
        if (request.getAllowResubmission() != null) {
            assignment.setAllowResubmission(request.getAllowResubmission());
        }
        assignment = assignmentRepository.save(assignment);
        auditLogService.record(
                null,
                "ASSIGNMENT_UPDATE",
                "Assignment",
                assignment.getId(),
                assignment.getTitle(),
                null);
        return assignmentMapper.toDto(assignment);
    }

    @Transactional
    public void deleteAssignment(UUID id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
        assignmentRepository.delete(assignment);
        auditLogService.record(
                null,
                "ASSIGNMENT_DELETE",
                "Assignment",
                assignment.getId(),
                assignment.getTitle(),
                null);
    }

    @Transactional(readOnly = true)
    public AssignmentDto getAssignment(UUID id) {
        User currentUser = getCurrentUser();
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
        if (currentUser.getRole() == User.Role.STUDENT) {
            boolean enrolled = enrollmentRepository.existsByStudentIdAndBatchIdAndStatus(
                    currentUser.getId(),
                    assignment.getBatch().getId(),
                    Enrollment.Status.ACTIVE);
            if (!enrolled) {
                throw new AccessDeniedException("Access Denied");
            }
        }
        return assignmentMapper.toDto(assignment);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }
}
