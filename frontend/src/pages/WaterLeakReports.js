import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWaterLeakReports, createWaterLeakReport, updateWaterLeakReport, getWaterZones } from '../services/api';
import Layout from '../components/Layout/Layout';
import LeakReportCard from '../components/Water/LeakReportCard';
import { FaPlus, FaSearch, FaFilter, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const WaterLeakReports = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [reports, setReports] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ zone_id: '', status: '' });
  const [formData, setFormData] = useState({
    zone_id: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const params = {};
      if (filters.zone_id) params.zone_id = filters.zone_id;
      if (filters.status) params.status = filters.status;
      
      const [reportsRes, zonesRes] = await Promise.all([
        getWaterLeakReports(params),
        getWaterZones()
      ]);
      setReports(reportsRes.data || []);
      setZones(zonesRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.zone_id || !formData.location || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await createWaterLeakReport(formData);
      toast.success('Leak report submitted successfully');
      setShowModal(false);
      setFormData({ zone_id: '', location: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpdateStatus = async (id, newStatus, oldStatus) => {
    if (newStatus === oldStatus) return;
    let remarks = '';
    if (newStatus === 'resolved') {
      remarks = prompt('Enter resolution remarks:');
      if (remarks === null) return;
    }
    try {
      await updateWaterLeakReport(id, { status: newStatus, resolved_remarks: remarks });
      toast.success('Status updated successfully');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-800">Water Leak Reports</h1>
            <p className="text-gray-500">Report and track water leakage issues</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <FaPlus />
            <span>Report Leak</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FaFilter className="text-gray-500" />
            <span className="font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={filters.zone_id}
              onChange={(e) => setFilters({ ...filters, zone_id: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Zones</option>
              {zones.map(zone => (
                <option key={zone.id} value={zone.id}>{zone.zone_name}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Status</option>
              <option value="reported">Reported</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <LeakReportCard
              key={report.id}
              report={report}
              onUpdateStatus={isAdmin ? handleUpdateStatus : null}
              isAdmin={isAdmin}
            />
          ))}
        </div>

        {reports.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaExclamationTriangle className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No leak reports found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Report Water Leak</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                value={formData.zone_id}
                onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select Zone *</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.zone_name}</option>
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
              <textarea
                placeholder="Description *"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
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

export default WaterLeakReports;