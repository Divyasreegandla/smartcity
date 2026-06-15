import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Toast from './components/Common/Toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CitizenProfile from './pages/CitizenProfile';
import CitizensList from './pages/CitizensList';
import ComplaintDashboard from './pages/ComplaintDashboard';
import RaiseComplaint from './pages/RaiseComplaint';
import ComplaintDetails from './pages/ComplaintDetails';
import DepartmentManagement from './pages/DepartmentManagement';
import AdminDashboard from './pages/AdminDashboard';
import MyAssignments from './pages/MyAssignments';
import WaterDashboard from './pages/WaterDashboard';
import WaterZones from './pages/WaterZones';
import WaterSchedules from './pages/WaterSchedules';
import WaterTanks from './pages/WaterTanks';
import WaterLeakReports from './pages/WaterLeakReports';
import WaterConsumption from './pages/WaterConsumption';
import ElectricityDashboard from './pages/ElectricityDashboard';
import SubstationManagement from './pages/SubstationManagement';
import TransformerManagement from './pages/TransformerManagement';
import PowerOutageTracking from './pages/PowerOutageTracking';
import ElectricityConsumption from './pages/ElectricityConsumption';
import MaintenanceManagement from './pages/MaintenanceManagement';
import WasteDashboard from './pages/WasteDashboard';
import VehicleManagement from './pages/VehicleManagement';
import RouteManagement from './pages/RouteManagement';
import WasteBinMonitoring from './pages/WasteBinMonitoring';
import CollectionReports from './pages/CollectionReports';
import SanitationWorkerManagement from './pages/SanitationWorkerManagement';
import TrafficDashboard from './pages/traffic/TrafficDashboard';
import TrafficSignals from './pages/traffic/TrafficSignals';
import TrafficIncidents from './pages/traffic/TrafficIncidents';
import CongestionReports from './pages/traffic/CongestionReports';
import RoadMaintenance from './pages/traffic/RoadMaintenance';
import TrafficViolations from './pages/traffic/TrafficViolations';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toast />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><CitizenProfile /></ProtectedRoute>} />
          <Route path="/citizens" element={<ProtectedRoute adminOnly><CitizensList /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={
  <ProtectedRoute adminOnly>
    <AdminDashboard />
  </ProtectedRoute>
} />
<Route path="/my-assignments" element={
  <ProtectedRoute>
    <MyAssignments />
  </ProtectedRoute>
} />
          {/* Phase 2 Routes */}
          <Route path="/complaints" element={<ProtectedRoute><ComplaintDashboard /></ProtectedRoute>} />
          <Route path="/complaints/raise" element={<ProtectedRoute><RaiseComplaint /></ProtectedRoute>} />
          <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetails /></ProtectedRoute>} />
          <Route path="/departments" element={<ProtectedRoute adminOnly><DepartmentManagement /></ProtectedRoute>} />
          <Route path="/water-dashboard" element={
  <ProtectedRoute>
    <WaterDashboard />
  </ProtectedRoute>
} />
<Route path="/water-zones" element={
  <ProtectedRoute>
    <WaterZones />
  </ProtectedRoute>
} />
<Route path="/water-schedules" element={
  <ProtectedRoute adminOnly>
    <WaterSchedules />
  </ProtectedRoute>
} />
<Route path="/water-tanks" element={
  <ProtectedRoute>
    <WaterTanks />
  </ProtectedRoute>
} />
<Route path="/water-leaks" element={
  <ProtectedRoute>
    <WaterLeakReports />
  </ProtectedRoute>
} />
<Route path="/water-consumption" element={
  <ProtectedRoute adminOnly>
    <WaterConsumption />
  </ProtectedRoute>
} />
{/* Phase 4 - Electricity Power Routes */}
<Route path="/electricity-dashboard" element={
  <ProtectedRoute>
    <ElectricityDashboard />
  </ProtectedRoute>
} />
<Route path="/substations" element={
  <ProtectedRoute>
    <SubstationManagement />
  </ProtectedRoute>
} />
<Route path="/transformers" element={
  <ProtectedRoute>
    <TransformerManagement />
  </ProtectedRoute>
} />
<Route path="/power-outages" element={
  <ProtectedRoute>
    <PowerOutageTracking />
  </ProtectedRoute>
} />
<Route path="/electricity-consumption" element={
  <ProtectedRoute>
    <ElectricityConsumption />
  </ProtectedRoute>
} />
<Route path="/maintenance" element={
  <ProtectedRoute adminOnly>
    <MaintenanceManagement />
  </ProtectedRoute>
} />
{/* Phase 5 - Waste Management Routes */}
<Route path="/waste-dashboard" element={
  <ProtectedRoute>
    <WasteDashboard />
  </ProtectedRoute>
} />
<Route path="/waste-vehicles" element={
  <ProtectedRoute>
    <VehicleManagement />
  </ProtectedRoute>
} />
<Route path="/waste-routes" element={
  <ProtectedRoute>
    <RouteManagement />
  </ProtectedRoute>
} />
<Route path="/waste-bins" element={
  <ProtectedRoute>
    <WasteBinMonitoring />
  </ProtectedRoute>
} />
<Route path="/waste-collections" element={
  <ProtectedRoute>
    <CollectionReports />
  </ProtectedRoute>
} />
<Route path="/sanitation-workers" element={
  <ProtectedRoute>
    <SanitationWorkerManagement />
  </ProtectedRoute>
} />
<Route path="/traffic-dashboard" element={<ProtectedRoute><TrafficDashboard /></ProtectedRoute>} />
<Route path="/traffic-signals" element={<ProtectedRoute><TrafficSignals /></ProtectedRoute>} />
<Route path="/traffic-incidents" element={<ProtectedRoute><TrafficIncidents /></ProtectedRoute>} />
<Route path="/congestion-reports" element={<ProtectedRoute><CongestionReports /></ProtectedRoute>} />
<Route path="/road-maintenance" element={<ProtectedRoute><RoadMaintenance /></ProtectedRoute>} />
<Route path="/traffic-violations" element={<ProtectedRoute><TrafficViolations /></ProtectedRoute>} />




        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;