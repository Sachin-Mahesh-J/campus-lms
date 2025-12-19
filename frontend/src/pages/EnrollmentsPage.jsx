import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { usersApi } from '../api/users';

const EnrollmentsPage = () => {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [savingBulk, setSavingBulk] = useState(false);

  // Manual enrollment state
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
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

  const loadEnrollments = async (batchId) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/batches/${batchId}/enrollments`);
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

  const handleBulkEnroll = async (e) => {
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

  const handleStudentSearch = async (e) => {
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

  const enrollSingleStudent = async (studentId) => {
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
    <div className="space-y-6">
      <div>
        <h1 className="ui-display">Enrollments</h1>
        <p className="ui-muted">Enroll students into a batch (manual search or bulk UUIDs).</p>
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        <h2 className="ui-h2">Select batch</h2>
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
        <div className="ui-card ui-card-pad space-y-6">
          <div>
            <h2 className="ui-h2 mb-2">Manual enroll</h2>
            <p className="ui-muted mb-3">Search by name or email, then enroll one student at a time.</p>
            <form onSubmit={handleStudentSearch} className="flex flex-wrap gap-2 items-center mb-3">
              <input
                type="text"
                className="ui-input flex-1 min-w-[200px]"
                placeholder="Search students by name or email"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
              <button
                type="submit"
                disabled={searching}
                className="ui-btn-primary"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>
            {searchResults.length > 0 && (
              <div className="ui-table-wrap max-h-64 overflow-y-auto">
                <table className="ui-table text-sm">
                  <thead className="ui-thead">
                    <tr>
                      <th className="ui-th px-3 py-2">
                        Name
                      </th>
                      <th className="ui-th px-3 py-2">
                        Email
                      </th>
                      <th className="ui-th px-3 py-2 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderSubtle">
                    {searchResults.map((student) => (
                      <tr key={student.id}>
                        <td className="ui-td px-3 py-2">{student.fullName}</td>
                        <td className="ui-td-muted px-3 py-2">{student.email}</td>
                        <td className="ui-td px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => enrollSingleStudent(student.id)}
                            className="ui-btn-primary ui-btn-sm"
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
              <p className="ui-caption mt-1">No students found for that query.</p>
            )}
          </div>

          <div>
            <h2 className="ui-h2 mb-2">Bulk enroll (UUIDs)</h2>
            <form onSubmit={handleBulkEnroll} className="space-y-3">
              <p className="ui-muted">
                Paste student UUIDs separated by spaces, commas, or newlines. The backend will
                enroll them into the selected batch.
              </p>
              <textarea
                className="ui-textarea h-24"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="uuid-1 uuid-2 uuid-3 ..."
              />
              <button
                type="submit"
                disabled={savingBulk}
                className="ui-btn-secondary"
              >
                {savingBulk ? 'Enrolling...' : 'Enroll by UUIDs'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="ui-card ui-card-pad space-y-4">
        <h2 className="ui-h2">Current enrollments</h2>
        {loading ? (
          <div className="text-center py-8 ui-muted">Loading...</div>
        ) : !selectedBatchId ? (
          <p className="ui-muted">Select a batch to view enrollments.</p>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead className="ui-thead">
              <tr>
                <th className="ui-th">
                  Student
                </th>
                <th className="ui-th">
                  Status
                </th>
                <th className="ui-th">
                  Enrolled At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderSubtle">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td className="ui-td">{enrollment.studentName}</td>
                  <td className="ui-td-muted">
                    <span className="ui-pill">{String(enrollment.status).toLowerCase()}</span>
                  </td>
                  <td className="ui-td-muted">
                    {new Date(enrollment.enrolledAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-textSecondary" colSpan={3}>
                    No enrollments yet for this batch.
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentsPage;

