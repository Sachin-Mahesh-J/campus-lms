package com.campus.lms.repository;

import com.campus.lms.entity.AttendanceRecord;
import com.campus.lms.entity.ClassSession;
import com.campus.lms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    Optional<AttendanceRecord> findByClassSessionAndStudent(ClassSession classSession, User student);

    List<AttendanceRecord> findByStudent(User student);

    Page<AttendanceRecord> findByClassSession(ClassSession classSession, Pageable pageable);

    long countByStudentId(UUID studentId);

    long countByStudentIdAndStatus(UUID studentId, AttendanceRecord.Status status);
}


