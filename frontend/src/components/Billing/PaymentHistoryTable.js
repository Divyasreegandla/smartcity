// src/components/Billing/PaymentHistoryTable.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaDownload, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const PaymentHistoryTable = ({ payments, loading = false }) => {
  const navigate = useNavigate();

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'failed': return <FaTimesCircle className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading payments...</p>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <FaClock className="text-4xl text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No payment history found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gateway</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <p className="text-sm font-mono text-gray-600">{payment.transaction_id || 'N/A'}</p>
                  <p className="text-xs text-gray-400">#{payment.id}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800">{payment.bill_number}</p>
                  <p className="text-xs text-gray-500">{payment.category_name}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-gray-800">₹{payment.amount?.toLocaleString()}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 capitalize">{payment.gateway}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(payment.payment_status)}
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(payment.payment_status)}`}>
                      {payment.payment_status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600">
                    {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : 
                     payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {payment.payment_status === 'success' && (
                      <button
                        onClick={() => navigate(`/invoice/${payment.id}`)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="View Invoice"
                      >
                        <FaEye />
                      </button>
                    )}
                    {payment.payment_status === 'success' && (
                      <button
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Download Receipt"
                        onClick={() => {
                          // Download receipt logic
                          window.open(`http://localhost:8000/payments/receipt/${payment.id}`, '_blank');
                        }}
                      >
                        <FaDownload />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistoryTable;