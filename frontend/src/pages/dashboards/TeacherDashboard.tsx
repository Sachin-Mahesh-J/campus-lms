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
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="text-2xl font-bold text-gray-900">{dashboard?.totalCourses || 0}</div>
            <div className="text-sm font-medium text-gray-500">Total Courses</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="text-2xl font-bold text-gray-900">{dashboard?.totalBatches || 0}</div>
            <div className="text-sm font-medium text-gray-500">Total Batches</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="text-2xl font-bold text-gray-900">{dashboard?.totalStudents || 0}</div>
            <div className="text-sm font-medium text-gray-500">Total Students</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="text-2xl font-bold text-gray-900">{dashboard?.pendingGradings || 0}</div>
            <div className="text-sm font-medium text-gray-500">Pending Gradings</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="text-2xl font-bold text-gray-900">{dashboard?.totalAssignments || 0}</div>
            <div className="text-sm font-medium text-gray-500">Total Assignments</div>
          </div>
        </div>
      </div>
      <div className="mt-6 space-x-4">
        <Link to="/assignments" className="text-indigo-600 hover:text-indigo-500">
          Manage Assignments →
        </Link>
        <Link to="/grades" className="text-indigo-600 hover:text-indigo-500">
          Grade Submissions →
        </Link>
      </div>
    </div>
  );
};

export default TeacherDashboard;

