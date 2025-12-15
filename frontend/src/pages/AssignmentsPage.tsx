import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Assignment, Batch, Course, PageResponse } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    id?: string;
    batchId: string;
    title: string;
    description: string;
    dueDate: string;
    maxPoints: number;
    allowResubmission: boolean;
  }>({
    batchId: '',
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100,
    allowResubmission: false,
  });

  const [submitModal, setSubmitModal] = useState<{
    open: boolean;
    assignment?: Assignment;
  }>({ open: false });
  const [submitContent, setSubmitContent] = useState('');
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  useEffect(() => {
    loadCourses();
    loadAllBatches();
  }, []);

  useEffect(() => {
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchId, page]);

  const loadCourses = async () => {
    try {
      const params = new URLSearchParams({ page: '0', size: '100', sort: 'title,asc' });
      const response = await apiClient.get<PageResponse<Course>>(`/courses?${params.toString()}`);
      setCourses(response.data.content);
    } catch {
      toast.error('Failed to load courses');
    }
  };

  const loadAllBatches = async () => {
    try {
      const params = new URLSearchParams({ page: '0', size: '200' });
      const response = await apiClient.get<PageResponse<Batch>>(`/batches?${params.toString()}`);
      setBatches(response.data.content);
    } catch {
      toast.error('Failed to load batches');
    }
  };

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
        sort: 'dueDate,asc',
      });
      if (selectedBatchId) {
        params.append('batchId', selectedBatchId);
      }
      const response = await apiClient.get<PageResponse<Assignment>>(
        `/assignments?${params.toString()}`
      );
      setAssignments(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = selectedCourseId
    ? batches.filter((b) => b.courseId === selectedCourseId)
    : batches;

  const resetForm = () => {
    setForm({
      batchId: selectedBatchId || '',
      title: '',
      description: '',
      dueDate: '',
      maxPoints: 100,
      allowResubmission: false,
    });
  };

  const handleEdit = (assignment: Assignment) => {
    setForm({
      id: assignment.id,
      batchId: assignment.batchId,
      title: assignment.title,
      description: assignment.description ?? '',
      dueDate: assignment.dueDate ? assignment.dueDate.substring(0, 16) : '',
      maxPoints: assignment.maxPoints,
      allowResubmission: assignment.allowResubmission,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await apiClient.delete(`/assignments/${id}`);
      toast.success('Assignment deleted');
      loadAssignments();
    } catch {
      toast.error('Failed to delete assignment');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batchId) {
      toast.error('Batch is required');
      return;
    }
    if (!form.title || !form.dueDate) {
      toast.error('Title and due date are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        batchId: form.batchId,
        title: form.title,
        description: form.description,
        dueDate: new Date(form.dueDate).toISOString(),
        maxPoints: form.maxPoints,
        allowResubmission: form.allowResubmission,
      };
      if (form.id) {
        await apiClient.put(`/assignments/${form.id}`, payload);
        toast.success('Assignment updated');
      } else {
        await apiClient.post('/assignments', payload);
        toast.success('Assignment created');
      }
      resetForm();
      loadAssignments();
    } catch {
      toast.error('Failed to save assignment');
    } finally {
      setSaving(false);
    }
  };

  const openSubmitModal = (assignment: Assignment) => {
    setSubmitModal({ open: true, assignment });
    setSubmitContent('');
    setSubmitFile(null);
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitModal.assignment) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append(
        'request',
        new Blob([JSON.stringify({ contentText: submitContent })], {
          type: 'application/json',
        })
      );
      if (submitFile) {
        formData.append('file', submitFile);
      }
      await apiClient.post(`/assignments/${submitModal.assignment.id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Assignment submitted');
      setSubmitModal({ open: false });
    } catch {
      toast.error('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>

      <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              className="mt-1 block w-64 border border-gray-300 rounded-md px-3 py-2"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedBatchId('');
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select
              className="mt-1 block w-64 border border-gray-300 rounded-md px-3 py-2"
              value={selectedBatchId}
              onChange={(e) => {
                setSelectedBatchId(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All batches</option>
              {filteredBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name} ({batch.academicYear}, S{batch.semester})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isTeacher && (
        <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">
            {form.id ? 'Edit Assignment' : 'Create Assignment'}
          </h2>
          <form onSubmit={handleSubmitForm} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={form.batchId}
                onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))}
              >
                <option value="">Select batch</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name} ({batch.academicYear}, S{batch.semester})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Assignment title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="datetime-local"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Points</label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  value={form.maxPoints}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxPoints: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <input
                  id="allowResubmission"
                  type="checkbox"
                  checked={form.allowResubmission}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, allowResubmission: e.target.checked }))
                  }
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="allowResubmission" className="text-sm text-gray-700">
                  Allow resubmission
                </label>
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : form.id ? 'Update Assignment' : 'Create Assignment'}
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
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description or instructions"
              />
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow sm:rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Assignments</h2>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Points
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{assignment.title}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{assignment.batchName}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : ''}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">{assignment.maxPoints}</td>
                  <td className="px-4 py-2 text-sm text-right space-x-2">
                    {isTeacher && (
                      <>
                        <button
                          onClick={() => handleEdit(assignment)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="inline-flex items-center px-3 py-1 border border-red-300 text-xs rounded-md text-red-700 bg-white hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {user?.role === 'STUDENT' && (
                      <button
                        onClick={() => openSubmitModal(assignment)}
                        className="inline-flex items-center px-3 py-1 border border-indigo-300 text-xs rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
                      >
                        Submit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-center text-sm text-gray-500" colSpan={5}>
                    No assignments found.
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

      {submitModal.open && submitModal.assignment && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-900">
              Submit: {submitModal.assignment.title}
            </h2>
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer (optional)
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                  value={submitContent}
                  onChange={(e) => setSubmitContent(e.target.value)}
                  placeholder="Write your answer or leave empty if uploading a file only"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File (optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSubmitFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSubmitModal({ open: false })}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;

