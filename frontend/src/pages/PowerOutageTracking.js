import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPowerOutages, createPowerOutage, updatePowerOutage } from '../services/api';
import Layout from '../components/Layout/Layout';
import OutageStatusCard from '../components/Electricity/OutageStatusCard';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const PowerOutageTracking = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [outages, setOutages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ status: '', area_name: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    area_name: '',
    outage_reason: '',
    outage_start_time: '',
    status: 'reported'
  });

  useEffect(() => {
    fetchOutages();
  }, [filters]);

  const fetchOutages = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.area_name) params.area_name = filters.area_name;
      const response = await getPowerOutages(params);
      setOutages(response.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPowerOutage(formData);
      toast.success('Outage reported successfully');
      setShowModal(false);
      setFormData({ area_name: '', outage_reason: '', outage_start_time: '', status: 'reported' });
      fetchOutages();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleResolveOutage = async (outageId) => {
    try {
      await updatePowerOutage(outageId, { status: 'resolved' });
      toast.success('Outage marked as resolved');
      fetchOutages();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const filteredOutages = outages.filter(outage =>
    outage.area_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl font-bold text-gray-800">Power Outage Tracking</h1>
            <p className="text-gray-500">Report and track power outages across the city</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <FaPlus />
            <span>Report Outage</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FaFilter className="text-gray-500" />
            <span className="font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Status</option>
              <option value="reported">Reported</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="text"
              placeholder="Search by area name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Outages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOutages.map((outage) => (
            <OutageStatusCard
              key={outage.id}
              outage={outage}
              onResolve={isAdmin && outage.status !== 'resolved' ? handleResolveOutage : null}
            />
          ))}
        </div>

        {filteredOutages.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaExclamationTriangle className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No outage reports found</p>
          </div>
        )}
      </div>

      {/* Report Outage Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Report Power Outage</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Area Name *"
                value={formData.area_name}
                onChange={(e) => setFormData({ ...formData, area_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <textarea
                placeholder="Outage Reason *"
                value={formData.outage_reason}
                onChange={(e) => setFormData({ ...formData, outage_reason: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="datetime-local"
                value={formData.outage_start_time}
                onChange={(e) => setFormData({ ...formData, outage_start_time: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="reported">Reported</option>
                <option value="in_progress">In Progress</option>
              </select>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PowerOutageTracking;