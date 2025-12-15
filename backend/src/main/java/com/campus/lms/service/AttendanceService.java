package com.campus.lms.service;

import com.campus.lms.dto.attendance.AttendanceRecordDto;
import com.campus.lms.dto.attendance.BulkAttendanceRequest;
import com.campus.lms.entity.AttendanceRecord;
import com.campus.lms.entity.ClassSession;
import com.campus.lms.entity.User;
import com.campus.lms.mapper.AttendanceMapper;
import com.campus.lms.repository.AttendanceRecordRepository;
import com.campus.lms.repository.ClassSessionRepository;
import com.campus.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ClassSessionRepository classSessionRepository;
    private final UserRepository userRepository;
    private final AttendanceMapper attendanceMapper;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<AttendanceRecordDto> listAttendance(UUID sessionId, Pageable pageable) {
        ClassSession session = classSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Class session not found"));
        return attendanceRecordRepository.findByClassSession(session, pageable)
                .map(attendanceMapper::toDto);
    }

    @Transactional
    public List<AttendanceRecordDto> recordBulkAttendance(UUID sessionId, BulkAttendanceRequest request) {
        ClassSession session = classSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Class session not found"));
        User recorder = getCurrentUser();

        List<AttendanceRecord> records = request.getRecords().stream()
                .map(recordRequest -> {
                    User student = userRepository.findById(recordRequest.getStudentId())
                            .orElseThrow(() -> new IllegalArgumentException("Student not found: " + recordRequest.getStudentId()));

                    AttendanceRecord existing = attendanceRecordRepository
                            .findByClassSessionAndStudent(session, student)
                            .orElse(null);

                    if (existing != null) {
                        existing.setStatus(AttendanceRecord.Status.valueOf(recordRequest.getStatus()));
                        existing.setRecordedBy(recorder);
                        return existing;
                    } else {
                        return AttendanceRecord.builder()
                                .classSession(session)
                                .student(student)
                                .status(AttendanceRecord.Status.valueOf(recordRequest.getStatus()))
                                .recordedBy(recorder)
                                .build();
                    }
                })
                .collect(Collectors.toList());

        records = attendanceRecordRepository.saveAll(records);

        auditLogService.record(
                recorder,
                "ATTENDANCE_BULK_RECORD",
                "ClassSession",
                session.getId(),
                "Recorded attendance for " + records.size() + " students",
                null
        );

        return records.stream().map(attendanceMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AttendanceRecordDto getAttendance(UUID id) {
        AttendanceRecord record = attendanceRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found"));
        return attendanceMapper.toDto(record);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }
}

