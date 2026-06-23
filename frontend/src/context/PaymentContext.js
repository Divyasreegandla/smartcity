// src/context/PaymentContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import paymentService from '../services/paymentService';

const PaymentContext = createContext();

export const usePayments = () => useContext(PaymentContext);

export const PaymentProvider = ({ children }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  const createPayment = useCallback(async (billId, gateway, successUrl, cancelUrl) => {
    setLoading(true);
    try {
      let result;
      switch (gateway) {
        case 'stripe':
          result = await paymentService.createStripePayment(billId, successUrl, cancelUrl);
          break;
        case 'razorpay':
          result = await paymentService.createRazorpayPayment(billId, successUrl, cancelUrl);
          break;
        case 'cashfree':
          result = await paymentService.createCashfreePayment(billId, successUrl, cancelUrl);
          break;
        default:
          throw new Error('Unsupported payment gateway');
      }
      setCurrentPayment(result);
      return result;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Payment initiation failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyRazorpayPayment = useCallback(async (paymentId, orderId, transactionId, signature) => {
    setLoading(true);
    try {
      const result = await paymentService.verifyRazorpayPayment(
        paymentId,
        orderId,
        transactionId,
        signature
      );
      toast.success('Payment verified successfully!');
      return result;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Payment verification failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPaymentHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await paymentService.getPaymentHistory();
      setPayments(data);
      return data;
    } catch (error) {
      toast.error('Failed to fetch payment history');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPaymentStatus = useCallback(async (paymentId) => {
    try {
      return await paymentService.getPaymentStatus(paymentId);
    } catch (error) {
      toast.error('Failed to fetch payment status');
      throw error;
    }
  }, []);

  const getInvoice = useCallback(async (paymentId) => {
    try {
      const data = await paymentService.getInvoice(paymentId);
      setCurrentInvoice(data);
      return data;
    } catch (error) {
      toast.error('Failed to fetch invoice');
      throw error;
    }
  }, []);

  const getReceipt = useCallback(async (paymentId) => {
    try {
      return await paymentService.getReceipt(paymentId);
    } catch (error) {
      toast.error('Failed to generate receipt');
      throw error;
    }
  }, []);

  const sendReceiptEmail = useCallback(async (paymentId) => {
    try {
      const result = await paymentService.sendReceiptEmail(paymentId);
      toast.success('Receipt sent to your email!');
      return result;
    } catch (error) {
      toast.error('Failed to send receipt email');
      throw error;
    }
  }, []);

  return (
    <PaymentContext.Provider
      value={{
        payments,
        loading,
        currentPayment,
        currentInvoice,
        createPayment,
        verifyRazorpayPayment,
        getPaymentHistory,
        getPaymentStatus,
        getInvoice,
        getReceipt,
        sendReceiptEmail,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
