import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: undefined,
    code: '',
    title: '',
    description: '',
    department: '',
    credits: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
      });
      if (search) params.append('search', search);
      const response = await apiClient.get(`/courses?${params.toString()}`);
      setCourses(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setForm({
      id: undefined,
      code: '',
      title: '',
      description: '',
      department: '',
      credits: '',
      startDate: '',
      endDate: '',
    });
    setShowForm(true);
  };

  const openEditForm = (course) => {
    setForm({
      id: course.id,
      code: course.code,
      title: course.title,
      description: course.description ?? '',
      department: course.department ?? '',
      credits: course.credits != null ? String(course.credits) : '',
      startDate: course.startDate ?? '',
      endDate: course.endDate ?? '',
    });
    setShowForm(true);
  };

  const archiveCourse = async (course) => {
    if (course.archived) return;
    if (!window.confirm(`Archive course "${course.code} - ${course.title}"?`)) return;
    try {
      await apiClient.post(`/courses/${course.id}/archive`);
      toast.success('Course archived');
      fetchCourses();
    } catch {
      toast.error('Failed to archive course');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.title.trim()) {
      toast.error('Code and title are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim(),
        title: form.title.trim(),
        description: form.description.trim() || null,
        department: form.department.trim() || null,
        credits: form.credits ? Number(form.credits) : null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };

      if (form.id) {
        await apiClient.put(`/courses/${form.id}`, payload);
        toast.success('Course updated');
      } else {
        await apiClient.post('/courses', payload);
        toast.success('Course created');
      }

      setShowForm(false);
      fetchCourses();
    } catch {
      toast.error('Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="ui-display">Courses</h1>
          <p className="ui-muted">Create and manage courses across departments.</p>
        </div>
        <button className="ui-btn-primary" onClick={openCreateForm}>
          Create course
        </button>
      </div>

      {showForm && (
        <div className="ui-card ui-card-pad space-y-4">
          <div className="ui-card-header">
            <h2 className="ui-h2">{form.id ? 'Edit course' : 'Create course'}</h2>
            <span className="ui-pill">{form.id ? 'update' : 'new'}</span>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="ui-caption block mb-1">Code</label>
              <input
                type="text"
                className="ui-input"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="CS101"
              />
            </div>
            <div>
              <label className="ui-caption block mb-1">Title</label>
              <input
                type="text"
                className="ui-input"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Introduction to Computer Science"
              />
            </div>
            <div>
              <label className="ui-caption block mb-1">Department</label>
              <input
                type="text"
                className="ui-input"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className="ui-caption block mb-1">Credits</label>
              <input
                type="number"
                step="0.5"
                className="ui-input"
                value={form.credits}
                onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))}
                placeholder="3.0"
              />
            </div>
            <div>
              <label className="ui-caption block mb-1">Start date</label>
              <input
                type="date"
                className="ui-input"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="ui-caption block mb-1">End date</label>
              <input
                type="date"
                className="ui-input"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="ui-caption block mb-1">Description</label>
              <textarea
                className="ui-textarea h-24"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description for this course"
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="ui-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="ui-btn-primary"
              >
                {saving ? 'Saving...' : form.id ? 'Update Course' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ui-input"
        />
      </div>
      {loading ? (
        <div className="ui-card ui-card-pad text-center">Loading...</div>
      ) : (
        <div className="ui-card overflow-hidden">
          <ul className="divide-y divide-borderSubtle">
            {courses.map((course) => (
              <li key={course.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-textPrimary">
                      {course.code} - {course.title}
                    </div>
                    <div className="text-sm text-textSecondary flex items-center gap-2">
                      <span>{course.department}</span>
                      {course.archived ? <span className="ui-pill">archived</span> : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-textSecondary">
                    {course.credits != null ? <span className="ui-pill">{course.credits} credits</span> : null}
                    {!course.archived ? (
                      <button
                        type="button"
                        onClick={() => archiveCourse(course)}
                        className="ui-btn-secondary ui-btn-sm"
                      >
                        Archive
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => openEditForm(course)}
                      className="ui-btn-secondary ui-btn-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {courses.length === 0 && (
              <li>
                <div className="px-4 py-10 text-center text-sm text-textSecondary">
                  No courses found.
                </div>
              </li>
            )}
          </ul>
        </div>
      )}
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="ui-btn-secondary ui-btn-sm"
        >
          Previous
        </button>
        <span className="py-2 ui-caption">
          Page {page + 1} of {totalPages || 1}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages - 1}
          className="ui-btn-secondary ui-btn-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CoursesPage;

