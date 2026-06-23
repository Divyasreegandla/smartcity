// src/services/billService.js
import api from './api';

const billService = {
  // Get all bills
  getBills: async (skip = 0, limit = 100) => {
    const response = await api.get(`/bills?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Get pending bills
  getPendingBills: async () => {
    const response = await api.get('/bills/pending');
    return response.data;
  },

  // Get bill history (paid bills)
  getBillHistory: async (skip = 0, limit = 100) => {
    const response = await api.get(`/bills/history?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Get bill by ID
  getBillById: async (billId) => {
    const response = await api.get(`/bills/${billId}`);
    return response.data;
  },

  // Generate bill (admin only)
  generateBill: async (billData) => {
    const response = await api.post('/bills/generate', billData);
    return response.data;
  },

  // Update bill status (admin only)
  updateBillStatus: async (billId, status) => {
    const response = await api.put(`/bills/${billId}`, { bill_status: status });
    return response.data;
  },

  // Get property tax bills
  getPropertyTaxBills: async () => {
    const response = await api.get('/property-tax/my-bills');
    return response.data;
  },

  // Calculate property tax
  calculatePropertyTax: async (propertyValue, propertyType) => {
    const response = await api.post('/property-tax/calculate', {
      property_value: propertyValue,
      property_type: propertyType
    });
    return response.data;
  },

  // Generate property tax bill (admin only)
  generatePropertyTaxBill: async (data) => {
    const response = await api.post('/property-tax/generate-bill', data);
    return response.data;
  }
};

export default billService;