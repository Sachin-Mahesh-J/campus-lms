import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Batch, Course, PageResponse } from '../types';
import toast from 'react-hot-toast';

const BatchesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    id?: string;
    courseId: string;
    name: string;
    academicYear: string;
    semester: number;
  }>({
    courseId: '',
    name: '',
    academicYear: '',
    semester: 1,
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId, page]);

  const loadCourses = async () => {
    try {
      const params = new URLSearchParams({ page: '0', size: '100', sort: 'title,asc' });
      const response = await apiClient.get<PageResponse<Course>>(`/courses?${params.toString()}`);
      setCourses(response.data.content);
    } catch {
      toast.error('Failed to load courses');
    }
  };

  const loadBatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
      });
      if (selectedCourseId) {
        params.append('courseId', selectedCourseId);
      }
      const response = await apiClient.get<PageResponse<Batch>>(`/batches?${params.toString()}`);
      setBatches(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch {
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      courseId: selectedCourseId || '',
      name: '',
      academicYear: '',
      semester: 1,
    });
  };

  const handleEdit = (batch: Batch) => {
    setForm({
      id: batch.id,
      courseId: batch.courseId,
      name: batch.name,
      academicYear: batch.academicYear,
      semester: batch.semester,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      await apiClient.delete(`/batches/${id}`);
      toast.success('Batch deleted');
      loadBatches();
    } catch {
      toast.error('Failed to delete batch');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseId) {
      toast.error('Course is required');
      return;
    }
    if (!form.name || !form.academicYear) {
      toast.error('Name and academic year are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        courseId: form.courseId,
        name: form.name,
        academicYear: form.academicYear,
        semester: form.semester,
      };
      if (form.id) {
        await apiClient.put(`/batches/${form.id}`, payload);
        toast.success('Batch updated');
      } else {
        await apiClient.post('/batches', payload);
        toast.success('Batch created');
      }
      resetForm();
      loadBatches();
    } catch {
      toast.error('Failed to save batch');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Batches</h1>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          {form.id ? 'Edit Batch' : 'Create Batch'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={form.courseId}
              onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="2025-S1-Section-A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={form.academicYear}
              onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
              placeholder="2025-2026"
            />
          </div>
          <div className="flex items-end space-x-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <input
                type="number"
                min={1}
                max={8}
                className="mt-1 block w-24 border border-gray-300 rounded-md px-3 py-2"
                value={form.semester}
                onChange={(e) => setForm((f) => ({ ...f, semester: Number(e.target.value) }))}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : form.id ? 'Update' : 'Create'}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Course</label>
            <select
              className="mt-1 block w-64 border border-gray-300 rounded-md px-3 py-2"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Year
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batches.map((batch) => (
                <tr key={batch.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{batch.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{batch.academicYear}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{batch.semester}</td>
                  <td className="px-4 py-2 text-sm text-right space-x-2">
                    <button
                      onClick={() => handleEdit(batch)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(batch.id)}
                      className="inline-flex items-center px-3 py-1 border border-red-300 text-xs rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-center text-sm text-gray-500" colSpan={4}>
                    No batches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {totalPages === 0 ? 0 : page + 1} of {totalPages || 0}
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
    </div>
  );
};

export default BatchesPage;

