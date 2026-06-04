import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// In api.js, ensure the error interceptor extracts string messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } 
    else if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (typeof detail === 'string') {
        toast.error(detail);
      } else if (Array.isArray(detail)) {
        detail.forEach((err) => {
          const message = err.msg || err.message || 'Validation error';
          toast.error(message);
        });
      }
    }
    return Promise.reject(error);
  }
);
// Auth APIs
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getProfile = () => api.get('/auth/profile');

// Citizen APIs
export const getCitizens = () => api.get('/citizens/');
export const getCitizenProfile = (userId) => api.get(`/citizens/${userId}`);
export const updateCitizenProfile = (userId, data) => api.put(`/citizens/${userId}`, data);

// Complaint APIs
export const createComplaint = (data) => api.post('/complaints', data);
export const getComplaints = (params) => api.get('/complaints', { params });
export const getComplaintById = (id) => api.get(`/complaints/${id}`);
export const updateComplaint = (id, data) => api.put(`/complaints/${id}`, data);
export const deleteComplaint = (id) => api.delete(`/complaints/${id}`);
export const updateComplaintStatus = (id, data) => api.put(`/complaints/${id}/status`, data);
export const getComplaintHistory = (id) => api.get(`/complaints/${id}/history`);
export const uploadComplaintImage = (complaintId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/complaints/${complaintId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Department APIs
export const createDepartment = (data) => api.post('/departments', data);
export const getDepartments = () => api.get('/departments');
export const updateDepartment = (id, data) => api.put(`/departments/${id}`, data);
export const deleteDepartment = (id) => api.delete(`/departments/${id}`);

// Assignment APIs
export const assignComplaint = (data) => api.post('/assignments', data);
export const getComplaintAssignments = (complaintId) => api.get(`/assignments/complaint/${complaintId}`);
export const getMyAssignments = () => api.get('/assignments/my-assignments');
// ============ PHASE 3: Water Supply APIs ============

// Water Zones
export const createWaterZone = (data) => api.post('/water-zones', data);
export const getWaterZones = (params) => api.get('/water-zones', { params });
export const getWaterZoneById = (id) => api.get(`/water-zones/${id}`);
export const updateWaterZone = (id, data) => api.put(`/water-zones/${id}`, data);
export const deleteWaterZone = (id) => api.delete(`/water-zones/${id}`);

// Water Supply Schedules
export const createWaterSchedule = (data) => api.post('/water-schedules', data);
export const getWaterSchedules = (params) => api.get('/water-schedules', { params });
export const updateWaterSchedule = (id, data) => api.put(`/water-schedules/${id}`, data);

// Water Tanks
export const createWaterTank = (data) => api.post('/water-tanks', data);
export const getWaterTanks = (params) => api.get('/water-tanks', { params });
export const getWaterTankById = (id) => api.get(`/water-tanks/${id}`);
export const updateWaterTank = (id, data) => api.put(`/water-tanks/${id}`, data);

// Water Consumption
export const createWaterConsumption = (data) => api.post('/water-consumption', data);
export const getWaterConsumption = (params) => api.get('/water-consumption', { params });
export const getZoneConsumptionSummary = (zoneId) => api.get(`/water-consumption/zone/${zoneId}`);

// Water Leak Reports
export const createWaterLeakReport = (data) => api.post('/water-leak-reports', data);
export const getWaterLeakReports = (params) => api.get('/water-leak-reports', { params });
export const updateWaterLeakReport = (id, data) => api.put(`/water-leak-reports/${id}`, data);

// Water Dashboard
export const getWaterDashboardStats = () => api.get('/water-dashboard/stats');
export const getWeeklyWaterTrend = () => api.get('/water-dashboard/weekly-trend');
export const getZoneWiseWaterConsumption = () => api.get('/water-dashboard/zone-consumption');
export const getWaterLeakageSummary = () => api.get('/water-dashboard/leakage-summary');

export default api;