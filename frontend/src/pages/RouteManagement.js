import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCollectionRoutes, createCollectionRoute, updateCollectionRoute, getWasteVehicles } from '../services/api';
import Layout from '../components/Layout/Layout';
import { FaPlus, FaEdit, FaRoute, FaSearch, FaTruck, FaTimes, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const RouteManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    route_code: '',
    route_name: '',
    area_name: '',
    assigned_vehicle_id: '',
    collection_schedule: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [routesRes, vehiclesRes] = await Promise.all([
        getCollectionRoutes(),
        getWasteVehicles()
      ]);
      setRoutes(routesRes.data || []);
      setVehicles(vehiclesRes.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoute) {
        await updateCollectionRoute(editingRoute.id, formData);
        toast.success('Route updated successfully');
      } else {
        await createCollectionRoute(formData);
        toast.success('Route created successfully');
      }
      setShowModal(false);
      setEditingRoute(null);
      setFormData({ route_code: '', route_name: '', area_name: '', assigned_vehicle_id: '', collection_schedule: '', status: 'active' });
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      route_code: route.route_code,
      route_name: route.route_name,
      area_name: route.area_name,
      assigned_vehicle_id: route.assigned_vehicle_id || '',
      collection_schedule: route.collection_schedule,
      status: route.status
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRoutes = routes.filter(r =>
    r.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.route_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.area_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl font-bold text-gray-800">Collection Route Management</h1>
            <p className="text-gray-500">Manage waste collection routes and schedules</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditingRoute(null); setFormData({ route_code: '', route_name: '', area_name: '', assigned_vehicle_id: '', collection_schedule: '', status: 'active' }); setShowModal(true); }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FaPlus />
              <span>Add Route</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by route name, code or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Routes Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-gray-800">{route.route_code}</td>
                    <td className="px-6 py-4 text-gray-800">{route.route_name}</td>
                    <td className="px-6 py-4 text-gray-600">{route.area_name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {route.assigned_vehicle_number || 'Not Assigned'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{route.collection_schedule}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(route.status)}`}>
                        {route.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isAdmin && (
                        <button 
                          onClick={() => handleEdit(route)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Route"
                        >
                          <FaEdit />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRoutes.length === 0 && (
            <div className="text-center py-12">
              <FaRoute className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No routes found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingRoute ? 'Edit Route' : 'Add Route'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route Code *</label>
                <input
                  type="text"
                  placeholder="e.g., RT-001"
                  value={formData.route_code}
                  onChange={(e) => setFormData({ ...formData, route_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route Name *</label>
                <input
                  type="text"
                  placeholder="e.g., North Zone Morning Route"
                  value={formData.route_name}
                  onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area Name *</label>
                <input
                  type="text"
                  placeholder="e.g., North Industrial Area"
                  value={formData.area_name}
                  onChange={(e) => setFormData({ ...formData, area_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Vehicle</label>
                <select
                  value={formData.assigned_vehicle_id}
                  onChange={(e) => setFormData({ ...formData, assigned_vehicle_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Vehicle (Optional)</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_number} - {v.driver_name} ({v.status})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collection Schedule *</label>
                <input
                  type="text"
                  placeholder="e.g., Mon, Wed, Fri - 6:00 AM"
                  value={formData.collection_schedule}
                  onChange={(e) => setFormData({ ...formData, collection_schedule: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <FaSave />
                  <span>{editingRoute ? 'Update' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RouteManagement;