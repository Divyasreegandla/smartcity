// src/pages/billing/PaymentSuccess.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBills } from '../../context/BillContext';
import { usePayments } from '../../context/PaymentContext';
import Layout from '../../components/Layout/Layout';
import { FaCheckCircle, FaDownload, FaEnvelope, FaHome, FaSync } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { getReceipt, sendReceiptEmail } = usePayments();
  const { fetchPendingBills, fetchBillHistory, fetchBills } = useBills();
  
  const payment = location.state?.payment;
  const bills = location.state?.bills || [];

  useEffect(() => {
    if (!payment) {
      navigate('/bills');
      return;
    }
    
    // ✅ Force refresh all bill data when component mounts
    const refreshAllData = async () => {
      try {
        console.log('🔄 Refreshing bill data...');
        await Promise.all([
          fetchPendingBills(),
          fetchBillHistory(),
          fetchBills()
        ]);
        console.log('✅ Bill data refreshed!');
      } catch (error) {
        console.error('❌ Error refreshing bill data:', error);
      }
    };
    
    refreshAllData();
    
    // ✅ Also refresh every 5 seconds for 30 seconds
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count <= 6) {
        refreshAllData();
      } else {
        clearInterval(interval);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [payment]);

  // ✅ handleDownloadReceipt function
  const handleDownloadReceipt = async () => {
    try {
      if (!payment?.payment_id) {
        toast.error('Payment ID not found');
        return;
      }
      
      const receipt = await getReceipt(payment.payment_id);
      
      // Create a download link for the PDF
      const link = document.createElement('a');
      const pdfUrl = receipt.pdf_url || `http://localhost:8000${receipt.pdf_path}`;
      link.href = pdfUrl;
      link.download = `receipt-${receipt.receipt_number || 'payment'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Receipt downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download receipt');
    }
  };

  // ✅ handleSendEmail function
  const handleSendEmail = async () => {
    try {
      if (!payment?.payment_id) {
        toast.error('Payment ID not found');
        return;
      }
      
      await sendReceiptEmail(payment.payment_id);
      toast.success('Receipt sent to your email!');
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Failed to send receipt');
    }
  };

  // ✅ handleRefresh function
  const handleRefresh = async () => {
    const toastId = toast.loading('Refreshing data...');
    try {
      await Promise.all([
        fetchPendingBills(),
        fetchBillHistory(),
        fetchBills()
      ]);
      toast.dismiss(toastId);
      toast.success('Data refreshed!');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to refresh data');
    }
  };

  if (!payment) {
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-6">Your payment has been completed successfully</p>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Payment ID</p>
                <p className="font-medium text-gray-800">{payment.payment_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="font-medium text-gray-800">₹{payment.amount?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gateway</p>
                <p className="font-medium text-gray-800 capitalize">{payment.gateway || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-medium text-green-600">Success</p>
              </div>
            </div>
          </div>

          {/* Bills Paid */}
          {bills.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <p className="font-medium text-gray-700 mb-2">Bills Paid</p>
              {bills.map((bill) => (
                <div key={bill.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                  <span>{bill.category_name}</span>
                  <span>₹{bill.total_amount}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <FaSync />
              <span>Refresh Data</span>
            </button>
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FaDownload />
              <span>Download Receipt</span>
            </button>
            <button
              onClick={handleSendEmail}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaEnvelope />
              <span>Email Receipt</span>
            </button>
            <button
              onClick={() => navigate('/bills')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <FaHome />
              <span>Back to Bills</span>
            </button>
          </div>
          
          {/* Refresh reminder */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              💡 Bills are automatically refreshed. Check your 
              <button 
                onClick={() => navigate('/bills/pending')}
                className="ml-1 text-yellow-800 font-semibold hover:underline"
              >
                Pending Bills
              </button>
              and 
              <button 
                onClick={() => navigate('/bills/history')}
                className="ml-1 text-yellow-800 font-semibold hover:underline"
              >
                Bill History
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;