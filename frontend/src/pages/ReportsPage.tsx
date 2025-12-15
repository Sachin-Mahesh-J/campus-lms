import React, { useState } from 'react';
import apiClient from '../api/client';
import { Batch, Course, PageResponse } from '../types';
import toast from 'react-hot-toast';

interface AttendanceReport {
  batchId?: string;
  studentId?: string;
  totalRecords: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

interface GradesReport {
  batchId?: string;
  studentId?: string;
  totalGrades: number;
  averagePoints: number;
  minPoints: number;
  maxPoints: number;
}

const ReportsPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [batchesLoaded, setBatchesLoaded] = useState(false);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [studentId, setStudentId] = useState('');

  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport | null>(null);
  const [gradesReport, setGradesReport] = useState<GradesReport | null>(null);

  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);

  const ensureCoursesLoaded = async () => {
    if (coursesLoaded) return;
    try {
      const params = new URLSearchParams({ page: '0', size: '200', sort: 'title,asc' });
      const response = await apiClient.get<PageResponse<Course>>(`/courses?${params.toString()}`);
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
      const response = await apiClient.get<PageResponse<Batch>>(`/batches?${params.toString()}`);
      setBatches(response.data.content);
      setBatchesLoaded(true);
    } catch {
      toast.error('Failed to load batches for reports');
    }
  };

  const filteredBatches = selectedCourseId
    ? batches.filter((b) => b.courseId === selectedCourseId)
    : batches;

  const loadAttendanceReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAttendance(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatchId) params.append('batchId', selectedBatchId);
      if (studentId) params.append('studentId', studentId);
      const response = await apiClient.get<AttendanceReport>(
        `/reports/attendance?${params.toString()}`
      );
      setAttendanceReport(response.data);
    } catch {
      toast.error('Failed to load attendance report');
    } finally {
      setLoadingAttendance(false);
    }
  };

  const loadGradesReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingGrades(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatchId) params.append('batchId', selectedBatchId);
      if (studentId) params.append('studentId', studentId);
      const response = await apiClient.get<GradesReport>(`/reports/grades?${params.toString()}`);
      setGradesReport(response.data);
    } catch {
      toast.error('Failed to load grades report');
    } finally {
      setLoadingGrades(false);
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reports</h1>

      <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID (optional, UUID)
            </label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Filter by single student UUID (optional)"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance report card */}
        <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Attendance Report</h2>
            <form onSubmit={loadAttendanceReport}>
              <button
                type="submit"
                disabled={loadingAttendance}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loadingAttendance ? 'Loading...' : 'Generate'}
              </button>
            </form>
          </div>
          {attendanceReport ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 px-3 py-2 rounded-md">
                  <div className="text-xs text-gray-500 uppercase">Total Records</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {attendanceReport.totalRecords}
                  </div>
                </div>
                <div className="bg-gray-50 px-3 py-2 rounded-md">
                  <div className="text-xs text-gray-500 uppercase">Attendance Rate</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {attendanceReport.attendanceRate}%
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 px-3 py-2 rounded-md">
                  <div className="text-xs text-green-700 uppercase">Present</div>
                  <div className="text-lg font-semibold text-green-900">
                    {attendanceReport.present}
                  </div>
                </div>
                <div className="bg-red-50 px-3 py-2 rounded-md">
                  <div className="text-xs text-red-700 uppercase">Absent</div>
                  <div className="text-lg font-semibold text-red-900">{attendanceReport.absent}</div>
                </div>
                <div className="bg-yellow-50 px-3 py-2 rounded-md">
                  <div className="text-xs text-yellow-700 uppercase">Late</div>
                  <div className="text-lg font-semibold text-yellow-900">{attendanceReport.late}</div>
                </div>
                <div className="bg-blue-50 px-3 py-2 rounded-md">
                  <div className="text-xs text-blue-700 uppercase">Excused</div>
                  <div className="text-lg font-semibold text-blue-900">
                    {attendanceReport.excused}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Configure filters above and click Generate to view attendance stats.
            </p>
          )}
        </div>

        {/* Grades report card */}
        <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Grades Report</h2>
            <form onSubmit={loadGradesReport}>
              <button
                type="submit"
                disabled={loadingGrades}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loadingGrades ? 'Loading...' : 'Generate'}
              </button>
            </form>
          </div>
          {gradesReport ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 px-3 py-2 rounded-md">
                  <div className="text-xs text-gray-500 uppercase">Total Grades</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {gradesReport.totalGrades}
                  </div>
                </div>
                <div className="bg-indigo-50 px-3 py-2 rounded-md">
                  <div className="text-xs text-indigo-700 uppercase">Average Points</div>
                  <div className="text-lg font-semibold text-indigo-900">
                    {gradesReport.averagePoints.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 px-3 py-2 rounded-md">
                  <div className="text-xs text-green-700 uppercase">Max Points</div>
                  <div className="text-lg font-semibold text-green-900">
                    {gradesReport.maxPoints.toFixed(2)}
                  </div>
                </div>
                <div className="bg-red-50 px-3 py-2 rounded-md">
                  <div className="text-xs text-red-700 uppercase">Min Points</div>
                  <div className="text-lg font-semibold text-red-900">
                    {gradesReport.minPoints.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Configure filters above and click Generate to view grades statistics.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;


