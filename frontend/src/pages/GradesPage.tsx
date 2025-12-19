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
    <div className="space-y-6">
      <div>
        <h1 className="ui-display">Grades</h1>
        <p className="ui-muted">Review submissions and record grades.</p>
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        <h2 className="ui-h2">Select assignment</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="ui-caption block mb-1">Course</label>
            <select
              className="ui-select w-72"
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
            <label className="ui-caption block mb-1">Batch</label>
            <select
              className="ui-select w-72"
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
            <label className="ui-caption block mb-1">Assignment</label>
            <select
              className="ui-select w-80"
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

      <div className="ui-card ui-card-pad space-y-4">
        <h2 className="ui-h2">Submissions</h2>
        {!selectedAssignmentId ? (
          <p className="ui-muted">Select an assignment to view and grade submissions.</p>
        ) : submissions.length === 0 ? (
          <p className="ui-muted">No submissions yet for this assignment.</p>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead className="ui-thead">
              <tr>
                <th className="ui-th">
                  Student
                </th>
                <th className="ui-th">
                  Submitted At
                </th>
                <th className="ui-th">
                  Late
                </th>
                <th className="ui-th">
                  Points
                </th>
                <th className="ui-th">
                  Feedback
                </th>
                <th className="ui-th text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderSubtle">
              {submissions.map((submission) => {
                const edit = gradeEdits[submission.id] ?? { pointsAwarded: '', feedback: '' };
                const existingGrade = getGradeForSubmission(submission.id);
                return (
                  <tr key={submission.id}>
                    <td className="ui-td">{submission.studentName}</td>
                    <td className="ui-td-muted">
                      {submission.submittedAt
                        ? new Date(submission.submittedAt).toLocaleString()
                        : ''}
                    </td>
                    <td className="ui-td-muted">
                      {submission.late ? 'Yes' : 'No'}
                    </td>
                    <td className="ui-td-muted">
                      <input
                        type="number"
                        className="ui-input w-24 px-3 py-1.5"
                        value={edit.pointsAwarded}
                        onChange={(e) =>
                          handleGradeChange(submission.id, 'pointsAwarded', e.target.value)
                        }
                        placeholder={existingGrade ? String(existingGrade.pointsAwarded) : ''}
                      />
                    </td>
                    <td className="ui-td-muted">
                      <input
                        type="text"
                        className="ui-input w-full px-3 py-1.5"
                        value={edit.feedback}
                        onChange={(e) =>
                          handleGradeChange(submission.id, 'feedback', e.target.value)
                        }
                        placeholder={existingGrade?.feedback ?? ''}
                      />
                    </td>
                    <td className="ui-td text-right">
                      <button
                        onClick={() => handleSaveGrade(submission.id)}
                        disabled={savingSubmissionId === submission.id}
                        className="ui-btn-primary ui-btn-sm"
                      >
                        {savingSubmissionId === submission.id ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradesPage;

