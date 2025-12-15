package com.campus.lms.controller;

import com.campus.lms.dto.course.CourseDto;
import com.campus.lms.dto.course.CourseRequest;
import com.campus.lms.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public Page<CourseDto> listCourses(@RequestParam(value = "search", required = false) String search,
                                       Pageable pageable) {
        return courseService.listCourses(search, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public CourseDto getCourse(@PathVariable UUID id) {
        return courseService.getCourse(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public CourseDto createCourse(@Valid @RequestBody CourseRequest request) {
        return courseService.createCourse(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public CourseDto updateCourse(@PathVariable UUID id, @Valid @RequestBody CourseRequest request) {
        return courseService.updateCourse(id, request);
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public void archiveCourse(@PathVariable UUID id) {
        courseService.archiveCourse(id);
    }
}


