import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCitizenProfile } from '../services/api';
import Layout from '../components/Layout/Layout';
import { FaUser, FaEnvelope, FaPhone, FaMapMarker, FaCity, FaCalendarAlt } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getCitizenProfile(user.id);
        setProfile(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome, {user?.fullName || user?.full_name}! 👋
          </h1>
          <p className="text-primary-100">Welcome to Smart City Management Platform</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">My Profile</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaUser className="text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-800">{user?.full_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaEnvelope className="text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-800">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaCalendarAlt className="text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-800">
                      {new Date(user?.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaPhone className="text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-800">
                      {profile?.phone && profile.phone !== 'Not provided' ? profile.phone : 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaMapMarker className="text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-medium text-gray-800">
                      {profile?.address && profile.address !== 'Not provided' ? profile.address : 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FaCity className="text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">City, State</p>
                    <p className="font-medium text-gray-800">
                      {profile?.city && profile.city !== 'Not provided' ? `${profile.city}, ${profile.state}` : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Completion Note */}
            {(!profile?.phone || profile.phone === 'Not provided') && (
              <div className="mt-6 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm text-yellow-700">
                  Please update your profile to complete your registration.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/profile'}
            className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition"
          >
            <div className="text-primary-500 text-2xl mb-2">📝</div>
            <p className="font-medium">Update Profile</p>
          </button>
          <button className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition">
            <div className="text-primary-500 text-2xl mb-2">🏠</div>
            <p className="font-medium">City Services</p>
          </button>
          <button className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition">
            <div className="text-primary-500 text-2xl mb-2">📞</div>
            <p className="font-medium">Contact Support</p>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;