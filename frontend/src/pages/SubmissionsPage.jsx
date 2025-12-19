import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
        sort: 'submittedAt,desc',
      });
      const response = await apiClient.get(
        `/assignments/my-submissions?${params.toString()}`
      );
      setSubmissions(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="ui-display">My submissions</h1>
        <p className="ui-muted">A history of your assignment submissions.</p>
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        {loading ? (
          <div className="text-center py-8 ui-muted">Loading...</div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead className="ui-thead">
              <tr>
                <th className="ui-th">
                  Assignment
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
              </tr>
            </thead>
            <tbody className="divide-y divide-borderSubtle">
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="ui-td">
                    {submission.assignmentTitle}
                  </td>
                  <td className="ui-td-muted">
                    {submission.submittedAt
                      ? new Date(submission.submittedAt).toLocaleString()
                      : ''}
                  </td>
                  <td className="ui-td-muted">
                    <span className="ui-pill">{submission.late ? 'late' : 'on time'}</span>
                  </td>
                  <td className="ui-td-muted">
                    #{submission.submissionNumber}
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-textSecondary" colSpan={4}>
                    You have not submitted any assignments yet.
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
    </div>
  );
};

export default SubmissionsPage;

