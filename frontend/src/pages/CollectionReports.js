import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWasteCollections, getDailyWasteReport, getCollectionRoutes, getWasteVehicles } from '../services/api';
import Layout from '../components/Layout/Layout';
import { FaSearch, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const CollectionReports = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyReport, setDailyReport] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState({ route_id: '', vehicle_id: '', start_date: '', end_date: '' });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build params object, only include if values exist
      const params = {};
      if (filters.route_id) params.route_id = filters.route_id;
      if (filters.vehicle_id) params.vehicle_id = filters.vehicle_id;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      
      const [collectionsRes, routesRes, vehiclesRes] = await Promise.all([
        getWasteCollections(params),
        getCollectionRoutes(),
        getWasteVehicles()
      ]);
      setCollections(collectionsRes.data || []);
      setRoutes(routesRes.data || []);
      setVehicles(vehiclesRes.data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyReport = async () => {
    try {
      const response = await getDailyWasteReport(selectedDate);
      setDailyReport(response.data);
    } catch (error) {
      console.error('Error fetching daily report:', error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({ route_id: '', vehicle_id: '', start_date: '', end_date: '' });
  };

  const totalWeight = collections.reduce((sum, c) => sum + (c.collected_weight_kg || 0), 0);
  const avgWeight = collections.length > 0 ? totalWeight / collections.length : 0;

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
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Collection Reports</h1>
          <p className="text-gray-500">View waste collection logs and generate reports</p>
        </div>

        {/* Daily Report Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Collection Report</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={fetchDailyReport}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FaCalendarAlt />
              <span>Generate Report</span>
            </button>
          </div>
          
          {dailyReport && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold">{dailyReport.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Collections</p>
                  <p className="font-semibold">{dailyReport.total_collections || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Weight</p>
                  <p className="font-semibold">{dailyReport.total_weight_kg || 0} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average per Collection</p>
                  <p className="font-semibold">{dailyReport.average_collection_kg || 0} kg</p>
                </div>
              </div>
              {dailyReport.route_breakdown && Object.keys(dailyReport.route_breakdown).length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Route-wise Breakdown:</p>
                  <div className="space-y-2">
                    {Object.entries(dailyReport.route_breakdown).map(([route, data]) => (
                      <div key={route} className="flex justify-between items-center text-sm">
                        <span>{route}</span>
                        <span>{data.collections} collections, {data.total_weight} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              value={filters.route_id}
              onChange={(e) => handleFilterChange('route_id', e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Routes</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>{route.route_name}</option>
              ))}
            </select>
            <select
              value={filters.vehicle_id}
              onChange={(e) => handleFilterChange('vehicle_id', e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Vehicles</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicle_number}</option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Start Date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="date"
              placeholder="End Date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            {(filters.route_id || filters.vehicle_id || filters.start_date || filters.end_date) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-500 text-sm">Total Collections</p>
            <p className="text-2xl font-bold text-gray-800">{collections.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-500 text-sm">Total Waste Collected</p>
            <p className="text-2xl font-bold text-gray-800">{(totalWeight / 1000).toFixed(1)} tons</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-500 text-sm">Average per Collection</p>
            <p className="text-2xl font-bold text-gray-800">{avgWeight.toFixed(0)} kg</p>
          </div>
        </div>

        {/* Collections Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {collections.map((collection) => (
                  <tr key={collection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{collection.route_name || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{collection.vehicle_number || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {collection.collection_date ? new Date(collection.collection_date).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{collection.collected_weight_kg || 0} kg</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{collection.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {collections.length === 0 && (
            <div className="text-center py-12">
              <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No collection records found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CollectionReports;