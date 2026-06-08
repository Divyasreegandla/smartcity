import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCitizens, getComplaints, getPowerDashboardStats } from '../services/api';
import Layout from '../components/Layout/Layout';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaSearch, FaEye, FaEdit, 
  FaUserPlus, FaEnvelope, FaPhone, FaMapMarker,
  FaFileAlt, FaClock, FaCheckCircle, FaExclamationTriangle,
  FaChartLine, FaTimes, FaSave, FaBolt, FaBuilding
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [citizens, setCitizens] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [powerStats, setPowerStats] = useState({
    total_substations: 0,
    active_substations: 0,
    total_transformers: 0,
    active_transformers: 0,
    fault_transformers: 0,
    today_consumption_kwh: 0,
    active_outages: 0,
    maintenance_due_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [editForm, setEditForm] = useState({
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [citizensRes, complaintsRes, powerStatsRes] = await Promise.all([
        getCitizens().catch(() => ({ data: [] })),
        getComplaints().catch(() => ({ data: [] })),
        getPowerDashboardStats().catch(() => ({ data: {} }))
      ]);
      
      setCitizens(citizensRes.data);
      setComplaints(complaintsRes.data);
      setPowerStats(powerStatsRes.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (citizen) => {
    setSelectedCitizen(citizen);
    setEditForm({
      phone: citizen.phone !== 'Not provided' ? citizen.phone : '',
      address: citizen.address !== 'Not provided' ? citizen.address : '',
      city: citizen.city !== 'Not provided' ? citizen.city : '',
      state: citizen.state !== 'Not provided' ? citizen.state : '',
      pincode: citizen.pincode !== 'Not provided' ? citizen.pincode : ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async () => {
    try {
      await updateCitizenProfile(selectedCitizen.user_id, editForm);
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
      fetchAllData();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      rejected: 'Rejected'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority?.toUpperCase() || 'MEDIUM'}
      </span>
    );
  };

  const filteredCitizens = citizens.filter(citizen =>
    citizen.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    citizen.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    citizen.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    citizen.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Admin Dashboard
              </h1>
              <p className="text-primary-100">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}!
              </p>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm">Admin Access</span>
            </div>
          </div>
        </div>

        {/* Power Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Substations</p>
                <p className="text-3xl font-bold text-primary-600">{powerStats.total_substations}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <FaBuilding className="text-primary-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Transformers</p>
                <p className="text-3xl font-bold text-blue-600">{powerStats.total_transformers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaBolt className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Today's Consumption</p>
                <p className="text-3xl font-bold text-green-600">{(powerStats.today_consumption_kwh / 1000).toFixed(1)}k kWh</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaChartLine className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Outages</p>
                <p className="text-3xl font-bold text-red-600">{powerStats.active_outages}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Second Row - Complaint Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Complaints</p>
                <p className="text-3xl font-bold text-gray-800">{complaints.length}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <FaFileAlt className="text-gray-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Complaints</p>
                <p className="text-3xl font-bold text-yellow-600">{complaints.filter(c => c.status === 'pending').length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Resolved Complaints</p>
                <p className="text-3xl font-bold text-green-600">{complaints.filter(c => c.status === 'resolved').length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Citizens</p>
                <p className="text-3xl font-bold text-primary-600">{citizens.length}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <FaUsers className="text-primary-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Complaints Table */}
        {recentComplaints.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Recent Complaints</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complaint #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentComplaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{complaint.complaint_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{complaint.title}</td>
                      <td className="px-6 py-4">{getPriorityBadge(complaint.priority)}</td>
                      <td className="px-6 py-4">{getStatusBadge(complaint.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => navigate(`/complaints/${complaint.id}`)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Citizens Management Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Citizens List</h2>
              <p className="text-sm text-gray-500">View and manage all registered citizens</p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="p-4 border-b">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Citizens Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Citizen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCitizens.map((citizen) => (
                  <tr key={citizen.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-600 font-semibold text-lg">
                            {citizen.user?.full_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{citizen.user?.full_name}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <FaEnvelope className="mr-1" size={12} /> {citizen.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <FaPhone className="text-gray-400 text-sm" />
                        <span className="text-gray-600">{citizen.phone !== 'Not provided' ? citizen.phone : '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-2">
                        <FaMapMarker className="text-gray-400 text-sm mt-0.5" />
                        <div>
                          <p className="text-gray-600">{citizen.address !== 'Not provided' ? citizen.address : '—'}</p>
                          <p className="text-sm text-gray-500">
                            {citizen.city !== 'Not provided' ? citizen.city : '—'}, 
                            {citizen.state !== 'Not provided' ? citizen.state : '—'} 
                            {citizen.pincode !== 'Not provided' ? ` - ${citizen.pincode}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(citizen.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditClick(citizen)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit Profile"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCitizens.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No citizens found</p>
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {filteredCitizens.length} of {citizens.length} citizen(s)
            </p>
          </div>
        </div>
      </div>

      {/* Edit/View Citizen Modal */}
      {showEditModal && selectedCitizen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedCitizen.user?.full_name}'s Profile
              </h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* User Info - Read Only */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Full Name</p>
                    <p className="font-medium">{selectedCitizen.user?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-medium">{selectedCitizen.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Role</p>
                    <p className="font-medium capitalize">{selectedCitizen.user?.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Member Since</p>
                    <p className="font-medium">{new Date(selectedCitizen.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Profile Information (Editable)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={editForm.address}
                      onChange={handleEditChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter complete address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={editForm.city}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        name="state"
                        value={editForm.state}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={editForm.pincode}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Pincode"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <FaSave />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;