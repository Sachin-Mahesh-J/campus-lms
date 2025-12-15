import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Batch, Course, CourseMaterial, PageResponse } from '../types';
import toast from 'react-hot-toast';

const MaterialsPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCourses();
    loadAllBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      loadMaterials();
    } else {
      setMaterials([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchId]);

  const loadCourses = async () => {
    try {
      const params = new URLSearchParams({ page: '0', size: '100', sort: 'title,asc' });
      const response = await apiClient.get<PageResponse<Course>>(`/courses?${params.toString()}`);
      setCourses(response.data.content);
    } catch {
      toast.error('Failed to load courses');
    }
  };

  const loadAllBatches = async () => {
    try {
      const params = new URLSearchParams({ page: '0', size: '200' });
      const response = await apiClient.get<PageResponse<Batch>>(`/batches?${params.toString()}`);
      setBatches(response.data.content);
    } catch {
      toast.error('Failed to load batches');
    }
  };

  const loadMaterials = async () => {
    if (!selectedBatchId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        batchId: selectedBatchId,
        page: '0',
        size: '100',
      } as any);
      const response = await apiClient.get<PageResponse<CourseMaterial>>(
        `/materials?${params.toString()}`
      );
      setMaterials(response.data.content);
    } catch {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = selectedCourseId
    ? batches.filter((b) => b.courseId === selectedCourseId)
    : batches;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      toast.error('Select a batch first');
      return;
    }
    if (!file) {
      toast.error('Select a file to upload');
      return;
    }
    if (!title) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append(
        'request',
        new Blob([JSON.stringify({ batchId: selectedBatchId, title })], {
          type: 'application/json',
        })
      );
      formData.append('file', file);
      await apiClient.post('/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Material uploaded');
      setFile(null);
      setTitle('');
      loadMaterials();
    } catch {
      toast.error('Failed to upload material');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await apiClient.delete(`/materials/${id}`);
      toast.success('Material deleted');
      loadMaterials();
    } catch {
      toast.error('Failed to delete material');
    }
  };

  const handleDownload = (id: string) => {
    window.open(`/api/materials/${id}/download`, '_blank');
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Course Materials</h1>

      <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Select Batch</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              className="mt-1 block w-64 border border-gray-300 rounded-md px-3 py-2"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedBatchId('');
              }}
            >
              <option value="">All courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select
              className="mt-1 block w-64 border border-gray-300 rounded-md px-3 py-2"
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
            >
              <option value="">Select batch</option>
              {filteredBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name} ({batch.academicYear}, S{batch.semester})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Upload Material</h2>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lecture slides"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-gray-500"
            />
          </div>
          <div className="flex items-center mt-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Materials</h2>
        {!selectedBatchId ? (
          <p className="text-sm text-gray-500">Select a batch to view materials.</p>
        ) : loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded At
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{material.title}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {material.fileSize ? `${(material.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">{material.uploadedByName}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {material.uploadedAt ? new Date(material.uploadedAt).toLocaleString() : ''}
                  </td>
                  <td className="px-4 py-2 text-sm text-right space-x-2">
                    <button
                      onClick={() => handleDownload(material.id)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="inline-flex items-center px-3 py-1 border border-red-300 text-xs rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-center text-sm text-gray-500" colSpan={5}>
                    No materials uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;

