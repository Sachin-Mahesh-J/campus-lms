import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { Dashboard } from '../../types';
import toast from 'react-hot-toast';

const TeacherDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get<Dashboard>('/dashboard/teacher');
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
          <h1 className="ui-display">Teacher dashboard</h1>
          <p className="ui-muted">Plan, teach, and grade — all in one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/assignments" className="ui-btn-primary">
            Assignments
          </Link>
          <Link to="/attendance" className="ui-btn-secondary">
            Attendance
          </Link>
          <Link to="/grades" className="ui-btn-secondary">
            Grades
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Total courses', value: dashboard?.totalCourses || 0 },
          { label: 'Total batches', value: dashboard?.totalBatches || 0 },
          { label: 'Total students', value: dashboard?.totalStudents || 0 },
          { label: 'Pending gradings', value: dashboard?.pendingGradings || 0 },
          { label: 'Total assignments', value: dashboard?.totalAssignments || 0 },
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

export default TeacherDashboard;

