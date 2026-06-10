import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWasteDashboardStats, getWasteCollectionTrend } from '../services/api';
import Layout from '../components/Layout/Layout';
import CollectionChart from '../components/Waste/CollectionChart';
import { 
  FaTruck, FaRoute, FaTrashAlt, FaUsers, 
  FaExclamationTriangle, FaChartLine, FaRecycle 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const WasteDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_vehicles: 0,
    active_vehicles: 0,
    total_routes: 0,
    active_routes: 0,
    total_bins: 0,
    full_bins: 0,
    total_workers: 0,
    active_workers: 0,
    daily_collection_kg: 0
  });
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, trendRes] = await Promise.all([
        getWasteDashboardStats(),
        getWasteCollectionTrend(7)
      ]);
      setStats(statsRes.data);
      setTrend(trendRes.data.trend || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Vehicles', value: stats.total_vehicles, icon: FaTruck, color: 'bg-blue-500' },
    { title: 'Active Vehicles', value: stats.active_vehicles, icon: FaTruck, color: 'bg-green-500' },
    { title: 'Active Routes', value: stats.active_routes, icon: FaRoute, color: 'bg-purple-500' },
    { title: 'Total Bins', value: stats.total_bins, icon: FaTrashAlt, color: 'bg-indigo-500' },
    { title: 'Full/Overflowing Bins', value: stats.full_bins, icon: FaExclamationTriangle, color: 'bg-red-500' },
    { title: 'Active Workers', value: stats.active_workers, icon: FaUsers, color: 'bg-teal-500' },
    { title: 'Daily Collection', value: `${(stats.daily_collection_kg / 1000).toFixed(1)} tons`, icon: FaRecycle, color: 'bg-orange-500' },
  ];

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
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Waste Management Dashboard</h1>
          <p className="text-green-100">Monitor collection operations, bin status, and sanitation activities</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className={`${card.color} p-2 rounded-lg text-white`}>
                  <card.icon />
                </div>
                <p className="text-xl font-bold text-gray-800">{card.value}</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">{card.title}</p>
            </div>
          ))}
        </div>

        {/* Collection Trend Chart */}
        {trend.length > 0 && (
          <CollectionChart data={trend} title="Weekly Collection Trend (Tons)" />
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <h3 className="font-semibold">Collection Efficiency</h3>
            <p className="text-2xl font-bold mt-2">
              {stats.total_routes > 0 ? ((stats.active_routes / stats.total_routes) * 100).toFixed(0) : 0}%
            </p>
            <p className="text-sm text-blue-100 mt-1">Route utilization rate</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <h3 className="font-semibold">Bin Health</h3>
            <p className="text-2xl font-bold mt-2">
              {stats.total_bins > 0 ? (((stats.total_bins - stats.full_bins) / stats.total_bins) * 100).toFixed(0) : 0}%
            </p>
            <p className="text-sm text-green-100 mt-1">Bins operating normally</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <h3 className="font-semibold">Worker Attendance</h3>
            <p className="text-2xl font-bold mt-2">
              {stats.total_workers > 0 ? ((stats.active_workers / stats.total_workers) * 100).toFixed(0) : 0}%
            </p>
            <p className="text-sm text-orange-100 mt-1">Workers currently active</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WasteDashboard;