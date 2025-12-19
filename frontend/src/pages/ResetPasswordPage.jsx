import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      toast.error('Password must be at least 8 characters and contain letters and numbers');
      return;
    }
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      toast.success('Password reset successful');
      navigate('/login');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center py-10">
        <div className="ui-container flex justify-center">
          <div className="ui-card ui-card-pad w-full max-w-md space-y-4 text-center">
            <h2 className="ui-h1">Invalid reset link</h2>
            <p className="ui-muted">This reset link is missing or expired. Please request a new one.</p>
            <Link to="/login" className="ui-btn-secondary w-full justify-center">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10">
      <div className="ui-container flex justify-center">
        <div className="ui-card ui-card-pad w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h2 className="ui-h1">Reset your password</h2>
            <p className="ui-muted">Choose a new password you’ll remember.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div>
                <label htmlFor="newPassword" className="ui-caption block mb-1">
                  New password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  className="ui-input"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="ui-caption block mb-1">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="ui-input"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="ui-btn-primary w-full">
              {loading ? 'Resetting…' : 'Reset password'}
            </button>

            <div className="text-center">
              <Link to="/login" className="ui-link text-sm font-medium">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

