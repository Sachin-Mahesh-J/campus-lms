package com.campus.lms.service;

import com.campus.lms.dto.batch.BatchDto;
import com.campus.lms.dto.batch.BatchRequest;
import com.campus.lms.entity.Batch;
import com.campus.lms.entity.Course;
import com.campus.lms.entity.User;
import com.campus.lms.mapper.BatchMapper;
import com.campus.lms.repository.BatchRepository;
import com.campus.lms.repository.CourseRepository;
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
public class BatchService {

        private final BatchRepository batchRepository;
        private final CourseRepository courseRepository;
        private final BatchMapper batchMapper;
        private final AuditLogService auditLogService;
        private final UserRepository userRepository;

        @Transactional(readOnly = true)
        public Page<BatchDto> listBatches(UUID courseId, Pageable pageable) {
                User currentUser = getCurrentUser();
                if (currentUser.getRole() == User.Role.STUDENT) {
                        return batchRepository.findEnrolledBatches(currentUser.getId(), courseId, pageable)
                                        .map(batchMapper::toDto);
                }
                if (courseId != null) {
                        Course course = courseRepository.findById(courseId)
                                        .orElseThrow(() -> new IllegalArgumentException("Course not found"));
                        return batchRepository.findByCourseAndNameContainingIgnoreCase(course, "", pageable)
                                        .map(batchMapper::toDto);
                }
                return batchRepository.findAll(pageable).map(batchMapper::toDto);
        }

        @Transactional
        public BatchDto createBatch(BatchRequest request) {
                Course course = courseRepository.findById(request.getCourseId())
                                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
                Batch batch = Batch.builder()
                                .course(course)
                                .name(request.getName())
                                .academicYear(request.getAcademicYear())
                                .semester(request.getSemester())
                                .build();
                batch = batchRepository.save(batch);
                auditLogService.record(
                                null,
                                "BATCH_CREATE",
                                "Batch",
                                batch.getId(),
                                batch.getName(),
                                null);
                return batchMapper.toDto(batch);
        }

        @Transactional
        public BatchDto updateBatch(UUID id, BatchRequest request) {
                Batch batch = batchRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
                if (!batch.getCourse().getId().equals(request.getCourseId())) {
                        Course course = courseRepository.findById(request.getCourseId())
                                        .orElseThrow(() -> new IllegalArgumentException("Course not found"));
                        batch.setCourse(course);
                }
                batch.setName(request.getName());
                batch.setAcademicYear(request.getAcademicYear());
                batch.setSemester(request.getSemester());
                batch = batchRepository.save(batch);
                auditLogService.record(
                                null,
                                "BATCH_UPDATE",
                                "Batch",
                                batch.getId(),
                                batch.getName(),
                                null);
                return batchMapper.toDto(batch);
        }

        @Transactional
        public void deleteBatch(UUID id) {
                Batch batch = batchRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
                batchRepository.delete(batch);
                auditLogService.record(
                                null,
                                "BATCH_DELETE",
                                "Batch",
                                batch.getId(),
                                batch.getName(),
                                null);
        }

        private User getCurrentUser() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                String username = auth.getName();
                return userRepository.findByUsername(username)
                                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        }
}
