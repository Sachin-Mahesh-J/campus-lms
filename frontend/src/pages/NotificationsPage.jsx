import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [markingId, setMarkingId] = useState(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: '20',
        sort: 'sentAt,desc',
      });
      const response = await apiClient.get(
        `/notifications/me?${params.toString()}`
      );
      setNotifications(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const markDelivered = async (id) => {
    setMarkingId(id);
    try {
      await apiClient.put(`/notifications/${id}/delivered`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, delivered: true } : n)));
    } catch {
      toast.error('Failed to mark as delivered');
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="ui-display">Notifications</h1>
        <p className="ui-muted">Updates about assignments, materials, attendance, and more.</p>
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        {loading ? (
          <div className="text-center py-8 ui-muted">Loading...</div>
        ) : notifications.length === 0 ? (
          <p className="ui-muted">You have no notifications.</p>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead className="ui-thead">
                <tr>
                  <th className="ui-th">Title</th>
                  <th className="ui-th">Type</th>
                  <th className="ui-th">Sent</th>
                  <th className="ui-th">Status</th>
                  <th className="ui-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSubtle">
                {notifications.map((n) => (
                  <tr key={n.id}>
                    <td className="ui-td">
                      <div className="font-medium text-textPrimary">{n.title}</div>
                      <div className="ui-caption mt-1 max-w-2xl truncate" title={n.message}>
                        {n.message}
                      </div>
                    </td>
                    <td className="ui-td-muted">
                      <span className="ui-pill">{n.type?.toLowerCase?.() ?? 'notification'}</span>
                    </td>
                    <td className="ui-td-muted">{n.sentAt ? new Date(n.sentAt).toLocaleString() : ''}</td>
                    <td className="ui-td-muted">
                      <span className="ui-pill">{n.delivered ? 'delivered' : 'new'}</span>
                    </td>
                    <td className="ui-td text-right">
                      {!n.delivered ? (
                        <button
                          className="ui-btn-secondary ui-btn-sm"
                          disabled={markingId === n.id}
                          onClick={() => markDelivered(n.id)}
                        >
                          {markingId === n.id ? 'Saving...' : 'Mark delivered'}
                        </button>
                      ) : (
                        <span className="ui-caption">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-2 flex justify-between items-center">
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

export default NotificationsPage;


