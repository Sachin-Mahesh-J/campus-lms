import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Assignment, Batch, Course, Grade, PageResponse, Submission } from '../types';
import toast from 'react-hot-toast';

const GradesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');

  const [gradeEdits, setGradeEdits] = useState<
    Record<string, { pointsAwarded: string; feedback: string }>
  >({});
  const [savingSubmissionId, setSavingSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
    loadAllBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      loadAssignments();
    } else {
      setAssignments([]);
      setSelectedAssignmentId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchId]);

  useEffect(() => {
    if (selectedAssignmentId) {
      loadSubmissionsAndGrades();
    } else {
      setSubmissions([]);
      setGrades([]);
      setGradeEdits({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssignmentId]);

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
    if (!selectedBatchId) return;
    try {
      const params = new URLSearchParams({
        page: '0',
        size: '100',
        batchId: selectedBatchId,
        sort: 'dueDate,asc',
      } as any);
      const response = await apiClient.get<PageResponse<Assignment>>(
        `/assignments?${params.toString()}`
      );
      setAssignments(response.data.content);
    } catch {
      toast.error('Failed to load assignments');
    }
  };

  const loadSubmissionsAndGrades = async () => {
    if (!selectedAssignmentId) return;
    try {
      const [subsRes, gradesRes] = await Promise.all([
        apiClient.get<PageResponse<Submission>>(
          `/assignments/${selectedAssignmentId}/submissions?page=0&size=200`
        ),
        apiClient.get<PageResponse<Grade>>(
          `/assignments/${selectedAssignmentId}/grades?page=0&size=200`
        ),
      ]);
      setSubmissions(subsRes.data.content);
      setGrades(gradesRes.data.content);
      const initial: Record<string, { pointsAwarded: string; feedback: string }> = {};
      subsRes.data.content.forEach((submission) => {
        const grade = gradesRes.data.content.find((g) => g.submissionId === submission.id);
        initial[submission.id] = {
          pointsAwarded: grade ? String(grade.pointsAwarded) : '',
          feedback: grade?.feedback ?? '',
        };
      });
      setGradeEdits(initial);
    } catch {
      toast.error('Failed to load submissions or grades');
    }
  };

  const filteredBatches = selectedCourseId
    ? batches.filter((b) => b.courseId === selectedCourseId)
    : batches;

  const handleGradeChange = (
    submissionId: string,
    field: 'pointsAwarded' | 'feedback',
    value: string
  ) => {
    setGradeEdits((prev) => ({
      ...prev,
      [submissionId]: {
        ...(prev[submissionId] ?? { pointsAwarded: '', feedback: '' }),
        [field]: value,
      },
    }));
  };

  const handleSaveGrade = async (submissionId: string) => {
    if (!selectedAssignmentId) return;
    const edit = gradeEdits[submissionId];
    if (!edit || !edit.pointsAwarded) {
      toast.error('Points are required');
      return;
    }
    const pointsNum = Number(edit.pointsAwarded);
    if (Number.isNaN(pointsNum) || pointsNum < 0) {
      toast.error('Points must be a non-negative number');
      return;
    }
    setSavingSubmissionId(submissionId);
    try {
      await apiClient.post(`/assignments/${selectedAssignmentId}/submissions/${submissionId}/grade`, {
        pointsAwarded: pointsNum,
        feedback: edit.feedback,
      });
      toast.success('Grade saved');
      loadSubmissionsAndGrades();
    } catch {
      toast.error('Failed to save grade');
    } finally {
      setSavingSubmissionId(null);
    }
  };

  const getGradeForSubmission = (submissionId: string) =>
    grades.find((g) => g.submissionId === submissionId);

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Grades</h1>

      <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Select Assignment</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              className="mt-1 block w-64 border border-gray-300 rounded-md px-3 py-2"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedBatchId('');
                setSelectedAssignmentId('');
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
                setSelectedAssignmentId('');
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
            <select
              className="mt-1 block w-72 border border-gray-300 rounded-md px-3 py-2"
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
            >
              <option value="">Select assignment</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title} (due{' '}
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : ''})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Submissions</h2>
        {!selectedAssignmentId ? (
          <p className="text-sm text-gray-500">Select an assignment to view and grade submissions.</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-gray-500">No submissions yet for this assignment.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted At
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Late
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => {
                const edit = gradeEdits[submission.id] ?? { pointsAwarded: '', feedback: '' };
                const existingGrade = getGradeForSubmission(submission.id);
                return (
                  <tr key={submission.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{submission.studentName}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {submission.submittedAt
                        ? new Date(submission.submittedAt).toLocaleString()
                        : ''}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {submission.late ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <input
                        type="number"
                        className="w-24 border border-gray-300 rounded-md px-2 py-1"
                        value={edit.pointsAwarded}
                        onChange={(e) =>
                          handleGradeChange(submission.id, 'pointsAwarded', e.target.value)
                        }
                        placeholder={existingGrade ? String(existingGrade.pointsAwarded) : ''}
                      />
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-2 py-1"
                        value={edit.feedback}
                        onChange={(e) =>
                          handleGradeChange(submission.id, 'feedback', e.target.value)
                        }
                        placeholder={existingGrade?.feedback ?? ''}
                      />
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      <button
                        onClick={() => handleSaveGrade(submission.id)}
                        disabled={savingSubmissionId === submission.id}
                        className="inline-flex items-center px-3 py-1 border border-indigo-300 text-xs rounded-md text-indigo-700 bg-white hover:bg-indigo-50 disabled:opacity-50"
                      >
                        {savingSubmissionId === submission.id ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GradesPage;

