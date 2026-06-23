// src/pages/billing/BillsDashboard.js - Add refresh functionality
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBills } from '../../context/BillContext';
import Layout from '../../components/Layout/Layout';
import BillCard from '../../components/Billing/BillCard';
import BillFilters from '../../components/Billing/BillFilters';
import { FaFileInvoice, FaClock, FaCheckCircle, FaExclamationTriangle, FaWallet, FaSync } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BillsDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bills, pendingBills, billHistory, loading, totalPendingAmount, fetchBills, fetchPendingBills, fetchBillHistory } = useBills();
  const [filters, setFilters] = useState({ search: '', status: '', category: '' });
  const [displayBills, setDisplayBills] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshData();
    // ✅ Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchBills(),
      fetchPendingBills(),
      fetchBillHistory()
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    let filtered = [...bills];
    if (filters.search) {
      filtered = filtered.filter(b => 
        b.bill_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
        b.category_name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.status) {
      filtered = filtered.filter(b => b.bill_status === filters.status);
    }
    if (filters.category) {
      filtered = filtered.filter(b => b.category_id === parseInt(filters.category));
    }
    setDisplayBills(filtered);
  }, [bills, filters]);

  const stats = [
    { title: 'Total Bills', value: bills.length, icon: FaFileInvoice, color: 'bg-blue-500' },
    { title: 'Pending Bills', value: pendingBills.length, icon: FaClock, color: 'bg-yellow-500' },
    { title: 'Paid Bills', value: billHistory.length, icon: FaCheckCircle, color: 'bg-green-500' },
    { title: 'Total Pending Amount', value: `₹${totalPendingAmount.toLocaleString()}`, icon: FaWallet, color: 'bg-red-500' },
  ];

  const handleRefresh = async () => {
    toast.loading('Refreshing bills...');
    await refreshData();
    toast.dismiss();
    toast.success('Bills refreshed!');
  };

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
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">Utility Bills Dashboard</h1>
              <p className="text-emerald-100">View and manage all your utility bills</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30"
            >
              <FaSync className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-center justify-between">
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <stat.icon className="text-xl" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <p className="text-sm text-gray-500 mt-2">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/bills/pending')} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
            Pay Pending Bills
          </button>
          <button onClick={() => navigate('/bills/history')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            View History
          </button>
          <button onClick={() => navigate('/property-tax')} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
            Property Tax
          </button>
        </div>

        {/* Filters */}
        <BillFilters filters={filters} onFilterChange={setFilters} onReset={() => setFilters({ search: '', status: '', category: '' })} />

        {/* Bills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>

        {displayBills.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaFileInvoice className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No bills found</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BillsDashboard;