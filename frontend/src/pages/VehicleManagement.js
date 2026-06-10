import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWasteVehicles, createWasteVehicle, updateWasteVehicle, deleteWasteVehicle } from '../services/api';
import Layout from '../components/Layout/Layout';
import VehicleCard from '../components/Waste/VehicleCard';
import { FaPlus, FaSearch, FaTruck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const VehicleManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_type: 'truck',
    driver_name: '',
    contact_number: '',
    status: 'active'
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await getWasteVehicles();
      setVehicles(response.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await updateWasteVehicle(editingVehicle.id, formData);
        toast.success('Vehicle updated successfully');
      } else {
        await createWasteVehicle(formData);
        toast.success('Vehicle added successfully');
      }
      setShowModal(false);
      setEditingVehicle(null);
      setFormData({ vehicle_number: '', vehicle_type: 'truck', driver_name: '', contact_number: '', status: 'active' });
      fetchVehicles();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicle_number: vehicle.vehicle_number,
      vehicle_type: vehicle.vehicle_type,
      driver_name: vehicle.driver_name,
      contact_number: vehicle.contact_number,
      status: vehicle.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteWasteVehicle(id);
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.driver_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl font-bold text-gray-800">Waste Vehicle Management</h1>
            <p className="text-gray-500">Manage collection vehicles and drivers</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditingVehicle(null); setFormData({ vehicle_number: '', vehicle_type: 'truck', driver_name: '', contact_number: '', status: 'active' }); setShowModal(true); }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FaPlus />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vehicle number or driver name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaTruck className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No vehicles found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Vehicle Number *"
                value={formData.vehicle_number}
                onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <select
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="truck">Truck</option>
                <option value="compactor">Compactor</option>
                <option value="tipper">Tipper</option>
                <option value="dumper">Dumper</option>
              </select>
              <input
                type="text"
                placeholder="Driver Name *"
                value={formData.driver_name}
                onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="tel"
                placeholder="Contact Number *"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
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

export default VehicleManagement;