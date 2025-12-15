package com.campus.lms.service;

import com.campus.lms.dto.session.ClassSessionDto;
import com.campus.lms.dto.session.ClassSessionRequest;
import com.campus.lms.entity.Batch;
import com.campus.lms.entity.ClassSession;
import com.campus.lms.mapper.ClassSessionMapper;
import com.campus.lms.repository.BatchRepository;
import com.campus.lms.repository.ClassSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClassSessionService {

    private final ClassSessionRepository classSessionRepository;
    private final BatchRepository batchRepository;
    private final ClassSessionMapper classSessionMapper;

    @Transactional(readOnly = true)
    public Page<ClassSessionDto> listSessions(UUID batchId, String search, Pageable pageable) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
        Page<ClassSession> page;
        if (StringUtils.hasText(search)) {
            String q = search.toLowerCase(Locale.ROOT);
            page = classSessionRepository.findByBatchAndTitleContainingIgnoreCase(batch, q, pageable);
        } else {
            page = classSessionRepository.findByBatch(batch, pageable);
        }
        return page.map(classSessionMapper::toDto);
    }

    @Transactional
    public ClassSessionDto createSession(ClassSessionRequest request) {
        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
        ClassSession session = ClassSession.builder()
                .batch(batch)
                .title(request.getTitle())
                .sessionDate(request.getSessionDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .location(request.getLocation())
                .build();
        session = classSessionRepository.save(session);
        return classSessionMapper.toDto(session);
    }

    @Transactional
    public ClassSessionDto updateSession(UUID id, ClassSessionRequest request) {
        ClassSession session = classSessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class session not found"));
        if (request.getBatchId() != null) {
            Batch batch = batchRepository.findById(request.getBatchId())
                    .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
            session.setBatch(batch);
        }
        if (request.getTitle() != null) {
            session.setTitle(request.getTitle());
        }
        if (request.getSessionDate() != null) {
            session.setSessionDate(request.getSessionDate());
        }
        if (request.getStartTime() != null) {
            session.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            session.setEndTime(request.getEndTime());
        }
        if (request.getLocation() != null) {
            session.setLocation(request.getLocation());
        }
        session = classSessionRepository.save(session);
        return classSessionMapper.toDto(session);
    }

    @Transactional
    public void deleteSession(UUID id) {
        ClassSession session = classSessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class session not found"));
        classSessionRepository.delete(session);
    }

    @Transactional(readOnly = true)
    public ClassSessionDto getSession(UUID id) {
        ClassSession session = classSessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class session not found"));
        return classSessionMapper.toDto(session);
    }
}

