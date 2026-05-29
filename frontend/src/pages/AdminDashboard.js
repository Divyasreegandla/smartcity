import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCitizens } from '../services/api';
import Layout from '../components/Layout/Layout';
import { 
  FaUsers, FaSearch, FaEye, FaEdit, 
  FaUserPlus, FaEnvelope, FaPhone, FaMapMarker
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    try {
      const response = await getCitizens();
      setCitizens(response.data);
    } catch (error) {
      console.error('Error fetching citizens:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCitizens = citizens.filter(citizen =>
    citizen.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    citizen.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    citizen.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    citizen.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-primary-100">
            Welcome back, {user?.full_name}! Manage all registered citizens here.
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Registered Citizens</p>
              <p className="text-3xl font-bold text-primary-600">{citizens.length}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <FaUsers className="text-primary-600 text-2xl" />
            </div>
          </div>
        </div>

        {/* Citizens Management Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Citizens List</h2>
              <p className="text-sm text-gray-500">View and manage all registered citizens</p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
              <FaUserPlus />
              <span>Add New Citizen</span>
            </button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citizen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                          <p className="text-sm text-gray-500">{citizen.user?.email}</p>
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
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View Details">
                          <FaEye />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Edit">
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
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
            </div>
          )}

          {/* Footer with count */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {filteredCitizens.length} of {citizens.length} citizen(s)
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;