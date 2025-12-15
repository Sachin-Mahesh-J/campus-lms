package com.campus.lms.service;

import com.campus.lms.entity.AttendanceRecord;
import com.campus.lms.entity.Grade;
import com.campus.lms.repository.AttendanceRecordRepository;
import com.campus.lms.repository.GradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final GradeRepository gradeRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> buildAttendanceReport(UUID batchId, UUID studentId) {
        List<AttendanceRecord> records = attendanceRecordRepository.findAll();

        records = records.stream()
                .filter(r -> batchId == null || r.getClassSession().getBatch().getId().equals(batchId))
                .filter(r -> studentId == null || r.getStudent().getId().equals(studentId))
                .toList();

        long total = records.size();
        long present = records.stream().filter(r -> r.getStatus() == AttendanceRecord.Status.PRESENT).count();
        long absent = records.stream().filter(r -> r.getStatus() == AttendanceRecord.Status.ABSENT).count();
        long late = records.stream().filter(r -> r.getStatus() == AttendanceRecord.Status.LATE).count();
        long excused = records.stream().filter(r -> r.getStatus() == AttendanceRecord.Status.EXCUSED).count();

        long attendanceRate = total == 0 ? 0 : (present * 100) / total;

        Map<String, Object> result = new HashMap<>();
        if (batchId != null) {
            result.put("batchId", batchId);
        }
        if (studentId != null) {
            result.put("studentId", studentId);
        }
        result.put("totalRecords", total);
        result.put("present", present);
        result.put("absent", absent);
        result.put("late", late);
        result.put("excused", excused);
        result.put("attendanceRate", attendanceRate);

        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> buildGradesReport(UUID batchId, UUID studentId) {
        List<Grade> grades = gradeRepository.findAll();

        grades = grades.stream()
                .filter(g -> batchId == null || g.getSubmission().getAssignment().getBatch().getId().equals(batchId))
                .filter(g -> studentId == null || g.getSubmission().getStudent().getId().equals(studentId))
                .toList();

        long total = grades.size();

        double average = grades.stream()
                .map(Grade::getPointsAwarded)
                .mapToDouble(p -> p == null ? 0.0 : p.doubleValue())
                .average()
                .orElse(0.0);

        double min = grades.stream()
                .map(Grade::getPointsAwarded)
                .mapToDouble(p -> p == null ? 0.0 : p.doubleValue())
                .min()
                .orElse(0.0);

        double max = grades.stream()
                .map(Grade::getPointsAwarded)
                .mapToDouble(p -> p == null ? 0.0 : p.doubleValue())
                .max()
                .orElse(0.0);

        Map<String, Object> result = new HashMap<>();
        if (batchId != null) {
            result.put("batchId", batchId);
        }
        if (studentId != null) {
            result.put("studentId", studentId);
        }
        result.put("totalGrades", total);
        result.put("averagePoints", average);
        result.put("minPoints", min);
        result.put("maxPoints", max);

        return result;
    }
}


