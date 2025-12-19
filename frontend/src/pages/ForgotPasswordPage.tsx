import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Password reset email sent');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center py-10">
        <div className="ui-container flex justify-center">
          <div className="ui-card ui-card-pad w-full max-w-md space-y-3 text-center">
            <h2 className="ui-h1">Check your email</h2>
            <p className="ui-muted">
              We’ve sent a password reset link to <span className="font-medium text-textPrimary">{email}</span>.
            </p>
            <div className="pt-2">
              <Link to="/login" className="ui-btn-secondary w-full justify-center">
                Back to login
              </Link>
            </div>
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
            <h2 className="ui-h1">Forgot your password?</h2>
            <p className="ui-muted">Enter your email and we’ll send a reset link.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="ui-caption block mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="ui-input"
                placeholder="you@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="ui-btn-primary w-full">
              {loading ? 'Sending…' : 'Send reset link'}
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

export default ForgotPasswordPage;

