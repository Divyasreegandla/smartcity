import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMaintenanceRecords, createMaintenance, updateMaintenance, getTransformers } from '../services/api';
import Layout from '../components/Layout/Layout';
import { FaPlus, FaEdit, FaClipboardList, FaSearch, FaWrench } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const MaintenanceManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [records, setRecords] = useState([]);
  const [transformers, setTransformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    transformer_id: '',
    maintenance_date: '',
    maintenance_type: 'routine',
    maintenance_cost: '',
    technician_name: '',
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recordsRes, transformersRes] = await Promise.all([
        getMaintenanceRecords(),
        getTransformers()
      ]);
      setRecords(recordsRes.data || []);
      setTransformers(transformersRes.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await updateMaintenance(editingRecord.id, formData);
        toast.success('Maintenance record updated');
      } else {
        await createMaintenance(formData);
        toast.success('Maintenance scheduled');
      }
      setShowModal(false);
      setEditingRecord(null);
      setFormData({ transformer_id: '', maintenance_date: '', maintenance_type: 'routine', maintenance_cost: '', technician_name: '', remarks: '' });
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      transformer_id: record.transformer_id,
      maintenance_date: record.maintenance_date?.split('T')[0] || '',
      maintenance_type: record.maintenance_type,
      maintenance_cost: record.maintenance_cost,
      technician_name: record.technician_name || '',
      remarks: record.remarks || ''
    });
    setShowModal(true);
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'routine': return 'bg-green-100 text-green-800';
      case 'preventive': return 'bg-blue-100 text-blue-800';
      case 'corrective': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = records.filter(r =>
    r.transformer_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.technician_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-500">Access denied. Admin only.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Maintenance Management</h1>
            <p className="text-gray-500">Schedule and track transformer maintenance</p>
          </div>
          <button
            onClick={() => { setEditingRecord(null); setFormData({ transformer_id: '', maintenance_date: '', maintenance_type: 'routine', maintenance_cost: '', technician_name: '', remarks: '' }); setShowModal(true); }}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <FaPlus />
            <span>Schedule Maintenance</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by transformer code or technician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transformer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{record.transformer_code}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(record.maintenance_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(record.maintenance_type)}`}>
                        {record.maintenance_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">₹{record.maintenance_cost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{record.technician_name || '-'}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleEdit(record)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No maintenance records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Maintenance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingRecord ? 'Edit Maintenance' : 'Schedule Maintenance'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                value={formData.transformer_id}
                onChange={(e) => setFormData({ ...formData, transformer_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select Transformer *</option>
                {transformers.map(t => (
                  <option key={t.id} value={t.id}>{t.transformer_code} - {t.location}</option>
                ))}
              </select>
              <input
                type="date"
                value={formData.maintenance_date}
                onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <select
                value={formData.maintenance_type}
                onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="routine">Routine</option>
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
                <option value="urgent">Urgent</option>
              </select>
              <input
                type="number"
                placeholder="Maintenance Cost (₹)"
                value={formData.maintenance_cost}
                onChange={(e) => setFormData({ ...formData, maintenance_cost: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Technician Name"
                value={formData.technician_name}
                onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows="2"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MaintenanceManagement;