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
// Substation APIs
export const createSubstation = (data) => api.post('/substations', data);
export const getSubstations = (params) => api.get('/substations', { params });
export const getSubstationById = (id) => api.get(`/substations/${id}`);
export const updateSubstation = (id, data) => api.put(`/substations/${id}`, data);
export const deleteSubstation = (id) => api.delete(`/substations/${id}`);

// Transformer APIs
export const createTransformer = (data) => api.post('/transformers', data);
export const getTransformers = (params) => api.get('/transformers', { params });
export const getTransformerById = (id) => api.get(`/transformers/${id}`);
export const updateTransformer = (id, data) => api.put(`/transformers/${id}`, data);

// Electricity Usage APIs
export const createElectricityUsage = (data) => api.post('/electricity-usage', data);
export const getElectricityUsage = (params) => api.get('/electricity-usage', { params });
export const getAreaUsageSummary = (areaName, days = 30) => api.get(`/electricity-usage/area/${areaName}?days=${days}`);

// Power Outage APIs
export const createPowerOutage = (data) => api.post('/power-outages', data);
export const getPowerOutages = (params) => api.get('/power-outages', { params });
export const getPowerOutageById = (id) => api.get(`/power-outages/${id}`);
export const updatePowerOutage = (id, data) => api.put(`/power-outages/${id}`, data);
export const getCurrentOutages = () => api.get('/power-outages/active/current');

// Maintenance APIs
export const createMaintenance = (data) => api.post('/transformer-maintenance', data);
export const getMaintenanceRecords = (params) => api.get('/transformer-maintenance', { params });
export const updateMaintenance = (id, data) => api.put(`/transformer-maintenance/${id}`, data);

// Power Dashboard APIs
export const getPowerDashboardStats = () => api.get('/power-dashboard/stats');
export const getConsumptionTrend = (days = 7) => api.get(`/power-dashboard/consumption-trend?days=${days}`);
export const getAreaRanking = () => api.get('/power-dashboard/area-ranking');
// Waste Vehicle APIs
export const createWasteVehicle = (data) => api.post('/waste-vehicles', data);
export const getWasteVehicles = (params) => api.get('/waste-vehicles', { params });
export const getWasteVehicleById = (id) => api.get(`/waste-vehicles/${id}`);
export const updateWasteVehicle = (id, data) => api.put(`/waste-vehicles/${id}`, data);
export const deleteWasteVehicle = (id) => api.delete(`/waste-vehicles/${id}`);

// Collection Route APIs
export const createCollectionRoute = (data) => api.post('/collection-routes', data);
export const getCollectionRoutes = (params) => api.get('/collection-routes', { params });
export const getCollectionRouteById = (id) => api.get(`/collection-routes/${id}`);
export const updateCollectionRoute = (id, data) => api.put(`/collection-routes/${id}`, data);

// Waste Bin APIs
export const createWasteBin = (data) => api.post('/waste-bins', data);
export const getWasteBins = (params) => api.get('/waste-bins', { params });
export const getWasteBinById = (id) => api.get(`/waste-bins/${id}`);
export const updateWasteBin = (id, data) => api.put(`/waste-bins/${id}`, data);

// Waste Collection APIs
export const createWasteCollection = (data) => api.post('/waste-collections', data);
export const getWasteCollections = (params) => {
  // Remove undefined or empty params
  const filteredParams = {};
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] && params[key] !== '') {
        filteredParams[key] = params[key];
      }
    });
  }
  return api.get('/waste-collections', { params: filteredParams });
};
export const getDailyWasteReport = (date) => {
  if (!date) return Promise.reject(new Error("Date is required"));
  return api.get(`/waste-collections/reports/daily?report_date=${date}`);
};

// Sanitation Worker APIs
export const createSanitationWorker = (data) => api.post('/sanitation-workers', data);
export const getSanitationWorkers = (params) => api.get('/sanitation-workers', { params });
export const updateSanitationWorker = (id, data) => api.put(`/sanitation-workers/${id}`, data);

// Waste Dashboard APIs
export const getWasteDashboardStats = () => api.get('/waste-dashboard/stats');
export const getWasteCollectionTrend = (days = 7) => api.get(`/waste-dashboard/collection-trend?days=${days}`);

export default api;