import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getComplaints } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import ComplaintCard from '../components/Complaints/ComplaintCard';
import ComplaintFilters from '../components/Complaints/ComplaintFilters';
import { FaFileAlt, FaClock, FaCheckCircle, FaExclamationTriangle, FaPlusCircle } from 'react-icons/fa';

const ComplaintDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    complaint_type: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    resolved: 0,
    critical: 0
  });

  useEffect(() => {
    fetchComplaints();
  }, [filters.status, filters.priority, filters.complaint_type]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.complaint_type) params.complaint_type = filters.complaint_type;
      
      const response = await getComplaints(params);
      let data = response.data;
      
      // Apply search filter client-side
      if (filters.search) {
        data = data.filter(c => 
          c.complaint_number.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setComplaints(data);
      
      // Calculate stats
      setStats({
        total: data.length,
        pending: data.filter(c => c.status === 'pending').length,
        assigned: data.filter(c => c.status === 'assigned').length,
        resolved: data.filter(c => c.status === 'resolved').length,
        critical: data.filter(c => c.priority === 'critical').length
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    setFilters({ search: '', status: '', priority: '', complaint_type: '' });
  };

  const statCards = [
    { title: 'Total Complaints', value: stats.total, icon: FaFileAlt, color: 'bg-blue-500' },
    { title: 'Pending', value: stats.pending, icon: FaClock, color: 'bg-yellow-500' },
    { title: 'Resolved', value: stats.resolved, icon: FaCheckCircle, color: 'bg-green-500' },
    { title: 'Critical', value: stats.critical, icon: FaExclamationTriangle, color: 'bg-red-500' }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {user?.role === 'admin' ? 'All Complaints' : 'My Complaints'}
              </h1>
              <p className="text-primary-100">Track and manage complaints</p>
            </div>
            {user?.role === 'citizen' && (
              <button
                onClick={() => navigate('/complaints/raise')}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition"
              >
                <FaPlusCircle />
                <span>Raise Complaint</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full text-white`}>
                  <stat.icon />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <ComplaintFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />

        {/* Complaints List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No complaints found</p>
            {user?.role === 'citizen' && (
              <button
                onClick={() => navigate('/complaints/raise')}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Raise a Complaint
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ComplaintDashboard;