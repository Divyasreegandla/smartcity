import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWaterConsumption, createWaterConsumption, getWaterZones, getZoneConsumptionSummary } from '../services/api';
import Layout from '../components/Layout/Layout';
import { FaPlus, FaChartLine, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const WaterConsumption = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [consumptions, setConsumptions] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [summary, setSummary] = useState(null);
  const [formData, setFormData] = useState({
    zone_id: '',
    consumption_date: '',
    total_liters_consumed: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [consumptionsRes, zonesRes] = await Promise.all([
        getWaterConsumption(),
        getWaterZones()
      ]);
      setConsumptions(consumptionsRes.data || []);
      setZones(zonesRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.zone_id) errors.zone_id = 'Zone is required';
    if (!formData.consumption_date) errors.consumption_date = 'Date is required';
    if (!formData.total_liters_consumed) {
      errors.total_liters_consumed = 'Consumption is required';
    } else if (isNaN(parseFloat(formData.total_liters_consumed)) || parseFloat(formData.total_liters_consumed) <= 0) {
      errors.total_liters_consumed = 'Consumption must be a positive number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Format the data correctly for backend
    const submitData = {
      zone_id: parseInt(formData.zone_id),
      consumption_date: formData.consumption_date + 'T00:00:00',
      total_liters_consumed: parseFloat(formData.total_liters_consumed)
    };
    
    try {
      await createWaterConsumption(submitData);
      toast.success('Consumption record added');
      setShowModal(false);
      setFormData({ zone_id: '', consumption_date: '', total_liters_consumed: '' });
      setFormErrors({});
      fetchData();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleViewSummary = async (zoneId) => {
    try {
      const response = await getZoneConsumptionSummary(zoneId);
      setSummary(response.data);
      setSelectedZone(zoneId);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const filteredConsumptions = (consumptions || []).filter(c =>
    c.zone_name?.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (!isAdmin) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-500">Access denied. Admin only.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Water Consumption Reports</h1>
            <p className="text-gray-500">Track daily water consumption by zone</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <FaPlus />
            <span>Add Consumption</span>
          </button>
        </div>

        {/* Summary Section */}
        {summary && selectedZone && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{summary.zone_name}</h2>
                <p className="text-primary-100">Zone Code: {summary.zone_code}</p>
              </div>
              <button
                onClick={() => setSummary(null)}
                className="text-white hover:text-gray-200"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm text-primary-100">Total Records</p>
                <p className="text-2xl font-bold">{summary.total_records || 0}</p>
              </div>
              <div>
                <p className="text-sm text-primary-100">Total Consumption</p>
                <p className="text-2xl font-bold">{((summary.total_consumption_liters || 0) / 1000).toFixed(1)}k L</p>
              </div>
              <div>
                <p className="text-sm text-primary-100">Average/Day</p>
                <p className="text-2xl font-bold">{((summary.average_consumption_liters || 0) / 1000).toFixed(1)}k L</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by zone name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Consumption Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumption (Liters)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredConsumptions.map((consumption) => (
                  <tr key={consumption.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{consumption.zone_name}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {consumption.consumption_date ? new Date(consumption.consumption_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {(consumption.total_liters_consumed || 0).toLocaleString()} L
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewSummary(consumption.zone_id)}
                        className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                      >
                        <FaChartLine />
                        <span>Summary</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredConsumptions.length === 0 && (
            <div className="text-center py-12">
              <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No consumption records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Consumption Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Consumption Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <select
                  value={formData.zone_id}
                  onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.zone_id ? 'border-red-500' : 'border-gray-300'}`}
                  required
                >
                  <option value="">Select Zone *</option>
                  {zones.map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.zone_name}</option>
                  ))}
                </select>
                {formErrors.zone_id && <p className="text-red-500 text-xs mt-1">{formErrors.zone_id}</p>}
              </div>
              
              <div>
                <input
                  type="date"
                  value={formData.consumption_date}
                  onChange={(e) => setFormData({ ...formData, consumption_date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.consumption_date ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {formErrors.consumption_date && <p className="text-red-500 text-xs mt-1">{formErrors.consumption_date}</p>}
              </div>
              
              <div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Total Liters Consumed *"
                  value={formData.total_liters_consumed}
                  onChange={(e) => setFormData({ ...formData, total_liters_consumed: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.total_liters_consumed ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {formErrors.total_liters_consumed && <p className="text-red-500 text-xs mt-1">{formErrors.total_liters_consumed}</p>}
              </div>
              
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

export default WaterConsumption;