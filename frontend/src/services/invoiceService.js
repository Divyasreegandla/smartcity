// src/services/invoiceService.js
import api from './api';

const invoiceService = {
  // Get invoice data
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

export default invoiceService;