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
    <div className="space-y-6">
      <div>
        <h1 className="ui-display">Batches</h1>
        <p className="ui-muted">Create batches and filter by course.</p>
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        <div className="ui-card-header">
          <h2 className="ui-h2">{form.id ? 'Edit batch' : 'Create batch'}</h2>
          <span className="ui-pill">{form.id ? 'update' : 'new'}</span>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="ui-caption block mb-1">Course</label>
            <select
              className="ui-select"
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
            <label className="ui-caption block mb-1">Name</label>
            <input
              type="text"
              className="ui-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="2025-S1-Section-A"
            />
          </div>
          <div>
            <label className="ui-caption block mb-1">Academic year</label>
            <input
              type="text"
              className="ui-input"
              value={form.academicYear}
              onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
              placeholder="2025-2026"
            />
          </div>
          <div className="flex items-end space-x-2">
            <div>
              <label className="ui-caption block mb-1">Semester</label>
              <input
                type="number"
                min={1}
                max={8}
                className="ui-input w-24"
                value={form.semester}
                onChange={(e) => setForm((f) => ({ ...f, semester: Number(e.target.value) }))}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="ui-btn-primary ml-2"
            >
              {saving ? 'Saving...' : form.id ? 'Update' : 'Create'}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={resetForm}
                className="ui-btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        <div className="ui-card-header">
          <div>
            <label className="ui-caption block mb-1">Filter by course</label>
            <select
              className="ui-select w-72"
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
          <div className="text-center py-8 ui-muted">Loading...</div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead className="ui-thead">
              <tr>
                <th className="ui-th">
                  Name
                </th>
                <th className="ui-th">
                  Academic Year
                </th>
                <th className="ui-th">
                  Semester
                </th>
                <th className="ui-th text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderSubtle">
              {batches.map((batch) => (
                <tr key={batch.id}>
                  <td className="ui-td">{batch.name}</td>
                  <td className="ui-td-muted">{batch.academicYear}</td>
                  <td className="ui-td-muted">{batch.semester}</td>
                  <td className="ui-td text-right space-x-2">
                    <button
                      onClick={() => handleEdit(batch)}
                      className="ui-btn-secondary ui-btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(batch.id)}
                      className="ui-btn-danger ui-btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-textSecondary" colSpan={4}>
                    No batches found.
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="ui-btn-secondary ui-btn-sm"
          >
            Previous
          </button>
          <span className="ui-caption">
            Page {totalPages === 0 ? 0 : page + 1} of {totalPages || 0}
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
    </div>
  );
};

export default BatchesPage;

