import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTrafficIncidents, createTrafficIncident, updateTrafficIncident, getActiveIncidents } from '../../services/api';
import Layout from '../../components/Layout/Layout';
import IncidentCard from '../../components/traffic/IncidentCard';
import { FaPlus, FaSearch, FaCarCrash, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TrafficIncidents = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    incident_type: 'accident',
    location: '',
    description: '',
    severity: 'medium',
    incident_time: ''
  });

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter]);

  const fetchIncidents = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await getTrafficIncidents(params);
      setIncidents(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTrafficIncident(formData);
      toast.success('Incident reported successfully');
      setShowModal(false);
      setFormData({ incident_type: 'accident', location: '', description: '', severity: 'medium', incident_time: '' });
      fetchIncidents();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to report incident');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateTrafficIncident(id, { status: newStatus });
      toast.success('Incident status updated');
      fetchIncidents();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredIncidents = incidents.filter(incident =>
    incident.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.incident_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div><h1 className="text-2xl font-bold text-gray-800">Traffic Incidents</h1><p className="text-gray-500">Report and track traffic incidents</p></div>
          <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <FaPlus /><span>Report Incident</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2 mb-3"><FaFilter className="text-gray-500" /><span className="font-medium">Filters</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative"><FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by location or incident number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="">All Status</option><option value="reported">Reported</option><option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option><option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} onUpdateStatus={isAdmin ? handleUpdateStatus : null} isAdmin={isAdmin} />
          ))}
        </div>

        {filteredIncidents.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center"><FaCarCrash className="text-6xl text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No incidents found</p></div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Report Incident</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={formData.incident_type} onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="accident">Accident</option><option value="vehicle_breakdown">Vehicle Breakdown</option>
                <option value="road_closure">Road Closure</option><option value="protest">Protest</option>
                <option value="construction">Construction</option><option value="other">Other</option>
              </select>
              <input type="text" placeholder="Location *" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              <textarea placeholder="Description *" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" className="w-full px-3 py-2 border rounded-lg" required />
              <select value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
              </select>
              <input type="datetime-local" value={formData.incident_time} onChange={(e) => setFormData({ ...formData, incident_time: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TrafficIncidents;