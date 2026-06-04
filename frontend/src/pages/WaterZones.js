import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWaterZones, createWaterZone, updateWaterZone, deleteWaterZone } from '../services/api';
import Layout from '../components/Layout/Layout';
import WaterZoneCard from '../components/Water/WaterZoneCard';
import { FaPlus, FaSearch, FaTint } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const WaterZones = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    zone_code: '',
    zone_name: '',
    area_name: '',
    population: 0,
    status: 'active'
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await getWaterZones();
      setZones(response.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingZone) {
        await updateWaterZone(editingZone.id, formData);
        toast.success('Zone updated successfully');
      } else {
        await createWaterZone(formData);
        toast.success('Zone created successfully');
      }
      setShowModal(false);
      setEditingZone(null);
      setFormData({ zone_code: '', zone_name: '', area_name: '', population: 0, status: 'active' });
      fetchZones();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      zone_code: zone.zone_code,
      zone_name: zone.zone_name,
      area_name: zone.area_name,
      population: zone.population,
      status: zone.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this zone?')) {
      try {
        await deleteWaterZone(id);
        toast.success('Zone deleted successfully');
        fetchZones();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const filteredZones = (zones || []).filter(zone =>
    zone?.zone_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone?.zone_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone?.area_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl font-bold text-gray-800">Water Zones</h1>
            <p className="text-gray-500">Manage water distribution zones</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditingZone(null); setFormData({ zone_code: '', zone_name: '', area_name: '', population: 0, status: 'active' }); setShowModal(true); }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FaPlus />
              <span>Add Zone</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by zone name, code, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredZones.map((zone) => (
            <WaterZoneCard
              key={zone.id}
              zone={zone}
              onEdit={isAdmin ? handleEdit : null}
              onDelete={isAdmin ? handleDelete : null}
            />
          ))}
        </div>

        {filteredZones.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaTint className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No water zones found</p>
          </div>
        )}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingZone ? 'Edit Zone' : 'Add Zone'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Zone Code * (e.g., ZONEA)"
                value={formData.zone_code}
                onChange={(e) => setFormData({ ...formData, zone_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Zone Name *"
                value={formData.zone_name}
                onChange={(e) => setFormData({ ...formData, zone_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Area Name *"
                value={formData.area_name}
                onChange={(e) => setFormData({ ...formData, area_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Population"
                value={formData.population}
                onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
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

export default WaterZones;