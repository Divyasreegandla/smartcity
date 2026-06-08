import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getElectricityUsage, createElectricityUsage, getAreaUsageSummary } from '../services/api';
import Layout from '../components/Layout/Layout';
import ConsumptionChart from '../components/Electricity/ConsumptionChart';
import { FaPlus, FaSearch, FaChartLine } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const ElectricityConsumption = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    area_name: '',
    usage_date: '',
    units_consumed: '',
    peak_load: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await getElectricityUsage();
      setRecords(response.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createElectricityUsage(formData);
      toast.success('Usage record added');
      setShowModal(false);
      setFormData({ area_name: '', usage_date: '', units_consumed: '', peak_load: '' });
      fetchRecords();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleViewSummary = async (areaName) => {
    try {
      const response = await getAreaUsageSummary(areaName);
      setSummary(response.data);
      setSelectedArea(areaName);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const filteredRecords = records.filter(r =>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Electricity Consumption</h1>
            <p className="text-gray-500">Monitor daily electricity consumption by area</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FaPlus />
              <span>Add Record</span>
            </button>
          )}
        </div>

        {/* Summary Section */}
        {summary && selectedArea && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{summary.area_name}</h2>
                <p className="text-primary-100">Last {summary.days} days summary</p>
              </div>
              <button onClick={() => setSummary(null)} className="text-white hover:text-gray-200">Close</button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm text-primary-100">Total Records</p>
                <p className="text-2xl font-bold">{summary.records_count}</p>
              </div>
              <div>
                <p className="text-sm text-primary-100">Total Consumption</p>
                <p className="text-2xl font-bold">{summary.total_units_consumed.toLocaleString()} kWh</p>
              </div>
              <div>
                <p className="text-sm text-primary-100">Avg Peak Load</p>
                <p className="text-2xl font-bold">{summary.average_peak_load.toFixed(0)} MW</p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by area name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumption (kWh)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peak Load (MW)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{record.area_name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(record.usage_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.units_consumed.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{record.peak_load.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewSummary(record.area_name)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Summary
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No consumption records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Record Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Consumption Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Area Name *"
                value={formData.area_name}
                onChange={(e) => setFormData({ ...formData, area_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="date"
                value={formData.usage_date}
                onChange={(e) => setFormData({ ...formData, usage_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Units Consumed (kWh) *"
                value={formData.units_consumed}
                onChange={(e) => setFormData({ ...formData, units_consumed: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Peak Load (MW) *"
                value={formData.peak_load}
                onChange={(e) => setFormData({ ...formData, peak_load: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
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

export default ElectricityConsumption;