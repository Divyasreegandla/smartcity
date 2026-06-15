import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTrafficViolations, createTrafficViolation, updateTrafficViolation } from '../../services/api';
import Layout from '../../components/Layout/Layout';
import ViolationCard from '../../components/traffic/ViolationCard';
import { FaPlus, FaSearch, FaGavel, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TrafficViolations = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_number: '',
    violation_type: 'speeding',
    location: '',
    fine_amount: '',
    violation_date: ''
  });

  useEffect(() => {
    fetchViolations();
  }, [paymentFilter]);

  const fetchViolations = async () => {
    try {
      const params = paymentFilter ? { payment_status: paymentFilter } : {};
      const response = await getTrafficViolations(params);
      setViolations(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch violations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTrafficViolation(formData);
      toast.success('Violation recorded successfully');
      setShowModal(false);
      setFormData({ vehicle_number: '', violation_type: 'speeding', location: '', fine_amount: '', violation_date: '' });
      fetchViolations();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record violation');
    }
  };

  const handleUpdatePayment = async (id, status) => {
    try {
      await updateTrafficViolation(id, { payment_status: status });
      toast.success('Payment status updated');
      fetchViolations();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const filteredViolations = violations.filter(v =>
    v.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalFine = violations.reduce((sum, v) => sum + (v.fine_amount || 0), 0);
  const paidFine = violations.filter(v => v.payment_status === 'paid').reduce((sum, v) => sum + (v.fine_amount || 0), 0);
  const pendingFine = totalFine - paidFine;

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
          <div><h1 className="text-2xl font-bold text-gray-800">Traffic Violations</h1><p className="text-gray-500">Manage traffic violations and fines</p></div>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <FaPlus /><span>Record Violation</span>
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4"><p className="text-gray-500 text-sm">Total Violations</p><p className="text-2xl font-bold text-gray-800">{violations.length}</p></div>
          <div className="bg-white rounded-xl shadow-md p-4"><p className="text-gray-500 text-sm">Total Fine Amount</p><p className="text-2xl font-bold text-red-600">₹{totalFine.toLocaleString()}</p></div>
          <div className="bg-white rounded-xl shadow-md p-4"><p className="text-gray-500 text-sm">Collected Fine</p><p className="text-2xl font-bold text-green-600">₹{paidFine.toLocaleString()}</p></div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2 mb-3"><FaFilter className="text-gray-500" /><span className="font-medium">Filters</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative"><FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by vehicle number or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
            </div>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="">All Payments</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Violations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredViolations.map((violation) => (
            <ViolationCard key={violation.id} violation={violation} onUpdatePayment={isAdmin ? handleUpdatePayment : null} isAdmin={isAdmin} />
          ))}
        </div>

        {filteredViolations.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center"><FaGavel className="text-6xl text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No violations found</p></div>
        )}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Record Violation</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Vehicle Number *" value={formData.vehicle_number} onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border rounded-lg" required />
              <select value={formData.violation_type} onChange={(e) => setFormData({ ...formData, violation_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="speeding">Speeding</option><option value="red_light">Red Light Jump</option>
                <option value="wrong_way">Wrong Way</option><option value="no_helmet">No Helmet</option>
                <option value="no_seatbelt">No Seatbelt</option><option value="illegal_parking">Illegal Parking</option><option value="other">Other</option>
              </select>
              <input type="text" placeholder="Location *" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              <input type="number" placeholder="Fine Amount *" value={formData.fine_amount} onChange={(e) => setFormData({ ...formData, fine_amount: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" required />
              <input type="datetime-local" value={formData.violation_date} onChange={(e) => setFormData({ ...formData, violation_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TrafficViolations;