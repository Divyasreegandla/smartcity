// src/pages/billing/BillHistory.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBills } from '../../context/BillContext';
import { usePayments } from '../../context/PaymentContext';
import Layout from '../../components/Layout/Layout';
import PaymentHistoryTable from '../../components/Billing/PaymentHistoryTable';
import { FaArrowLeft, FaFileInvoice } from 'react-icons/fa';

const BillHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { billHistory, fetchBillHistory, loading } = useBills();
  const { payments, getPaymentHistory } = usePayments();

  useEffect(() => {
    fetchBillHistory();
    getPaymentHistory();
  }, []);

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
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/bills')} className="text-gray-600 hover:text-gray-800">
            <FaArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bill History</h1>
            <p className="text-gray-500">View all your paid bills and payment history</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-500 text-sm">Total Paid Bills</p>
            <p className="text-2xl font-bold text-gray-800">{billHistory.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-500 text-sm">Total Amount Paid</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{billHistory.reduce((sum, b) => sum + (b.total_amount || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-500 text-sm">Total Payments</p>
            <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
          </div>
        </div>

        {/* Payment History Table */}
        <PaymentHistoryTable payments={payments} />
      </div>
    </Layout>
  );
};

export default BillHistory;