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
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Student Dashboard</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="text-2xl font-bold text-gray-900">{dashboard?.totalCourses || 0}</div>
            <div className="text-sm font-medium text-gray-500">Enrolled Courses</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="text-2xl font-bold text-gray-900">{dashboard?.totalAssignments || 0}</div>
            <div className="text-sm font-medium text-gray-500">Total Assignments</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="text-2xl font-bold text-gray-900">{dashboard?.pendingSubmissions || 0}</div>
            <div className="text-sm font-medium text-gray-500">Pending Submissions</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="text-2xl font-bold text-gray-900">{dashboard?.completedAssignments || 0}</div>
            <div className="text-sm font-medium text-gray-500">Completed Assignments</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="text-2xl font-bold text-gray-900">{dashboard?.attendanceRate || 0}%</div>
            <div className="text-sm font-medium text-gray-500">Attendance Rate</div>
          </div>
        </div>
      </div>
      <div className="mt-6 space-x-4">
        <Link to="/assignments" className="text-indigo-600 hover:text-indigo-500">
          View Assignments →
        </Link>
        <Link to="/submissions" className="text-indigo-600 hover:text-indigo-500">
          My Submissions →
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;

