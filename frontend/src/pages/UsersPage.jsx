import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'STUDENT',
    password: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
      });
      if (search) params.append('search', search);
      const response = await apiClient.get(`/users?${params.toString()}`);
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.fullName.trim() || !form.password) {
      toast.error('Username, email, full name and password are required');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/users', {
        username: form.username.trim(),
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        role: form.role,
        password: form.password,
      });
      toast.success('User created');
      setForm({
        username: '',
        email: '',
        fullName: '',
        role: 'STUDENT',
        password: '',
      });
      loadUsers();
    } catch {
      toast.error('Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="ui-display">Users</h1>
          <p className="ui-muted">Create accounts and view existing users.</p>
        </div>
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        <div className="ui-card-header">
          <h2 className="ui-h2">Create user</h2>
          <span className="ui-pill">admin-only</span>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="ui-caption block mb-1">Username</label>
            <input
              type="text"
              className="ui-input"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="teacher1"
            />
          </div>
          <div>
            <label className="ui-caption block mb-1">Email</label>
            <input
              type="email"
              className="ui-input"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="teacher1@example.com"
            />
          </div>
          <div>
            <label className="ui-caption block mb-1">Full name</label>
            <input
              type="text"
              className="ui-input"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder="Teacher One"
            />
          </div>
          <div>
            <label className="ui-caption block mb-1">Role</label>
            <select
              className="ui-select"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="ui-caption block mb-1">Password</label>
            <input
              type="password"
              className="ui-input"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="At least 8 characters, letters and numbers"
            />
          </div>
          <div className="flex items-center mt-6">
            <button
              type="submit"
              disabled={saving}
              className="ui-btn-primary"
            >
              {saving ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        <div className="ui-card-header">
          <h2 className="ui-h2">Existing users</h2>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="ui-input w-64"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 ui-muted">Loading...</div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead className="ui-thead">
              <tr>
                <th className="ui-th">
                  Name
                </th>
                <th className="ui-th">
                  Email
                </th>
                <th className="ui-th">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderSubtle">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="ui-td">{u.fullName}</td>
                  <td className="ui-td-muted">{u.email}</td>
                  <td className="ui-td-muted">
                    <span className="ui-pill">{u.role.toLowerCase()}</span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-textSecondary" colSpan={3}>
                    No users found.
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

export default UsersPage;


