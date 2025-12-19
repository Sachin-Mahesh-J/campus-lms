import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const AttendancePage = () => {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');

  const [statusMap, setStatusMap] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCourses();
    loadAllBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      loadSessions();
      loadEnrollments();
    } else {
      setSessions([]);
      setEnrollments([]);
      setSelectedSessionId('');
      setStatusMap({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchId]);

  const loadCourses = async () => {
    try {
      const params = new URLSearchParams({ page: '0', size: '100', sort: 'title,asc' });
      const response = await apiClient.get(`/courses?${params.toString()}`);
      setCourses(response.data.content);
    } catch {
      toast.error('Failed to load courses');
    }
  };

  const loadAllBatches = async () => {
    try {
      const params = new URLSearchParams({ page: '0', size: '200' });
      const response = await apiClient.get(`/batches?${params.toString()}`);
      setBatches(response.data.content);
    } catch {
      toast.error('Failed to load batches');
    }
  };

  const loadSessions = async () => {
    if (!selectedBatchId) return;
    try {
      const params = new URLSearchParams({
        page: '0',
        size: '100',
        batchId: selectedBatchId,
        sort: 'sessionDate,asc',
      });
      const response = await apiClient.get(
        `/sessions?${params.toString()}`
      );
      setSessions(response.data.content);
    } catch {
      toast.error('Failed to load sessions');
    }
  };

  const loadEnrollments = async () => {
    if (!selectedBatchId) return;
    try {
      const response = await apiClient.get(`/batches/${selectedBatchId}/enrollments`);
      setEnrollments(response.data);
      const initial = {};
      response.data.forEach((e) => {
        initial[e.studentId] = 'PRESENT';
      });
      setStatusMap(initial);
    } catch {
      toast.error('Failed to load enrollments');
    }
  };

  const filteredBatches = selectedCourseId
    ? batches.filter((b) => b.courseId === selectedCourseId)
    : batches;

  const handleStatusChange = (studentId, status) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSessionId || !selectedBatchId) {
      toast.error('Select batch and session first');
      return;
    }
    const records = enrollments.map((enrollment) => ({
      studentId: enrollment.studentId,
      status: statusMap[enrollment.studentId] || 'PRESENT',
    }));
    setSaving(true);
    try {
      await apiClient.post(`/sessions/${selectedSessionId}/attendance-bulk`, { records });
      toast.success('Attendance recorded');
    } catch {
      toast.error('Failed to record attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="ui-display">Attendance</h1>
        <p className="ui-muted">Select a session and record attendance in bulk.</p>
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        <h2 className="ui-h2">Select session</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="ui-caption block mb-1">Course</label>
            <select
              className="ui-select w-72"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedBatchId('');
                setSelectedSessionId('');
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
                setSelectedSessionId('');
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
          <div>
            <label className="ui-caption block mb-1">Session</label>
            <select
              className="ui-select w-80"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
            >
              <option value="">Select session</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.sessionDate} {session.startTime} - {session.endTime} ({session.title})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        <h2 className="ui-h2">Record attendance</h2>
        {!selectedBatchId || !selectedSessionId ? (
          <p className="ui-muted">Select a batch and session to record attendance.</p>
        ) : enrollments.length === 0 ? (
          <p className="ui-muted">No students enrolled in this batch.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="ui-table-wrap">
              <table className="ui-table">
                <thead className="ui-thead">
                  <tr>
                    <th className="ui-th">Student</th>
                    <th className="ui-th">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderSubtle">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td className="ui-td">{enrollment.studentName}</td>
                      <td className="ui-td">
                        <select
                          className="ui-select w-44 px-3 py-1.5"
                          value={statusMap[enrollment.studentId] || 'PRESENT'}
                          onChange={(e) =>
                            handleStatusChange(enrollment.studentId, e.target.value)
                          }
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                          <option value="LATE">Late</option>
                          <option value="EXCUSED">Excused</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="ui-btn-primary"
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;

