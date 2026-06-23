// src/pages/billing/PaymentHistory.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePayments } from '../../context/PaymentContext';
import Layout from '../../components/Layout/Layout';
import PaymentHistoryTable from '../../components/Billing/PaymentHistoryTable';
import { FaArrowLeft } from 'react-icons/fa';

const PaymentHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { payments, getPaymentHistory, loading } = usePayments();

  useEffect(() => {
    getPaymentHistory();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/bills')} className="text-gray-600 hover:text-gray-800">
            <FaArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Payment History</h1>
            <p className="text-gray-500">View all your payment transactions</p>
          </div>
        </div>

        <PaymentHistoryTable payments={payments} loading={loading} />
      </div>
    </Layout>
  );
};

export default PaymentHistory;