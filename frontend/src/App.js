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
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;