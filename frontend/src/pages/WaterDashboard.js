import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getWaterDashboardStats, 
  getWeeklyWaterTrend, 
  getZoneWiseWaterConsumption,
  getWaterLeakageSummary
} from '../services/api';
import Layout from '../components/Layout/Layout';
import ConsumptionChart from '../components/Water/ConsumptionChart';
import { FaTint, FaUsers, FaBuilding, FaCalendarCheck, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import toast from 'react-hot-toast';

const WaterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_water_zones: 0,
    active_water_zones: 0,
    total_water_tanks: 0,
    water_supply_today: 0,
    pending_leakage_reports: 0,
    total_consumption_today_liters: 0
  });
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [zoneConsumption, setZoneConsumption] = useState([]);
  const [leakageSummary, setLeakageSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, trendRes, zoneRes, leakRes] = await Promise.all([
        getWaterDashboardStats().catch(e => ({ data: { total_water_zones: 0, active_water_zones: 0, total_water_tanks: 0, water_supply_today: 0, pending_leakage_reports: 0, total_consumption_today_liters: 0 } })),
        getWeeklyWaterTrend().catch(e => ({ data: { weekly_consumption: [] } })),
        getZoneWiseWaterConsumption().catch(e => ({ data: { zones: [] } })),
        getWaterLeakageSummary().catch(e => ({ data: {} }))
      ]);
      
      setStats(statsRes.data);
      setWeeklyTrend(trendRes.data.weekly_consumption || []);
      setZoneConsumption(zoneRes.data.zones || []);
      setLeakageSummary(leakRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't show toast for dashboard errors, just use defaults
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Water Zones', value: stats.total_water_zones, icon: FaBuilding, color: 'bg-blue-500' },
    { title: 'Active Water Zones', value: stats.active_water_zones, icon: FaTint, color: 'bg-green-500' },
    { title: 'Total Water Tanks', value: stats.total_water_tanks, icon: FaTint, color: 'bg-purple-500' },
    { title: 'Supply Today', value: stats.water_supply_today, icon: FaCalendarCheck, color: 'bg-orange-500' },
    { title: 'Pending Leaks', value: stats.pending_leakage_reports, icon: FaExclamationTriangle, color: 'bg-red-500' },
    { title: 'Consumption Today', value: `${(stats.total_consumption_today_liters / 1000).toFixed(1)}k L`, icon: FaChartLine, color: 'bg-primary-500' }
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
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Water Supply Dashboard</h1>
          <p className="text-blue-100">Monitor water distribution, consumption, and system health</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className={`${stat.color} p-2 rounded-lg text-white`}>
                  <stat.icon />
                </div>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Weekly Consumption Trend */}
        {weeklyTrend.length > 0 && (
          <ConsumptionChart data={weeklyTrend} title="Weekly Water Consumption Trend" />
        )}

        {/* Zone-wise Consumption */}
        {zoneConsumption.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Zone-wise Consumption</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Population</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Today's Consumption</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Per Capita (L)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {zoneConsumption.map((zone, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{zone.zone_name}</p>
                          <p className="text-xs text-gray-500">{zone.zone_code}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{zone.population?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4 text-gray-600">{((zone.today_consumption_liters || 0) / 1000).toFixed(1)}k L</td>
                      <td className="px-6 py-4 text-gray-600">{(zone.per_capita_consumption || 0).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leakage Summary */}
        {leakageSummary.total_reports > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Leakage Reports Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{leakageSummary.reported || 0}</p>
                <p className="text-xs text-gray-500">Reported</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{leakageSummary.under_review || 0}</p>
                <p className="text-xs text-gray-500">Under Review</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{leakageSummary.in_progress || 0}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{leakageSummary.resolved || 0}</p>
                <p className="text-xs text-gray-500">Resolved</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t text-center">
              <p className="text-sm text-gray-600">
                Resolution Rate: <span className="font-semibold">{leakageSummary.resolution_rate || 0}%</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WaterDashboard;