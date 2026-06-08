import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getPowerDashboardStats, 
  getConsumptionTrend, 
  getAreaRanking,
  getCurrentOutages
} from '../services/api';
import Layout from '../components/Layout/Layout';
import DashboardCard from '../components/Electricity/DashboardCard';
import ConsumptionChart from '../components/Electricity/ConsumptionChart';
import AreaRankingTable from '../components/Electricity/AreaRankingTable';
import OutageStatusCard from '../components/Electricity/OutageStatusCard';
import { 
  FaBuilding, 
  FaBolt, 
  FaTachometerAlt, 
  FaExclamationTriangle,
  FaChartLine,
  FaPlug
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const ElectricityDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_substations: 0,
    active_substations: 0,
    total_transformers: 0,
    active_transformers: 0,
    fault_transformers: 0,
    today_consumption_kwh: 0,
    active_outages: 0,
    maintenance_due_count: 0
  });
  const [trend, setTrend] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [activeOutages, setActiveOutages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    // Remove getCurrentOutages() call
    const [statsRes, trendRes, rankingRes] = await Promise.all([
      getPowerDashboardStats(),
      getConsumptionTrend(7),
      getAreaRanking()
    ]);
    
    setStats(statsRes.data);
    setTrend(trendRes.data.trend || []);
    setRankings(rankingRes.data.rankings || []);
    setActiveOutages([]);  // Set empty array instead of API call
    
    // Optional: Add a separate call for outages if needed
    try {
      const outagesRes = await getCurrentOutages();
      setActiveOutages(outagesRes.data.outages || []);
    } catch (outageError) {
      console.log('Outages endpoint not available yet');
      setActiveOutages([]);
    }
    
  } catch (error) {
    console.error('Error:', error);
    toast.error(getErrorMessage(error));
  } finally {
    setLoading(false);
  }
};

  const handleResolveOutage = async (outageId) => {
    // This will be implemented with updatePowerOutage API
    toast.info('Resolution feature coming soon');
  };

  const statCards = [
    { title: 'Total Substations', value: stats.total_substations, icon: <FaBuilding />, color: 'blue' },
    { title: 'Active Substations', value: stats.active_substations, icon: <FaBuilding />, color: 'green' },
    { title: 'Total Transformers', value: stats.total_transformers, icon: <FaBolt />, color: 'purple' },
    { title: 'Active Transformers', value: stats.active_transformers, icon: <FaBolt />, color: 'green' },
    { title: 'Fault Transformers', value: stats.fault_transformers, icon: <FaExclamationTriangle />, color: 'red' },
    { title: "Today's Usage", value: `${(stats.today_consumption_kwh / 1000).toFixed(1)}k kWh`, icon: <FaChartLine />, color: 'orange' },
    { title: 'Active Outages', value: stats.active_outages, icon: <FaExclamationTriangle />, color: 'red' },
    { title: 'Maintenance Due', value: stats.maintenance_due_count, icon: <FaTachometerAlt />, color: 'yellow' }
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
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Power & Electricity Dashboard</h1>
          <p className="text-yellow-100">Monitor electricity distribution, consumption, and system health</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => (
            <DashboardCard key={idx} {...card} />
          ))}
        </div>

        {/* Consumption Trend Chart */}
        {trend.length > 0 && (
          <ConsumptionChart data={trend} title="Weekly Consumption Trend" />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Area Rankings */}
          {rankings.length > 0 && <AreaRankingTable rankings={rankings} />}

          {/* Active Outages */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaExclamationTriangle className="mr-2 text-red-500" />
                Active Outages
              </h2>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {activeOutages.length === 0 ? (
                <div className="text-center py-8">
                  <FaPlug className="text-6xl text-green-300 mx-auto mb-4" />
                  <p className="text-gray-500">No active outages</p>
                  <p className="text-sm text-gray-400">All systems operational</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeOutages.map((outage) => (
                    <OutageStatusCard
                      key={outage.id}
                      outage={outage}
                      onResolve={user?.role === 'admin' ? handleResolveOutage : null}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ElectricityDashboard;