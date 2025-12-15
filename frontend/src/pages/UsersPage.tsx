import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { PageResponse, User, UserRole } from '../types';
import toast from 'react-hot-toast';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState<{
    username: string;
    email: string;
    fullName: string;
    role: UserRole;
    password: string;
  }>({
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
      const response = await apiClient.get<PageResponse<User>>(`/users?${params.toString()}`);
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Create User</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="teacher1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="teacher1@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder="Teacher One"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="At least 8 characters, letters and numbers"
            />
          </div>
          <div className="flex items-center mt-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Existing Users</h2>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-64 px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{u.fullName}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{u.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{u.role}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-center text-sm text-gray-500" colSpan={3}>
                    No users found.
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

export default UsersPage;


