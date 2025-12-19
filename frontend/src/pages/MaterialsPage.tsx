import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Batch, Course, CourseMaterial, PageResponse } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const MaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const canManage = user?.role === 'ADMIN' || user?.role === 'TEACHER';

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
    <div className="space-y-6">
      <div>
        <h1 className="ui-display">Course materials</h1>
        <p className="ui-muted">Upload files for a batch and keep everything organized.</p>
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        <h2 className="ui-h2">Select batch</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="ui-caption block mb-1">Course</label>
            <select
              className="ui-select w-72"
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
            <label className="ui-caption block mb-1">Batch</label>
            <select
              className="ui-select w-72"
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

      <div className="ui-card ui-card-pad space-y-4">
        <h2 className="ui-h2">Upload material</h2>
        {canManage ? (
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="ui-caption block mb-1">Title</label>
              <input
                type="text"
                className="ui-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lecture slides"
              />
            </div>
            <div>
              <label className="ui-caption block mb-1">File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm text-textSecondary"
              />
            </div>
            <div className="flex items-center mt-6">
              <button
                type="submit"
                disabled={saving}
                className="ui-btn-primary"
              >
                {saving ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        ) : (
          <p className="ui-muted">Students can view and download materials, but only teachers/admins can upload.</p>
        )}
      </div>

      <div className="ui-card ui-card-pad space-y-4">
        <h2 className="ui-h2">Materials</h2>
        {!selectedBatchId ? (
          <p className="ui-muted">Select a batch to view materials.</p>
        ) : loading ? (
          <div className="text-center py-8 ui-muted">Loading...</div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead className="ui-thead">
              <tr>
                <th className="ui-th">
                  Title
                </th>
                <th className="ui-th">
                  Size
                </th>
                <th className="ui-th">
                  Uploaded By
                </th>
                <th className="ui-th">
                  Uploaded At
                </th>
                <th className="ui-th text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderSubtle">
              {materials.map((material) => (
                <tr key={material.id}>
                  <td className="ui-td">{material.title}</td>
                  <td className="ui-td-muted">
                    {material.fileSize ? `${(material.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                  </td>
                  <td className="ui-td-muted">{material.uploadedByName}</td>
                  <td className="ui-td-muted">
                    {material.uploadedAt ? new Date(material.uploadedAt).toLocaleString() : ''}
                  </td>
                  <td className="ui-td text-right space-x-2">
                    <button
                      onClick={() => handleDownload(material.id)}
                      className="ui-btn-secondary ui-btn-sm"
                    >
                      Download
                    </button>
                    {canManage ? (
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="ui-btn-danger ui-btn-sm"
                      >
                        Delete
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-textSecondary" colSpan={5}>
                    No materials uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;

