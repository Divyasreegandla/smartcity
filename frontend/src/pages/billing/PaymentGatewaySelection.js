// src/pages/billing/PaymentGatewaySelection.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBills } from '../../context/BillContext';
import { usePayments } from '../../context/PaymentContext';
import Layout from '../../components/Layout/Layout';
import GatewaySelector from '../../components/Billing/GatewaySelector';
import OTPModal from '../../components/Billing/OTPModal';
import { FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PaymentGatewaySelection = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { getBillById, fetchPendingBills, fetchBillHistory, fetchBills } = useBills();
  const { createPayment, loading } = usePayments();
  
  const billIds = location.state?.billIds || [];
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [selectedBills, setSelectedBills] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showOTP, setShowOTP] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const fetchBills = async () => {
      if (billIds.length === 0) {
        toast.error('No bills selected');
        navigate('/bills/pending');
        return;
      }
      try {
        const bills = await Promise.all(billIds.map(id => getBillById(id)));
        setSelectedBills(bills);
        const total = bills.reduce((sum, b) => sum + (b.total_amount || 0), 0);
        setTotalAmount(total);
      } catch (error) {
        toast.error('Failed to fetch bill details');
      }
    };
    fetchBills();
  }, [billIds]);

  const handleGatewaySelect = (gateway) => {
    setSelectedGateway(gateway);
    setShowOTP(true);
  };

  const handleOTPVerified = async () => {
    setShowOTP(false);
    
    // ✅ Show loading
    const loadingToast = toast.loading('Processing payment...');
    
    try {
      const firstBill = selectedBills[0];
      const result = await createPayment(
        firstBill.id,
        selectedGateway,
        `${window.location.origin}/payment-success`,
        `${window.location.origin}/bills/pending`
      );
      
      setPaymentData(result);
      toast.dismiss(loadingToast);
      
      // ✅ Force refresh all bill data
      await Promise.all([
        fetchPendingBills(),
        fetchBillHistory(),
        fetchBills()
      ]);
      
      toast.success('Payment successful!');
      
      navigate('/payment-success', { 
        state: { 
          payment: result, 
          bills: selectedBills,
          refreshed: true 
        } 
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Payment initiation failed');
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/bills/pending')} className="text-gray-600 hover:text-gray-800">
            <FaArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Select Payment Method</h1>
            <p className="text-gray-500">Choose your preferred payment gateway</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>
          {selectedBills.map((bill) => (
            <div key={bill.id} className="flex justify-between py-2 border-b">
              <span>{bill.category_name} - {bill.bill_number}</span>
              <span>₹{bill.total_amount}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-4 pt-4 border-t">
            <span>Total Amount</span>
            <span className="text-primary-600">₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
          <FaShieldAlt className="text-blue-500 text-xl mt-1" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Secure Payment</p>
            <p className="text-xs text-blue-600">All transactions are encrypted and secure</p>
          </div>
        </div>

        {/* Gateway Selector */}
        <GatewaySelector onSelect={handleGatewaySelect} loading={loading} />
      </div>

      {/* OTP Modal */}
      {showOTP && (
        <OTPModal
          onVerify={handleOTPVerified}
          onClose={() => setShowOTP(false)}
          email={user?.email}
        />
      )}
    </Layout>
  );
};

export default PaymentGatewaySelection;