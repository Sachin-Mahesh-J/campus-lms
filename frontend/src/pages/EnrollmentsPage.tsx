import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Batch, Course, Enrollment, PageResponse, User } from '../types';
import toast from 'react-hot-toast';
import { usersApi } from '../api/users';

const EnrollmentsPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [savingBulk, setSavingBulk] = useState(false);

  // Manual enrollment state
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadCourses();
    loadAllBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      loadEnrollments(selectedBatchId);
    } else {
      setEnrollments([]);
    }
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

  const loadEnrollments = async (batchId: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get<Enrollment[]>(`/batches/${batchId}/enrollments`);
      setEnrollments(response.data);
    } catch {
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = selectedCourseId
    ? batches.filter((b) => b.courseId === selectedCourseId)
    : batches;

  const handleBulkEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      toast.error('Select a batch first');
      return;
    }
    const ids = bulkInput
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (ids.length === 0) {
      toast.error('Enter at least one student UUID');
      return;
    }
    setSavingBulk(true);
    try {
      await apiClient.post(`/batches/${selectedBatchId}/enroll-bulk`, {
        studentIds: ids,
      });
      toast.success('Students enrolled');
      setBulkInput('');
      loadEnrollments(selectedBatchId);
    } catch {
      toast.error('Failed to enroll students');
    } finally {
      setSavingBulk(false);
    }
  };

  const handleStudentSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentSearch.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const page = await usersApi.searchStudents(studentSearch.trim(), 0, 20);
      // Show only students (backend returns all roles)
      setSearchResults(page.content.filter((u) => u.role === 'STUDENT'));
    } catch {
      toast.error('Failed to search students');
    } finally {
      setSearching(false);
    }
  };

  const enrollSingleStudent = async (studentId: string) => {
    if (!selectedBatchId) {
      toast.error('Select a batch first');
      return;
    }
    try {
      await apiClient.post(`/batches/${selectedBatchId}/enroll-bulk`, {
        studentIds: [studentId],
      });
      toast.success('Student enrolled');
      loadEnrollments(selectedBatchId);
    } catch {
      toast.error('Failed to enroll student');
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Enrollments</h1>

      <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Select Batch</h2>
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
              onChange={(e) => setSelectedBatchId(e.target.value)}
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

      {selectedBatchId && (
        <div className="bg-white shadow sm:rounded-lg p-4 space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Manual Enroll (by name/email)</h2>
            <form onSubmit={handleStudentSearch} className="flex flex-wrap gap-2 items-center mb-3">
              <input
                type="text"
                className="flex-1 min-w-[200px] border border-gray-300 rounded-md px-3 py-2"
                placeholder="Search students by name or email"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
              <button
                type="submit"
                disabled={searching}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>
            {searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((student) => (
                      <tr key={student.id}>
                        <td className="px-3 py-2 text-gray-900">{student.fullName}</td>
                        <td className="px-3 py-2 text-gray-500">{student.email}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => enrollSingleStudent(student.id)}
                            className="inline-flex items-center px-3 py-1 border border-indigo-300 text-xs rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
                          >
                            Enroll
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {studentSearch && !searching && searchResults.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No students found for that query.</p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Bulk Enroll by UUID (optional)</h2>
            <form onSubmit={handleBulkEnroll} className="space-y-3">
              <p className="text-sm text-gray-600">
                Paste student UUIDs separated by spaces, commas, or newlines. The backend will
                enroll them into the selected batch.
              </p>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="uuid-1 uuid-2 uuid-3 ..."
              />
              <button
                type="submit"
                disabled={savingBulk}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {savingBulk ? 'Enrolling...' : 'Enroll by UUIDs'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow sm:rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Current Enrollments</h2>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : !selectedBatchId ? (
          <p className="text-sm text-gray-500">Select a batch to view enrollments.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrolled At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{enrollment.studentName}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{enrollment.status}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {new Date(enrollment.enrolledAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-center text-sm text-gray-500" colSpan={3}>
                    No enrollments yet for this batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EnrollmentsPage;

