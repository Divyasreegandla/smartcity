import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRoadMaintenance, createRoadMaintenance, updateRoadMaintenance, getActiveMaintenance } from '../../services/api';
import Layout from '../../components/Layout/Layout';
import MaintenanceCard from '../../components/traffic/MaintenanceCard';
import { FaPlus, FaSearch, FaRoad, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RoadMaintenance = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [maintenances, setMaintenances] = useState([]);
  const [activeMaintenance, setActiveMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [formData, setFormData] = useState({
    road_name: '',
    area_name: '',
    maintenance_type: 'routine',
    start_date: '',
    expected_completion_date: '',
    estimated_cost: 0
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const getErrorMessage = (error) => {
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
      if (detail?.msg) return detail.msg;
    }
    if (error.message) return error.message;
    return 'An error occurred';
  };

  const fetchData = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const [maintenanceRes, activeRes] = await Promise.all([
        getRoadMaintenance(params),
        getActiveMaintenance()
      ]);
      setMaintenances(maintenanceRes.data || []);
      setActiveMaintenance(activeRes.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format dates correctly for backend
      const formattedData = {
        road_name: formData.road_name,
        area_name: formData.area_name,
        maintenance_type: formData.maintenance_type,
        start_date: formData.start_date ? formData.start_date + 'T00:00:00Z' : '',
        expected_completion_date: formData.expected_completion_date ? formData.expected_completion_date + 'T00:00:00Z' : '',
        estimated_cost: parseFloat(formData.estimated_cost) || 0
      };
      
      if (editingMaintenance) {
        await updateRoadMaintenance(editingMaintenance.id, { status: formData.status });
        toast.success('Maintenance updated');
      } else {
        await createRoadMaintenance(formattedData);
        toast.success('Maintenance scheduled');
      }
      setShowModal(false);
      setEditingMaintenance(null);
      setFormData({ road_name: '', area_name: '', maintenance_type: 'routine', start_date: '', expected_completion_date: '', estimated_cost: 0 });
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateRoadMaintenance(id, { status: newStatus });
      toast.success('Maintenance status updated');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const filteredMaintenances = maintenances.filter(m =>
    m.road_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.area_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div><h1 className="text-2xl font-bold text-gray-800">Road Maintenance</h1><p className="text-gray-500">Schedule and track road maintenance activities</p></div>
          {isAdmin && (
            <button onClick={() => { setEditingMaintenance(null); setShowModal(true); }} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <FaPlus /><span>Schedule Maintenance</span>
            </button>
          )}
        </div>

        {activeMaintenance.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800">Active Maintenance ({activeMaintenance.length})</h3>
            <p className="text-yellow-700 text-sm">There are {activeMaintenance.length} maintenance activities currently in progress or planned.</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2 mb-3"><FaFilter className="text-gray-500" /><span className="font-medium">Filters</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative"><FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by road or area..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="">All Status</option><option value="planned">Planned</option><option value="in_progress">In Progress</option>
              <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaintenances.map((maintenance) => (
            <MaintenanceCard key={maintenance.id} maintenance={maintenance} onUpdateStatus={isAdmin ? handleUpdateStatus : null} isAdmin={isAdmin} />
          ))}
        </div>

        {filteredMaintenances.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center"><FaRoad className="text-6xl text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No maintenance records found</p></div>
        )}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Schedule Maintenance</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Road Name *" value={formData.road_name} onChange={(e) => setFormData({ ...formData, road_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              <input type="text" placeholder="Area Name *" value={formData.area_name} onChange={(e) => setFormData({ ...formData, area_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              <select value={formData.maintenance_type} onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="routine">Routine</option><option value="repair">Repair</option>
                <option value="resurfacing">Resurfacing</option><option value="reconstruction">Reconstruction</option>
                <option value="emergency">Emergency</option>
              </select>
              <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              <input type="date" value={formData.expected_completion_date} onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              <input type="number" placeholder="Estimated Cost (₹)" value={formData.estimated_cost} onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RoadMaintenance;