import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTrafficDashboardStats } from '../../services/api';
import Layout from '../../components/Layout/Layout';
import { 
  FaTrafficLight, FaCarCrash, FaChartLine, FaRoad, 
  FaMoneyBillWave, FaExclamationTriangle, FaRedoAlt
} from 'react-icons/fa';

const TrafficDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_traffic_signals: 0,
    active_incidents: 0,
    high_congestion_areas: 0,
    roads_under_maintenance: 0,
    traffic_violations_today: 0,
    fine_revenue_collected: 0,
    signal_status_breakdown: { red: 0, yellow: 0, green: 0 },
    incident_breakdown: { total: 0, resolved: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getTrafficDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const statCards = [
    { title: 'Total Traffic Signals', value: stats.total_traffic_signals, icon: FaTrafficLight, color: 'bg-blue-500' },
    { title: 'Active Incidents', value: stats.active_incidents, icon: FaCarCrash, color: 'bg-red-500' },
    { title: 'High Congestion Areas', value: stats.high_congestion_areas, icon: FaChartLine, color: 'bg-orange-500' },
    { title: 'Roads Under Maintenance', value: stats.roads_under_maintenance, icon: FaRoad, color: 'bg-yellow-500' },
    { title: 'Violations Today', value: stats.traffic_violations_today, icon: FaExclamationTriangle, color: 'bg-purple-500' },
    { title: 'Fine Revenue', value: `₹${(stats.fine_revenue_collected || 0).toLocaleString()}`, icon: FaMoneyBillWave, color: 'bg-green-500' }
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">Traffic Management Dashboard</h1>
              <p className="text-blue-100">Monitor traffic flow, incidents, and enforcement activities</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30"
            >
              <FaRedoAlt className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-center justify-between">
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  <card.icon className="text-xl" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <p className="text-sm font-medium text-gray-600 mt-2">{card.title}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button onClick={() => window.location.href = '/traffic-signals'} className="bg-blue-50 text-blue-700 p-3 rounded-lg text-center hover:bg-blue-100">
            <FaTrafficLight className="mx-auto text-xl mb-1" />
            <span className="text-xs">Signals</span>
          </button>
          <button onClick={() => window.location.href = '/traffic-incidents'} className="bg-red-50 text-red-700 p-3 rounded-lg text-center hover:bg-red-100">
            <FaCarCrash className="mx-auto text-xl mb-1" />
            <span className="text-xs">Incidents</span>
          </button>
          <button onClick={() => window.location.href = '/congestion-reports'} className="bg-orange-50 text-orange-700 p-3 rounded-lg text-center hover:bg-orange-100">
            <FaChartLine className="mx-auto text-xl mb-1" />
            <span className="text-xs">Congestion</span>
          </button>
          <button onClick={() => window.location.href = '/road-maintenance'} className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-center hover:bg-yellow-100">
            <FaRoad className="mx-auto text-xl mb-1" />
            <span className="text-xs">Maintenance</span>
          </button>
          <button onClick={() => window.location.href = '/traffic-violations'} className="bg-purple-50 text-purple-700 p-3 rounded-lg text-center hover:bg-purple-100">
            <FaExclamationTriangle className="mx-auto text-xl mb-1" />
            <span className="text-xs">Violations</span>
          </button>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Signal Status Summary</h3>
            <div className="flex justify-around">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-red-600 text-xl">🔴</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.signal_status_breakdown?.red || 0}</p>
                <p className="text-xs text-gray-500">Red</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-yellow-600 text-xl">🟡</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.signal_status_breakdown?.yellow || 0}</p>
                <p className="text-xs text-gray-500">Yellow</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-green-600 text-xl">🟢</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.signal_status_breakdown?.green || 0}</p>
                <p className="text-xs text-gray-500">Green</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Incident Resolution Rate</h3>
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64"/>
                  <circle 
                    className="text-green-500" 
                    strokeWidth="8" 
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={2 * Math.PI * 58 * (1 - (stats.incident_breakdown?.resolved || 0) / (stats.incident_breakdown?.total || 1))}
                    stroke="currentColor" 
                    fill="transparent" 
                    r="58" 
                    cx="64" 
                    cy="64"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {((stats.incident_breakdown?.resolved || 0) / (stats.incident_breakdown?.total || 1) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {stats.incident_breakdown?.resolved || 0} out of {stats.incident_breakdown?.total || 0} incidents resolved
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrafficDashboard;