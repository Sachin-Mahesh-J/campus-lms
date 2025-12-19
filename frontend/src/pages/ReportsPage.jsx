import React, { useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [batchesLoaded, setBatchesLoaded] = useState(false);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [studentId, setStudentId] = useState('');

  const [attendanceReport, setAttendanceReport] = useState(null);
  const [gradesReport, setGradesReport] = useState(null);

  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);

  const ensureCoursesLoaded = async () => {
    if (coursesLoaded) return;
    try {
      const params = new URLSearchParams({ page: '0', size: '200', sort: 'title,asc' });
      const response = await apiClient.get(`/courses?${params.toString()}`);
      setCourses(response.data.content);
      setCoursesLoaded(true);
    } catch {
      toast.error('Failed to load courses for reports');
    }
  };

  const ensureBatchesLoaded = async () => {
    if (batchesLoaded) return;
    try {
      const params = new URLSearchParams({ page: '0', size: '200' });
      const response = await apiClient.get(`/batches?${params.toString()}`);
      setBatches(response.data.content);
      setBatchesLoaded(true);
    } catch {
      toast.error('Failed to load batches for reports');
    }
  };

  const filteredBatches = selectedCourseId
    ? batches.filter((b) => b.courseId === selectedCourseId)
    : batches;

  const loadAttendanceReport = async (e) => {
    e.preventDefault();
    setLoadingAttendance(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatchId) params.append('batchId', selectedBatchId);
      if (studentId) params.append('studentId', studentId);
      const response = await apiClient.get(
        `/reports/attendance?${params.toString()}`
      );
      setAttendanceReport(response.data);
    } catch {
      toast.error('Failed to load attendance report');
    } finally {
      setLoadingAttendance(false);
    }
  };

  const loadGradesReport = async (e) => {
    e.preventDefault();
    setLoadingGrades(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatchId) params.append('batchId', selectedBatchId);
      if (studentId) params.append('studentId', studentId);
      const response = await apiClient.get(`/reports/grades?${params.toString()}`);
      setGradesReport(response.data);
    } catch {
      toast.error('Failed to load grades report');
    } finally {
      setLoadingGrades(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="ui-display">Reports</h1>
        <p className="ui-muted">Generate attendance and grades summaries.</p>
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        <h2 className="ui-h2">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="ui-caption block mb-1">Course</label>
            <select
              className="ui-select"
              value={selectedCourseId}
              onFocus={ensureCoursesLoaded}
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
              className="ui-select"
              value={selectedBatchId}
              onFocus={ensureBatchesLoaded}
              onChange={(e) => setSelectedBatchId(e.target.value)}
            >
              <option value="">All batches</option>
              {filteredBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name} ({batch.academicYear}, S{batch.semester})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="ui-caption block mb-1">Student ID (optional, UUID)</label>
            <input
              type="text"
              className="ui-input"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Filter by single student UUID (optional)"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance report card */}
        <div className="ui-card ui-card-pad space-y-4">
          <div className="ui-card-header">
            <div>
              <h2 className="ui-h2">Attendance report</h2>
              <p className="ui-caption">Totals and rate based on your filter selection.</p>
            </div>
            <form onSubmit={loadAttendanceReport}>
              <button type="submit" disabled={loadingAttendance} className="ui-btn-primary ui-btn-sm">
                {loadingAttendance ? 'Loading…' : 'Generate'}
              </button>
            </form>
          </div>
          {attendanceReport ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-card border border-borderSubtle bg-white/70 px-3 py-2">
                  <div className="ui-caption uppercase">Total records</div>
                  <div className="text-h2 font-semibold text-textPrimary">{attendanceReport.totalRecords}</div>
                </div>
                <div className="rounded-card border border-borderSubtle bg-white/70 px-3 py-2">
                  <div className="ui-caption uppercase">Attendance rate</div>
                  <div className="text-h2 font-semibold text-textPrimary">{attendanceReport.attendanceRate}%</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-card border border-borderSubtle bg-white/70 px-3 py-2">
                  <div className="ui-caption uppercase">Present</div>
                  <div className="text-h2 font-semibold text-textPrimary">{attendanceReport.present}</div>
                </div>
                <div className="rounded-card border border-borderSubtle bg-white/70 px-3 py-2">
                  <div className="ui-caption uppercase">Absent</div>
                  <div className="text-h2 font-semibold text-textPrimary">{attendanceReport.absent}</div>
                </div>
                <div className="rounded-card border border-borderSubtle bg-white/70 px-3 py-2">
                  <div className="ui-caption uppercase">Late</div>
                  <div className="text-h2 font-semibold text-textPrimary">{attendanceReport.late}</div>
                </div>
                <div className="rounded-card border border-borderSubtle bg-white/70 px-3 py-2">
                  <div className="ui-caption uppercase">Excused</div>
                  <div className="text-h2 font-semibold text-textPrimary">{attendanceReport.excused}</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="ui-muted">
              Configure filters above and click Generate to view attendance stats.
            </p>
          )}
        </div>

        {/* Grades report card */}
        <div className="ui-card ui-card-pad space-y-4">
          <div className="ui-card-header">
            <div>
              <h2 className="ui-h2">Grades report</h2>
              <p className="ui-caption">Min, max, and average points for the selected scope.</p>
            </div>
            <form onSubmit={loadGradesReport}>
              <button type="submit" disabled={loadingGrades} className="ui-btn-primary ui-btn-sm">
                {loadingGrades ? 'Loading…' : 'Generate'}
              </button>
            </form>
          </div>
          {gradesReport ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-card border border-borderSubtle bg-white/70 px-3 py-2">
                  <div className="ui-caption uppercase">Total grades</div>
                  <div className="text-h2 font-semibold text-textPrimary">{gradesReport.totalGrades}</div>
                </div>
                <div className="rounded-card border border-borderSubtle bg-white/70 px-3 py-2">
                  <div className="ui-caption uppercase">Average points</div>
                  <div className="text-h2 font-semibold text-textPrimary">{gradesReport.averagePoints.toFixed(2)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-card border border-borderSubtle bg-white/70 px-3 py-2">
                  <div className="ui-caption uppercase">Max points</div>
                  <div className="text-h2 font-semibold text-textPrimary">{gradesReport.maxPoints.toFixed(2)}</div>
                </div>
                <div className="rounded-card border border-borderSubtle bg-white/70 px-3 py-2">
                  <div className="ui-caption uppercase">Min points</div>
                  <div className="text-h2 font-semibold text-textPrimary">{gradesReport.minPoints.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="ui-muted">
              Configure filters above and click Generate to view grades statistics.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;


