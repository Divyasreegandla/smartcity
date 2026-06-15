import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCongestionReports, createCongestionReport, getHighCongestionAreas } from '../../services/api';
import Layout from '../../components/Layout/Layout';
import CongestionCard from '../../components/traffic/CongestionCard';
import { FaPlus, FaSearch, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CongestionReports = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [reports, setReports] = useState([]);
  const [highCongestionAreas, setHighCongestionAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ area_name: '', congestion_level: 'moderate', vehicle_count: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, highCongestionRes] = await Promise.all([
        getCongestionReports(),
        getHighCongestionAreas()
      ]);
      setReports(reportsRes.data || []);
      setHighCongestionAreas(highCongestionRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch congestion data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCongestionReport(formData);
      toast.success('Congestion report added');
      setShowModal(false);
      setFormData({ area_name: '', congestion_level: 'moderate', vehicle_count: 0 });
      fetchData();
    } catch (error) {
      toast.error('Failed to add report');
    }
  };

  const filteredReports = reports.filter(report =>
    report.area_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div><h1 className="text-2xl font-bold text-gray-800">Congestion Reports</h1><p className="text-gray-500">Monitor traffic congestion across the city</p></div>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <FaPlus /><span>Add Report</span>
            </button>
          )}
        </div>

        {/* High Congestion Alert */}
        {highCongestionAreas.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center"><FaExclamationTriangle className="text-red-500 mr-2" /><h3 className="font-semibold text-red-800">High Congestion Alert</h3></div>
            <p className="text-red-700 text-sm mt-1">The following areas are experiencing HIGH or SEVERE congestion:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {highCongestionAreas.map((area, idx) => (
                <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{area.area} - {area.level}</span>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative"><FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by area name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (<CongestionCard key={report.id} report={report} />))}
        </div>

        {filteredReports.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center"><FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No congestion reports found</p></div>
        )}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Congestion Report</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Area Name *" value={formData.area_name} onChange={(e) => setFormData({ ...formData, area_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              <select value={formData.congestion_level} onChange={(e) => setFormData({ ...formData, congestion_level: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option><option value="severe">Severe</option>
              </select>
              <input type="number" placeholder="Vehicle Count" value={formData.vehicle_count} onChange={(e) => setFormData({ ...formData, vehicle_count: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" />
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

export default CongestionReports;