import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { Dashboard } from '../../types';
import toast from 'react-hot-toast';

const StudentDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get<Dashboard>('/dashboard/student');
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
          <h1 className="ui-display">Student dashboard</h1>
          <p className="ui-muted">Stay on top of your coursework and deadlines.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/assignments" className="ui-btn-primary">
            Assignments
          </Link>
          <Link to="/submissions" className="ui-btn-secondary">
            Submissions
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Enrolled courses', value: dashboard?.totalCourses || 0 },
          { label: 'Total assignments', value: dashboard?.totalAssignments || 0 },
          { label: 'Pending submissions', value: dashboard?.pendingSubmissions || 0 },
          { label: 'Completed assignments', value: dashboard?.completedAssignments || 0 },
          { label: 'Attendance rate', value: `${dashboard?.attendanceRate || 0}%` },
        ].map((stat) => (
          <div key={stat.label} className="ui-card ui-card-pad">
            <div className="text-3xl font-bold text-textPrimary">{stat.value}</div>
            <div className="ui-caption mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;

