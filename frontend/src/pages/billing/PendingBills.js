// src/pages/billing/PendingBills.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBills } from '../../context/BillContext';
import Layout from '../../components/Layout/Layout';
import BillCard from '../../components/Billing/BillCard';
import { FaMoneyBillWave, FaArrowLeft, FaSync } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PendingBills = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pendingBills, totalPendingAmount, fetchPendingBills, loading } = useBills();
  const [selectedBills, setSelectedBills] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingBills();
    // ✅ Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPendingBills();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPendingBills();
    setRefreshing(false);
    toast.success('Pending bills refreshed!');
  };

  const handleSelectBill = (billId) => {
    setSelectedBills(prev => 
      prev.includes(billId) ? prev.filter(id => id !== billId) : [...prev, billId]
    );
  };

  const handlePaySelected = () => {
    if (selectedBills.length === 0) {
      toast.error('Please select at least one bill to pay');
      return;
    }
    navigate('/payment-gateway', { state: { billIds: selectedBills } });
  };

  const handlePayAll = () => {
    if (pendingBills.length === 0) {
      toast.error('No pending bills to pay');
      return;
    }
    navigate('/payment-gateway', { state: { billIds: pendingBills.map(b => b.id) } });
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/bills')} className="text-gray-600 hover:text-gray-800">
              <FaArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Pending Bills</h1>
              <p className="text-gray-500">Review and pay your pending bills</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <FaSync className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-yellow-100">Total Pending Amount</p>
              <p className="text-3xl font-bold">₹{totalPendingAmount.toLocaleString()}</p>
              <p className="text-sm text-yellow-100 mt-1">{pendingBills.length} bills pending</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handlePayAll} 
                className="px-4 py-2 bg-white text-yellow-600 rounded-lg hover:bg-gray-100"
              >
                Pay All
              </button>
              <button 
                onClick={handlePaySelected} 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Pay Selected ({selectedBills.length})
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Show refresh status */}
        <div className="text-right">
          <span className="text-xs text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>

        {/* Bills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingBills.map((bill) => (
            <BillCard 
              key={bill.id} 
              bill={bill} 
              selectable={true}
              isSelected={selectedBills.includes(bill.id)}
              onSelect={() => handleSelectBill(bill.id)}
            />
          ))}
        </div>

        {pendingBills.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaMoneyBillWave className="text-6xl text-green-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">🎉 No pending bills!</p>
            <p className="text-gray-400 text-sm mt-1">All your bills are paid</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PendingBills;