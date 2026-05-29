import React, { useState, useEffect } from 'react';
import { getCitizens, updateCitizenProfile } from '../services/api';
import Layout from '../components/Layout/Layout';
import ProtectedRoute from '../components/Common/ProtectedRoute';
import { FaUsers, FaSearch, FaEye, FaEdit, FaPhone, FaEnvelope, FaMapMarker, FaTimes, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CitizensList = () => {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    try {
      const response = await getCitizens();
      setCitizens(response.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch citizens');
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
      fetchCitizens(); // Refresh the list
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleViewDetails = (citizen) => {
    setSelectedCitizen(citizen);
    setShowEditModal(true); // Reuse modal for view only mode
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
          <h1 className="text-2xl font-bold mb-2">Citizens Management</h1>
          <p className="text-primary-100">View and manage all registered citizens</p>
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

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-4">
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
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                            <FaEnvelope className="inline mr-1 text-xs" /> {citizen.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 flex items-center">
                        <FaPhone className="mr-2 text-gray-400 text-sm" />
                        {citizen.phone !== 'Not provided' ? citizen.phone : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <FaMapMarker className="mr-2 text-gray-400 text-sm mt-0.5" />
                        <div>
                          <p className="text-gray-600">{citizen.address !== 'Not provided' ? citizen.address : '—'}</p>
                          <p className="text-sm text-gray-500">
                            {citizen.city !== 'Not provided' ? citizen.city : '—'}, {citizen.state !== 'Not provided' ? citizen.state : '—'}
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
                          onClick={() => handleViewDetails(citizen)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                          title="View Details"
                        >
                          <FaEye />
                        </button>
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

      {/* Edit/View Modal */}
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

export default () => (
  <ProtectedRoute adminOnly>
    <CitizensList />
  </ProtectedRoute>
);