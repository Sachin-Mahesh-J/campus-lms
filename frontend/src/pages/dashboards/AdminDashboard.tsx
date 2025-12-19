import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { Dashboard } from '../../types';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get<Dashboard>('/dashboard/admin');
        setDashboard(response.data);
      } catch (error) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="ui-card ui-card-pad text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="ui-display">Admin dashboard</h1>
          <p className="ui-muted">A quick overview of users, courses, and activity.</p>
        </div>
        <Link to="/courses" className="ui-btn-primary">
          Manage courses
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Total users', value: dashboard?.totalUsers || 0 },
          { label: 'Total courses', value: dashboard?.totalCourses || 0 },
          { label: 'Total batches', value: dashboard?.totalBatches || 0 },
          { label: 'Total students', value: dashboard?.totalStudents || 0 },
          { label: 'Total teachers', value: dashboard?.totalTeachers || 0 },
        ].map((stat) => (
          <div key={stat.label} className="ui-card ui-card-pad">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-3xl font-bold text-textPrimary">{stat.value}</div>
                <div className="ui-caption mt-1">{stat.label}</div>
              </div>
              <div className="ui-pill ui-pill-yellow">live</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

