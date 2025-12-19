import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Assignment, Batch, Course, PageResponse, Submission } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    id?: string;
    batchId: string;
    title: string;
    description: string;
    dueDate: string;
    maxPoints: number;
    allowResubmission: boolean;
  }>({
    batchId: '',
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100,
    allowResubmission: false,
  });

  const [submitModal, setSubmitModal] = useState<{
    open: boolean;
    assignment?: Assignment;
  }>({ open: false });
  const [submitContent, setSubmitContent] = useState('');
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [submissionsModal, setSubmissionsModal] = useState<{
    open: boolean;
    assignment?: Assignment;
  }>({ open: false });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsPage, setSubmissionsPage] = useState(0);
  const [submissionsTotalPages, setSubmissionsTotalPages] = useState(0);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [downloadingSubmissionId, setDownloadingSubmissionId] = useState<string | null>(null);

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  useEffect(() => {
    loadCourses();
    loadAllBatches();
  }, []);

  useEffect(() => {
    loadAssignments();
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

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
        sort: 'dueDate,asc',
      });
      if (selectedBatchId) {
        params.append('batchId', selectedBatchId);
      }
      const response = await apiClient.get<PageResponse<Assignment>>(
        `/assignments?${params.toString()}`
      );
      setAssignments(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = selectedCourseId
    ? batches.filter((b) => b.courseId === selectedCourseId)
    : batches;

  const resetForm = () => {
    setForm({
      batchId: selectedBatchId || '',
      title: '',
      description: '',
      dueDate: '',
      maxPoints: 100,
      allowResubmission: false,
    });
  };

  const handleEdit = (assignment: Assignment) => {
    setForm({
      id: assignment.id,
      batchId: assignment.batchId,
      title: assignment.title,
      description: assignment.description ?? '',
      dueDate: assignment.dueDate ? assignment.dueDate.substring(0, 16) : '',
      maxPoints: assignment.maxPoints,
      allowResubmission: assignment.allowResubmission,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await apiClient.delete(`/assignments/${id}`);
      toast.success('Assignment deleted');
      loadAssignments();
    } catch {
      toast.error('Failed to delete assignment');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batchId) {
      toast.error('Batch is required');
      return;
    }
    if (!form.title || !form.dueDate) {
      toast.error('Title and due date are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        batchId: form.batchId,
        title: form.title,
        description: form.description,
        dueDate: new Date(form.dueDate).toISOString(),
        maxPoints: form.maxPoints,
        allowResubmission: form.allowResubmission,
      };
      if (form.id) {
        await apiClient.put(`/assignments/${form.id}`, payload);
        toast.success('Assignment updated');
      } else {
        await apiClient.post('/assignments', payload);
        toast.success('Assignment created');
      }
      resetForm();
      loadAssignments();
    } catch {
      toast.error('Failed to save assignment');
    } finally {
      setSaving(false);
    }
  };

  const openSubmitModal = (assignment: Assignment) => {
    setSubmitModal({ open: true, assignment });
    setSubmitContent('');
    setSubmitFile(null);
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitModal.assignment) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append(
        'request',
        new Blob([JSON.stringify({ contentText: submitContent })], {
          type: 'application/json',
        })
      );
      if (submitFile) {
        formData.append('file', submitFile);
      }
      await apiClient.post(`/assignments/${submitModal.assignment.id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Assignment submitted');
      setSubmitModal({ open: false });
    } catch {
      toast.error('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const loadAssignmentSubmissions = async (assignmentId: string, pageToLoad: number) => {
    setSubmissionsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageToLoad.toString(),
        size: '20',
        sort: 'submittedAt,desc',
      });
      const response = await apiClient.get<PageResponse<Submission>>(
        `/assignments/${assignmentId}/submissions?${params.toString()}`
      );
      setSubmissions(response.data.content);
      setSubmissionsTotalPages(response.data.totalPages);
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const openSubmissionsModal = async (assignment: Assignment) => {
    setSubmissionsModal({ open: true, assignment });
    setSubmissions([]);
    setSubmissionsPage(0);
    setSubmissionsTotalPages(0);
    await loadAssignmentSubmissions(assignment.id, 0);
  };

  const closeSubmissionsModal = () => {
    setSubmissionsModal({ open: false });
    setSubmissions([]);
    setSubmissionsPage(0);
    setSubmissionsTotalPages(0);
  };

  const getFilenameFromContentDisposition = (headerValue?: string) => {
    if (!headerValue) return null;
    const match = /filename="([^"]+)"/i.exec(headerValue);
    if (!match?.[1]) return null;
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  };

  const downloadSubmissionFile = async (submission: Submission) => {
    if (!submission.filePath) {
      toast.error('No file attached for this submission');
      return;
    }
    setDownloadingSubmissionId(submission.id);
    try {
      const response = await apiClient.get(`/assignments/submissions/${submission.id}/download`, {
        responseType: 'blob',
      });

      const contentDisposition = (response.headers?.['content-disposition'] as string | undefined) ?? undefined;
      const filename =
        getFilenameFromContentDisposition(contentDisposition) ??
        `${submission.assignmentTitle}-${submission.studentName}-attempt${submission.submissionNumber}.bin`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download submission file');
    } finally {
      setDownloadingSubmissionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="ui-display">Assignments</h1>
        <p className="ui-muted">Filter by course/batch, then create, submit, or review work.</p>
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
                setPage(0);
              }}
            >
              <option value="">All batches</option>
              {filteredBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name} ({batch.academicYear}, S{batch.semester})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isTeacher && (
        <div className="ui-card ui-card-pad space-y-4">
          <div className="ui-card-header">
            <h2 className="ui-h2">{form.id ? 'Edit assignment' : 'Create assignment'}</h2>
            <span className="ui-pill">{form.id ? 'update' : 'new'}</span>
          </div>
          <form onSubmit={handleSubmitForm} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                placeholder="Assignment title"
              />
            </div>
            <div>
              <label className="ui-caption block mb-1">Due date</label>
              <input
                type="datetime-local"
                className="ui-input"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="ui-caption block mb-1">Max points</label>
                <input
                  type="number"
                  min={0}
                  className="ui-input"
                  value={form.maxPoints}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxPoints: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <input
                  id="allowResubmission"
                  type="checkbox"
                  checked={form.allowResubmission}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, allowResubmission: e.target.checked }))
                  }
                  className="ui-checkbox"
                />
                <label htmlFor="allowResubmission" className="text-sm text-textSecondary">
                  Allow resubmission
                </label>
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="ui-btn-primary"
                >
                  {saving ? 'Saving...' : form.id ? 'Update Assignment' : 'Create Assignment'}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="ui-btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="ui-caption block mb-1">Description</label>
              <textarea
                className="ui-textarea h-24"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description or instructions"
              />
            </div>
          </form>
        </div>
      )}

      <div className="ui-card ui-card-pad space-y-4">
        <h2 className="ui-h2">Assignments</h2>
        {loading ? (
          <div className="text-center py-8 ui-muted">Loading...</div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead className="ui-thead">
                <tr>
                  <th className="ui-th">Title</th>
                  <th className="ui-th">Batch</th>
                  <th className="ui-th">Due date</th>
                  <th className="ui-th">Max points</th>
                  <th className="ui-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle">
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="ui-td">{assignment.title}</td>
                  <td className="ui-td-muted">{assignment.batchName}</td>
                  <td className="ui-td-muted">
                    {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : ''}
                  </td>
                  <td className="ui-td-muted">{assignment.maxPoints}</td>
                  <td className="ui-td text-right space-x-2">
                    {isTeacher && (
                      <>
                        <button
                          onClick={() => openSubmissionsModal(assignment)}
                          className="ui-btn-secondary ui-btn-sm"
                        >
                          Submissions
                        </button>
                        <button
                          onClick={() => handleEdit(assignment)}
                          className="ui-btn-secondary ui-btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="ui-btn-danger ui-btn-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {user?.role === 'STUDENT' && (
                      <button
                        onClick={() => openSubmitModal(assignment)}
                        className="ui-btn-primary ui-btn-sm"
                      >
                        Submit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-textSecondary" colSpan={5}>
                    No assignments found.
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        )}

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
      </div>

      {submitModal.open && submitModal.assignment && (
        <div className="ui-backdrop">
          <div className="ui-modal space-y-4">
            <h2 className="ui-h2">Submit: {submitModal.assignment.title}</h2>
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="ui-caption block mb-1">Answer (optional)</label>
                <textarea
                  className="ui-textarea h-24"
                  value={submitContent}
                  onChange={(e) => setSubmitContent(e.target.value)}
                  placeholder="Write your answer or leave empty if uploading a file only"
                />
              </div>
              <div>
                <label className="ui-caption block mb-1">File (optional)</label>
                <input
                  type="file"
                  onChange={(e) => setSubmitFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-textSecondary"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSubmitModal({ open: false })}
                  className="ui-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="ui-btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {submissionsModal.open && submissionsModal.assignment && (
        <div className="ui-backdrop">
          <div className="ui-card ui-card-pad w-full max-w-6xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="ui-h2">Submissions: {submissionsModal.assignment.title}</h2>
                <div className="ui-caption">
                  Batch: {submissionsModal.assignment.batchName}
                </div>
              </div>
              <button
                type="button"
                onClick={closeSubmissionsModal}
                className="ui-btn-secondary ui-btn-sm"
              >
                Close
              </button>
            </div>

            <div className="rounded-card border border-borderSubtle bg-white/70 p-3 flex items-center justify-between">
              <div className="ui-caption">
                Page {submissionsTotalPages === 0 ? 0 : submissionsPage + 1} of {submissionsTotalPages || 0}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const next = Math.max(0, submissionsPage - 1);
                    setSubmissionsPage(next);
                    await loadAssignmentSubmissions(submissionsModal.assignment!.id, next);
                  }}
                  disabled={submissionsPage === 0 || submissionsLoading}
                  className="ui-btn-secondary ui-btn-sm"
                >
                  Previous
                </button>
                <button
                  onClick={async () => {
                    const next = submissionsPage + 1;
                    setSubmissionsPage(next);
                    await loadAssignmentSubmissions(submissionsModal.assignment!.id, next);
                  }}
                  disabled={submissionsPage >= submissionsTotalPages - 1 || submissionsLoading}
                  className="ui-btn-secondary ui-btn-sm"
                >
                  Next
                </button>
              </div>
            </div>

            {submissionsLoading ? (
              <div className="text-center py-8 ui-muted">Loading...</div>
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
                        Attempt
                      </th>
                      <th className="ui-th">
                        Answer
                      </th>
                      <th className="ui-th text-right">
                        File
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderSubtle">
                    {submissions.map((s) => (
                      <tr key={s.id}>
                        <td className="ui-td">{s.studentName}</td>
                        <td className="ui-td-muted">
                          {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : ''}
                        </td>
                        <td className="ui-td-muted">
                          <span className="ui-pill">{s.late ? 'late' : 'on time'}</span>
                        </td>
                        <td className="ui-td-muted">#{s.submissionNumber}</td>
                        <td className="ui-td-muted max-w-md">
                          {s.contentText ? (
                            <div title={s.contentText} className="truncate">
                              {s.contentText}
                            </div>
                          ) : (
                            <span className="text-textMuted">—</span>
                          )}
                        </td>
                        <td className="ui-td text-right">
                          {s.filePath ? (
                            <button
                              onClick={() => downloadSubmissionFile(s)}
                              disabled={downloadingSubmissionId === s.id}
                              className="ui-btn-secondary ui-btn-sm"
                            >
                              {downloadingSubmissionId === s.id ? 'Downloading...' : 'Download'}
                            </button>
                          ) : (
                            <span className="text-xs text-textMuted">No file</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {submissions.length === 0 && (
                      <tr>
                        <td className="px-4 py-8 text-center text-sm text-textSecondary" colSpan={6}>
                          No submissions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;

