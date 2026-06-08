import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSubstations, createSubstation, updateSubstation, deleteSubstation } from '../services/api';
import Layout from '../components/Layout/Layout';
import { FaPlus, FaEdit, FaTrash, FaBuilding, FaSearch, FaTint } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const SubstationManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [substations, setSubstations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubstation, setEditingSubstation] = useState(null);
  const [formData, setFormData] = useState({
    substation_code: '',
    substation_name: '',
    location: '',
    capacity_mw: '',
    status: 'active'
  });

  useEffect(() => {
    fetchSubstations();
  }, []);

  const fetchSubstations = async () => {
    try {
      const response = await getSubstations();
      setSubstations(response.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubstation) {
        await updateSubstation(editingSubstation.id, formData);
        toast.success('Substation updated successfully');
      } else {
        await createSubstation(formData);
        toast.success('Substation created successfully');
      }
      setShowModal(false);
      setEditingSubstation(null);
      setFormData({ substation_code: '', substation_name: '', location: '', capacity_mw: '', status: 'active' });
      fetchSubstations();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = (substation) => {
    setEditingSubstation(substation);
    setFormData({
      substation_code: substation.substation_code,
      substation_name: substation.substation_name,
      location: substation.location,
      capacity_mw: substation.capacity_mw,
      status: substation.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this substation?')) {
      try {
        await deleteSubstation(id);
        toast.success('Substation deleted successfully');
        fetchSubstations();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSubstations = substations.filter(s =>
    s.substation_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.substation_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.location?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl font-bold text-gray-800">Substation Management</h1>
            <p className="text-gray-500">Manage electrical substations across the city</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditingSubstation(null); setFormData({ substation_code: '', substation_name: '', location: '', capacity_mw: '', status: 'active' }); setShowModal(true); }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FaPlus />
              <span>Add Substation</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubstations.map((substation) => (
            <div key={substation.id} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaBuilding className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{substation.substation_name}</h3>
                    <p className="text-xs text-gray-500">{substation.substation_code}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(substation.status)}`}>
                  {substation.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span> {substation.location}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Capacity:</span> {substation.capacity_mw} MW
                </p>
              </div>
              
              {isAdmin && (
                <div className="flex justify-end space-x-2 pt-3 border-t">
                  <button onClick={() => handleEdit(substation)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(substation.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredSubstations.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No substations found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingSubstation ? 'Edit Substation' : 'Add Substation'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Substation Code * (e.g., SUB-A1)"
                value={formData.substation_code}
                onChange={(e) => setFormData({ ...formData, substation_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Substation Name *"
                value={formData.substation_name}
                onChange={(e) => setFormData({ ...formData, substation_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
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
                step="0.1"
                placeholder="Capacity (MW) *"
                value={formData.capacity_mw}
                onChange={(e) => setFormData({ ...formData, capacity_mw: parseFloat(e.target.value) })}
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

export default SubstationManagement;