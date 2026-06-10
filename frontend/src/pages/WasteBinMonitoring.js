import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWasteBins, createWasteBin, updateWasteBin } from '../services/api';
import Layout from '../components/Layout/Layout';
import BinStatusCard from '../components/Waste/BinStatusCard';
import { FaPlus, FaSearch, FaTrashAlt, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const WasteBinMonitoring = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBin, setEditingBin] = useState(null);
  const [formData, setFormData] = useState({
    bin_code: '',
    location: '',
    bin_capacity: '',
    fill_level: 0,
    status: 'empty',
    installed_date: ''
  });

  useEffect(() => {
    fetchBins();
  }, [statusFilter]);

  const fetchBins = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await getWasteBins(params);
      setBins(response.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBin) {
        await updateWasteBin(editingBin.id, { fill_level: formData.fill_level });
        toast.success('Bin level updated successfully');
      } else {
        await createWasteBin(formData);
        toast.success('Bin added successfully');
      }
      setShowModal(false);
      setEditingBin(null);
      setFormData({ bin_code: '', location: '', bin_capacity: '', fill_level: 0, status: 'empty', installed_date: '' });
      fetchBins();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = (bin) => {
    setEditingBin(bin);
    setFormData({
      bin_code: bin.bin_code,
      location: bin.location,
      bin_capacity: bin.bin_capacity,
      fill_level: bin.fill_level,
      status: bin.status,
      installed_date: bin.installed_date?.split('T')[0] || ''
    });
    setShowModal(true);
  };

  const filteredBins = bins.filter(bin =>
    bin.bin_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bin.location?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl font-bold text-gray-800">Waste Bin Monitoring</h1>
            <p className="text-gray-500">Monitor fill levels and manage public waste bins</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditingBin(null); setFormData({ bin_code: '', location: '', bin_capacity: '', fill_level: 0, status: 'empty', installed_date: '' }); setShowModal(true); }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FaPlus />
              <span>Add Bin</span>
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FaFilter className="text-gray-500" />
            <span className="font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by bin code or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="empty">Empty</option>
              <option value="partial">Partial</option>
              <option value="full">Full</option>
              <option value="overflowing">Overflowing</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Bins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBins.map((bin) => (
            <BinStatusCard
              key={bin.id}
              bin={bin}
              onEdit={isAdmin ? handleEdit : null}
              isAdmin={isAdmin}
            />
          ))}
        </div>

        {filteredBins.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaTrashAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No waste bins found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingBin ? 'Update Bin Level' : 'Add Bin'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingBin && (
                <>
                  <input
                    type="text"
                    placeholder="Bin Code * (e.g., BIN-A-001)"
                    value={formData.bin_code}
                    onChange={(e) => setFormData({ ...formData, bin_code: e.target.value.toUpperCase() })}
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
                    placeholder="Capacity (kg) *"
                    value={formData.bin_capacity}
                    onChange={(e) => setFormData({ ...formData, bin_capacity: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="date"
                    value={formData.installed_date}
                    onChange={(e) => setFormData({ ...formData, installed_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </>
              )}
              {editingBin && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Bin: {editingBin.bin_code}</p>
                  <p className="text-sm text-gray-600">Location: {editingBin.location}</p>
                  <p className="text-sm text-gray-600">Capacity: {editingBin.bin_capacity} kg</p>
                  <p className="text-sm text-gray-600">Current Fill: {editingBin.fill_level} kg ({((editingBin.fill_level / editingBin.bin_capacity) * 100).toFixed(0)}%)</p>
                </div>
              )}
              {editingBin && (
                <input
                  type="number"
                  placeholder="New Fill Level (kg)"
                  value={formData.fill_level}
                  onChange={(e) => setFormData({ ...formData, fill_level: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              )}
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

export default WasteBinMonitoring;