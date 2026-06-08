import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTransformers, createTransformer, updateTransformer, getSubstations } from '../services/api';
import Layout from '../components/Layout/Layout';
import { FaPlus, FaEdit, FaBolt, FaSearch, FaBuilding } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const TransformerManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [transformers, setTransformers] = useState([]);
  const [substations, setSubstations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTransformer, setEditingTransformer] = useState(null);
  const [formData, setFormData] = useState({
    transformer_code: '',
    substation_id: '',
    location: '',
    capacity_kva: '',
    installation_date: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transformersRes, substationsRes] = await Promise.all([
        getTransformers(),
        getSubstations()
      ]);
      setTransformers(transformersRes.data || []);
      setSubstations(substationsRes.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransformer) {
        await updateTransformer(editingTransformer.id, formData);
        toast.success('Transformer updated successfully');
      } else {
        await createTransformer(formData);
        toast.success('Transformer created successfully');
      }
      setShowModal(false);
      setEditingTransformer(null);
      setFormData({ transformer_code: '', substation_id: '', location: '', capacity_kva: '', installation_date: '', status: 'active' });
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = (transformer) => {
    setEditingTransformer(transformer);
    setFormData({
      transformer_code: transformer.transformer_code,
      substation_id: transformer.substation_id,
      location: transformer.location,
      capacity_kva: transformer.capacity_kva,
      installation_date: transformer.installation_date?.split('T')[0] || '',
      status: transformer.status
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'fault': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransformers = transformers.filter(t =>
    t.transformer_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.substation_name?.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Transformer Management</h1>
            <p className="text-gray-500">Manage electrical transformers across substations</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditingTransformer(null); setFormData({ transformer_code: '', substation_id: '', location: '', capacity_kva: '', installation_date: '', status: 'active' }); setShowModal(true); }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FaPlus />
              <span>Add Transformer</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code, location, or substation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTransformers.map((transformer) => (
            <div key={transformer.id} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaBolt className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{transformer.transformer_code}</h3>
                    <p className="text-xs text-gray-500">{transformer.substation_name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(transformer.status)}`}>
                  {transformer.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span> {transformer.location}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Capacity:</span> {transformer.capacity_kva} kVA
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Installed:</span> {new Date(transformer.installation_date).toLocaleDateString()}
                </p>
              </div>
              
              {isAdmin && (
                <div className="flex justify-end space-x-2 pt-3 border-t">
                  <button onClick={() => handleEdit(transformer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTransformers.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaBolt className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No transformers found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingTransformer ? 'Edit Transformer' : 'Add Transformer'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Transformer Code * (e.g., TRF-A1)"
                value={formData.transformer_code}
                onChange={(e) => setFormData({ ...formData, transformer_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <select
                value={formData.substation_id}
                onChange={(e) => setFormData({ ...formData, substation_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select Substation *</option>
                {substations.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.substation_name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Location *"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Capacity (kVA) *"
                value={formData.capacity_kva}
                onChange={(e) => setFormData({ ...formData, capacity_kva: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="date"
                value={formData.installation_date}
                onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="fault">Fault</option>
                <option value="maintenance">Maintenance</option>
              </select>
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

export default TransformerManagement;