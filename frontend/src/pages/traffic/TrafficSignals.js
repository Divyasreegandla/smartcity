import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTrafficSignals, createTrafficSignal, updateTrafficSignal, deleteTrafficSignal } from '../../services/api';
import Layout from '../../components/Layout/Layout';
import SignalStatusCard from '../../components/traffic/SignalStatusCard';
import { FaPlus, FaSearch, FaTrafficLight } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TrafficSignals = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSignal, setEditingSignal] = useState(null);
  const [formData, setFormData] = useState({
    signal_code: '',
    junction_name: '',
    location: '',
    signal_status: 'red',
    installation_date: ''
  });

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

  useEffect(() => {
    fetchSignals();
  }, [statusFilter]);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await getTrafficSignals(params);
      setSignals(response.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format the date correctly for backend - add T separator and Z for UTC
      const formattedData = {
        signal_code: formData.signal_code,
        junction_name: formData.junction_name,
        location: formData.location,
        signal_status: formData.signal_status,
        installation_date: formData.installation_date ? formData.installation_date + 'T00:00:00Z' : ''
      };
      
      if (editingSignal) {
        await updateTrafficSignal(editingSignal.id, formattedData);
        toast.success('Signal updated successfully');
      } else {
        await createTrafficSignal(formattedData);
        toast.success('Signal created successfully');
      }
      setShowModal(false);
      setEditingSignal(null);
      setFormData({ signal_code: '', junction_name: '', location: '', signal_status: 'red', installation_date: '' });
      fetchSignals();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = (signal) => {
    setEditingSignal(signal);
    setFormData({
      signal_code: signal.signal_code,
      junction_name: signal.junction_name,
      location: signal.location,
      signal_status: signal.signal_status,
      installation_date: signal.installation_date ? signal.installation_date.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this traffic signal?')) {
      try {
        await deleteTrafficSignal(id);
        toast.success('Signal deleted successfully');
        fetchSignals();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTrafficSignal(id, { signal_status: newStatus });
      toast.success(`Signal status changed to ${newStatus}`);
      fetchSignals();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const filteredSignals = signals.filter(signal =>
    signal.signal_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    signal.junction_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    signal.location?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div><h1 className="text-2xl font-bold text-gray-800">Traffic Signals</h1><p className="text-gray-500">Manage traffic signals across the city</p></div>
          {isAdmin && (
            <button onClick={() => { setEditingSignal(null); setShowModal(true); }} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <FaPlus /><span>Add Signal</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative"><FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by code, junction or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="">All Status</option><option value="red">Red</option><option value="yellow">Yellow</option>
              <option value="green">Green</option><option value="flashing">Flashing</option><option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSignals.map((signal) => (
            <SignalStatusCard key={signal.id} signal={signal} onEdit={isAdmin ? handleEdit : null} onDelete={isAdmin ? handleDelete : null} onStatusChange={isAdmin ? handleStatusChange : null} isAdmin={isAdmin} />
          ))}
        </div>

        {filteredSignals.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center"><FaTrafficLight className="text-6xl text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No traffic signals found</p></div>
        )}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingSignal ? 'Edit Signal' : 'Add Signal'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Signal Code * (e.g., SIG-001)" value={formData.signal_code} onChange={(e) => setFormData({ ...formData, signal_code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border rounded-lg" required />
              <input type="text" placeholder="Junction Name *" value={formData.junction_name} onChange={(e) => setFormData({ ...formData, junction_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              <input type="text" placeholder="Location *" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              <select value={formData.signal_status} onChange={(e) => setFormData({ ...formData, signal_status: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="red">Red</option><option value="yellow">Yellow</option><option value="green">Green</option>
                <option value="flashing">Flashing</option><option value="maintenance">Maintenance</option>
              </select>
              <input type="date" value={formData.installation_date} onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
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

export default TrafficSignals;