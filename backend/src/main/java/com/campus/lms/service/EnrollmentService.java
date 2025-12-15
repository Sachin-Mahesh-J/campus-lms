package com.campus.lms.service;

import com.campus.lms.dto.enrollment.BulkEnrollRequest;
import com.campus.lms.dto.enrollment.EnrollmentDto;
import com.campus.lms.entity.Batch;
import com.campus.lms.entity.Enrollment;
import com.campus.lms.entity.User;
import com.campus.lms.mapper.EnrollmentMapper;
import com.campus.lms.repository.BatchRepository;
import com.campus.lms.repository.EnrollmentRepository;
import com.campus.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final BatchRepository batchRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EnrollmentMapper enrollmentMapper;
    private final AuditLogService auditLogService;

    @Transactional
    public List<EnrollmentDto> bulkEnroll(UUID batchId, BulkEnrollRequest request) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));

        List<EnrollmentDto> result = request.getStudentIds().stream()
                .map(studentId -> enrollOne(batch, studentId))
                .collect(Collectors.toList());

        auditLogService.record(
                null,
                "ENROLLMENT_BULK",
                "Batch",
                batch.getId(),
                "Enrolled " + result.size() + " students",
                null
        );
        return result;
    }

    private EnrollmentDto enrollOne(Batch batch, UUID studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));
        if (student.getRole() != User.Role.STUDENT) {
            throw new IllegalArgumentException("User is not a student: " + studentId);
        }
        return enrollmentRepository.findByBatchAndStudent(batch, student)
                .map(enrollmentMapper::toDto)
                .orElseGet(() -> {
                    Enrollment enrollment = Enrollment.builder()
                            .batch(batch)
                            .student(student)
                            .status(Enrollment.Status.ACTIVE)
                            .build();
                    enrollment = enrollmentRepository.save(enrollment);
                    return enrollmentMapper.toDto(enrollment);
                });
    }

    @Transactional(readOnly = true)
    public List<EnrollmentDto> listByBatch(UUID batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
        return enrollmentRepository.findByBatch(batch).stream()
                .map(enrollmentMapper::toDto)
                .collect(Collectors.toList());
    }
}


