import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Batch, ClassSession, Course, PageResponse } from '../types';
import toast from 'react-hot-toast';

const ClassSessionsPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    batchId: string;
    title: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    location: string;
  }>({
    batchId: '',
    title: '',
    sessionDate: '',
    startTime: '',
    endTime: '',
    location: '',
  });

  useEffect(() => {
    loadCourses();
    loadAllBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      loadSessions();
    } else {
      setSessions([]);
    }
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

  const loadSessions = async () => {
    if (!selectedBatchId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
        sort: 'sessionDate,asc',
      });
      params.append('batchId', selectedBatchId);
      const response = await apiClient.get<PageResponse<ClassSession>>(
        `/sessions?${params.toString()}`
      );
      setSessions(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = selectedCourseId
    ? batches.filter((b) => b.courseId === selectedCourseId)
    : batches;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batchId || !form.sessionDate || !form.startTime || !form.endTime) {
      toast.error('Batch, date, and times are required');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/sessions', {
        batchId: form.batchId,
        title: form.title,
        sessionDate: form.sessionDate,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location,
      });
      toast.success('Class session created');
      setForm({
        batchId: selectedBatchId || '',
        title: '',
        sessionDate: '',
        startTime: '',
        endTime: '',
        location: '',
      });
      loadSessions();
    } catch {
      toast.error('Failed to create session');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Class Sessions</h1>

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
                setForm((f) => ({ ...f, batchId: e.target.value }));
                setPage(0);
              }}
            >
              <option value="">Select batch</option>
              {filteredBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name} ({batch.academicYear}, S{batch.semester})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Create Class Session</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
              placeholder="Lecture 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={form.sessionDate}
              onChange={(e) => setForm((f) => ({ ...f, sessionDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Room 101"
            />
          </div>
          <div className="flex items-center mt-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Class Sessions</h2>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : !selectedBatchId ? (
          <p className="text-sm text-gray-500">Select a batch to view sessions.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{session.title}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {session.sessionDate
                      ? new Date(session.sessionDate).toLocaleDateString()
                      : ''}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {session.startTime} - {session.endTime}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">{session.location}</td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-center text-sm text-gray-500" colSpan={4}>
                    No sessions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {selectedBatchId && (
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
        )}
      </div>
    </div>
  );
};

export default ClassSessionsPage;

