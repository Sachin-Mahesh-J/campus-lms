import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Batch, ClassSession, Course, PageResponse } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ClassSessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const canManage = user?.role === 'ADMIN' || user?.role === 'TEACHER';

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
    <div className="space-y-6">
      <div>
        <h1 className="ui-display">Class sessions</h1>
        <p className="ui-muted">Create sessions and view the schedule for a batch.</p>
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        <h2 className="ui-h2">Filters</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="ui-caption block mb-1">Course</label>
            <select
              className="ui-select w-72"
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
            <label className="ui-caption block mb-1">Batch</label>
            <select
              className="ui-select w-72"
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

      <div className="ui-card ui-card-pad space-y-4">
        <h2 className="ui-h2">Create class session</h2>
        {canManage ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="ui-caption block mb-1">Batch</label>
              <select
                className="ui-select"
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
              <label className="ui-caption block mb-1">Title</label>
              <input
                type="text"
                className="ui-input"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Lecture 1"
              />
            </div>
            <div>
              <label className="ui-caption block mb-1">Date</label>
              <input
                type="date"
                className="ui-input"
                value={form.sessionDate}
                onChange={(e) => setForm((f) => ({ ...f, sessionDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="ui-caption block mb-1">Start time</label>
              <input
                type="time"
                className="ui-input"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              />
            </div>
            <div>
              <label className="ui-caption block mb-1">End time</label>
              <input
                type="time"
                className="ui-input"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              />
            </div>
            <div>
              <label className="ui-caption block mb-1">Location</label>
              <input
                type="text"
                className="ui-input"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Room 101"
              />
            </div>
            <div className="flex items-center mt-6">
              <button
                type="submit"
                disabled={saving}
                className="ui-btn-primary"
              >
                {saving ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </form>
        ) : (
          <p className="ui-muted">Students can view session schedules, but only teachers/admins can create sessions.</p>
        )}
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        <h2 className="ui-h2">Sessions</h2>
        {loading ? (
          <div className="text-center py-8 ui-muted">Loading...</div>
        ) : !selectedBatchId ? (
          <p className="ui-muted">Select a batch to view sessions.</p>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead className="ui-thead">
              <tr>
                <th className="ui-th">
                  Title
                </th>
                <th className="ui-th">
                  Date
                </th>
                <th className="ui-th">
                  Time
                </th>
                <th className="ui-th">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderSubtle">
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td className="ui-td">{session.title}</td>
                  <td className="ui-td-muted">
                    {session.sessionDate
                      ? new Date(session.sessionDate).toLocaleDateString()
                      : ''}
                  </td>
                  <td className="ui-td-muted">
                    {session.startTime} - {session.endTime}
                  </td>
                  <td className="ui-td-muted">{session.location}</td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-textSecondary" colSpan={4}>
                    No sessions found.
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        )}

        {selectedBatchId && (
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
        )}
      </div>
    </div>
  );
};

export default ClassSessionsPage;

