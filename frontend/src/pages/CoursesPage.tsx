import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Course, PageResponse } from '../types';
import toast from 'react-hot-toast';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    id?: string;
    code: string;
    title: string;
    description: string;
    department: string;
    credits: string;
    startDate: string;
    endDate: string;
  }>({
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
      const response = await apiClient.get<PageResponse<Course>>(`/courses?${params.toString()}`);
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

  const openEditForm = (course: Course) => {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.title.trim()) {
      toast.error('Code and title are required');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
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
    <div className="px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md"
          onClick={openCreateForm}
        >
          Create Course
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">
            {form.id ? 'Edit Course' : 'Create Course'}
          </h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="CS101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Introduction to Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
              <input
                type="number"
                step="0.5"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={form.credits}
                onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))}
                placeholder="3.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description for this course"
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {courses.map((course) => (
              <li key={course.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {course.code} - {course.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.department} {course.archived ? '(Archived)' : ''}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span>{course.credits != null ? `${course.credits} credits` : ''}</span>
                    <button
                      type="button"
                      onClick={() => openEditForm(course)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {courses.length === 0 && (
              <li>
                <div className="px-4 py-6 text-center text-sm text-gray-500">
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
          className="px-4 py-2 border rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="py-2">
          Page {page + 1} of {totalPages || 1}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages - 1}
          className="px-4 py-2 border rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CoursesPage;

