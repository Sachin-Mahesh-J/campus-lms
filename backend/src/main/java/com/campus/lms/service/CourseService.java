package com.campus.lms.service;

import com.campus.lms.dto.course.CourseDto;
import com.campus.lms.dto.course.CourseRequest;
import com.campus.lms.entity.Course;
import com.campus.lms.entity.User;
import com.campus.lms.mapper.CourseMapper;
import com.campus.lms.repository.CourseRepository;
import com.campus.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseMapper courseMapper;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<CourseDto> listCourses(String search, Pageable pageable) {
        Page<Course> page;
        if (StringUtils.hasText(search)) {
            String q = search.toLowerCase(Locale.ROOT);
            page = courseRepository.findByTitleContainingIgnoreCaseOrCodeContainingIgnoreCase(q, q, pageable);
        } else {
            page = courseRepository.findAll(pageable);
        }
        return page.map(courseMapper::toDto);
    }

    @Transactional
    public CourseDto createCourse(CourseRequest request) {
        User creator = getCurrentUser();
        Course course = Course.builder()
                .code(request.getCode())
                .title(request.getTitle())
                .description(request.getDescription())
                .department(request.getDepartment())
                .credits(request.getCredits())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdBy(creator)
                .archived(false)
                .build();
        course = courseRepository.save(course);
        auditLogService.record(
                creator,
                "COURSE_CREATE",
                "Course",
                course.getId(),
                course.getCode(),
                null
        );
        return courseMapper.toDto(course);
    }

    @Transactional
    public CourseDto updateCourse(UUID id, CourseRequest request) {
        User actor = getCurrentUser();
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        course.setCode(request.getCode());
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setDepartment(request.getDepartment());
        course.setCredits(request.getCredits());
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());
        course = courseRepository.save(course);
        auditLogService.record(
                actor,
                "COURSE_UPDATE",
                "Course",
                course.getId(),
                course.getCode(),
                null
        );
        return courseMapper.toDto(course);
    }

    @Transactional
    public void archiveCourse(UUID id) {
        User actor = getCurrentUser();
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        course.setArchived(true);
        courseRepository.save(course);
        auditLogService.record(
                actor,
                "COURSE_ARCHIVE",
                "Course",
                course.getId(),
                course.getCode(),
                null
        );
    }

    @Transactional(readOnly = true)
    public CourseDto getCourse(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        return courseMapper.toDto(course);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }
}


