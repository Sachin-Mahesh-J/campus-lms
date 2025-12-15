import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { AttendanceRecord, Batch, ClassSession, Course, Enrollment, PageResponse } from '../types';
import toast from 'react-hot-toast';

type AttendanceStatus = AttendanceRecord['status'];

const AttendancePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
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
    try {
      const params = new URLSearchParams({
        page: '0',
        size: '100',
        batchId: selectedBatchId,
        sort: 'sessionDate,asc',
      } as any);
      const response = await apiClient.get<PageResponse<ClassSession>>(
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
      const response = await apiClient.get<Enrollment[]>(`/batches/${selectedBatchId}/enrollments`);
      setEnrollments(response.data);
      const initial: Record<string, AttendanceStatus> = {};
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

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>

      <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Select Session</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              className="mt-1 block w-64 border border-gray-300 rounded-md px-3 py-2"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select
              className="mt-1 block w-64 border border-gray-300 rounded-md px-3 py-2"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
            <select
              className="mt-1 block w-72 border border-gray-300 rounded-md px-3 py-2"
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

      <div className="bg-white shadow sm:rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Record Attendance</h2>
        {!selectedBatchId || !selectedSessionId ? (
          <p className="text-sm text-gray-500">Select a batch and session to record attendance.</p>
        ) : enrollments.length === 0 ? (
          <p className="text-sm text-gray-500">No students enrolled in this batch.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{enrollment.studentName}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <select
                        className="border border-gray-300 rounded-md px-2 py-1"
                        value={statusMap[enrollment.studentId] || 'PRESENT'}
                        onChange={(e) =>
                          handleStatusChange(
                            enrollment.studentId,
                            e.target.value as AttendanceStatus
                          )
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
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
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

