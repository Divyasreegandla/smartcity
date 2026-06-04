import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWaterTanks, createWaterTank, updateWaterTank } from '../services/api';
import Layout from '../components/Layout/Layout';
import TankStatusIndicator from '../components/Water/TankStatusIndicator';
import { FaPlus, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

const WaterTanks = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTank, setEditingTank] = useState(null);
  const [formData, setFormData] = useState({
    tank_name: '',
    location: '',
    capacity_liters: '',
    current_level: 0,
    status: 'partial'
  });

  useEffect(() => {
    fetchTanks();
  }, []);

  const fetchTanks = async () => {
    try {
      const response = await getWaterTanks();
      setTanks(response.data);
    } catch (error) {
      toast.error('Failed to load water tanks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTank) {
        await updateWaterTank(editingTank.id, { current_level: formData.current_level });
        toast.success('Tank level updated successfully');
      } else {
        await createWaterTank(formData);
        toast.success('Tank created successfully');
      }
      setShowModal(false);
      setEditingTank(null);
      setFormData({ tank_name: '', location: '', capacity_liters: '', current_level: 0, status: 'partial' });
      fetchTanks();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (tank) => {
    setEditingTank(tank);
    setFormData({
      tank_name: tank.tank_name,
      location: tank.location,
      capacity_liters: tank.capacity_liters,
      current_level: tank.current_level,
      status: tank.status
    });
    setShowModal(true);
  };

  const filteredTanks = tanks.filter(tank =>
    tank.tank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tank.location.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl font-bold text-gray-800">Water Tanks Monitoring</h1>
            <p className="text-gray-500">Monitor tank levels and capacity</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditingTank(null); setFormData({ tank_name: '', location: '', capacity_liters: '', current_level: 0, status: 'partial' }); setShowModal(true); }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FaPlus />
              <span>Add Tank</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tank name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Tanks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTanks.map((tank) => (
            <div key={tank.id} className="relative">
              <TankStatusIndicator tank={tank} />
              {isAdmin && (
                <button
                  onClick={() => handleEdit(tank)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <FaPlus className="text-primary-600 text-sm" />
                </button>
              )}
            </div>
          ))}
        </div>

        {filteredTanks.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaTint className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No water tanks found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingTank ? 'Update Tank Level' : 'Add Tank'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingTank && (
                <>
                  <input
                    type="text"
                    placeholder="Tank Name *"
                    value={formData.tank_name}
                    onChange={(e) => setFormData({ ...formData, tank_name: e.target.value })}
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
                    placeholder="Capacity (Liters) *"
                    value={formData.capacity_liters}
                    onChange={(e) => setFormData({ ...formData, capacity_liters: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </>
              )}
              {editingTank && (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Tank: {editingTank.tank_name}</p>
                    <p className="text-sm text-gray-600">Capacity: {editingTank.capacity_liters.toLocaleString()} L</p>
                  </div>
                  <input
                    type="number"
                    placeholder="Current Level (Liters)"
                    value={formData.current_level}
                    onChange={(e) => setFormData({ ...formData, current_level: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </>
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

export default WaterTanks;