// src/services/paymentService.js
import api from './api';

const paymentService = {
  // Create Stripe payment
  createStripePayment: async (billId, successUrl, cancelUrl) => {
    const response = await api.post('/payments/stripe/create', {
      bill_id: billId,
      gateway: 'stripe',
      success_url: successUrl,
      cancel_url: cancelUrl
    });
    return response.data;
  },

  // Create Razorpay payment
  createRazorpayPayment: async (billId, successUrl, cancelUrl) => {
    const response = await api.post('/payments/razorpay/create', {
      bill_id: billId,
      gateway: 'razorpay',
      success_url: successUrl,
      cancel_url: cancelUrl
    });
    return response.data;
  },

  // Create Cashfree payment
  createCashfreePayment: async (billId, successUrl, cancelUrl) => {
    const response = await api.post('/payments/cashfree/create', {
      bill_id: billId,
      gateway: 'cashfree',
      success_url: successUrl,
      cancel_url: cancelUrl
    });
    return response.data;
  },

  // Verify Razorpay payment
  verifyRazorpayPayment: async (paymentId, orderId, transactionId, signature) => {
    const response = await api.post('/payments/razorpay/verify', {
      payment_id: paymentId,
      gateway: 'razorpay',
      order_id: orderId,
      transaction_id: transactionId,
      signature: signature
    });
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async (skip = 0, limit = 100) => {
    const response = await api.get(`/payments/history?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}/status`);
    return response.data;
  },

  // Generate invoice
  getInvoice: async (paymentId) => {
    const response = await api.get(`/payments/invoice/${paymentId}`);
    return response.data;
  },

  // Generate receipt
  getReceipt: async (paymentId) => {
    const response = await api.get(`/payments/receipt/${paymentId}`);
    return response.data;
  },

  // Send receipt via email
  sendReceiptEmail: async (paymentId) => {
    const response = await api.post(`/payments/send-receipt/${paymentId}`);
    return response.data;
  }
};

export default paymentService;