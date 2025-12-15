import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { PageResponse, Submission } from '../types';
import toast from 'react-hot-toast';

const SubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
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
      const response = await apiClient.get<PageResponse<Submission>>(
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
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>

      <div className="bg-white shadow sm:rounded-lg p-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted At
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Late
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {submission.assignmentTitle}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {submission.submittedAt
                      ? new Date(submission.submittedAt).toLocaleString()
                      : ''}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {submission.late ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    #{submission.submissionNumber}
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-center text-sm text-gray-500" colSpan={4}>
                    You have not submitted any assignments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {totalPages === 0 ? 0 : page + 1} of {totalPages || 0}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsPage;

