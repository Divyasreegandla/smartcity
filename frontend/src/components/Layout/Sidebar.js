import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUser, 
  FaUsers, 
  FaFileAlt, 
  FaPlusCircle, 
  FaBuilding,
  FaChartBar,
  FaTint,           // NEW
  FaCalendarAlt,    // NEW
  FaChartLine,      // NEW
  FaExclamationTriangle  // NEW
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const citizenMenu = [
    { path: '/dashboard', name: 'Dashboard', icon: FaTachometerAlt, end: true },
    { path: '/complaints', name: 'My Complaints', icon: FaFileAlt, end: true },
    { path: '/complaints/raise', name: 'Raise Complaint', icon: FaPlusCircle, end: true },
    { path: '/my-assignments', name: 'My Assignments', icon: FaBuilding, end: true },
    { path: '/profile', name: 'My Profile', icon: FaUser, end: true },
    { path: '/water-dashboard', name: 'Water Supply', icon: FaTint, end: true },
{ path: '/water-zones', name: 'Water Zones', icon: FaBuilding, end: true },
{ path: '/water-leaks', name: 'Report Leak', icon: FaExclamationTriangle, end: true },

  ];

  const adminMenu = [
    { path: '/admin-dashboard', name: 'Dashboard', icon: FaChartBar, end: true },
    { path: '/complaints', name: 'All Complaints', icon: FaFileAlt, end: true },
    { path: '/departments', name: 'Departments', icon: FaBuilding, end: true },
    { path: '/citizens', name: 'Citizens', icon: FaUsers, end: true },
    { path: '/water-dashboard', name: 'Water Dashboard', icon: FaTint, end: true },
{ path: '/water-zones', name: 'Water Zones', icon: FaBuilding, end: true },
{ path: '/water-schedules', name: 'Supply Schedule', icon: FaCalendarAlt, end: true },
{ path: '/water-tanks', name: 'Water Tanks', icon: FaTint, end: true },
{ path: '/water-consumption', name: 'Consumption', icon: FaChartLine, end: true },
{ path: '/water-leaks', name: 'Leak Reports', icon: FaExclamationTriangle, end: true },
    { path: '/profile', name: 'My Profile', icon: FaUser, end: true },
  ];

  const menuItems = isAdmin ? adminMenu : citizenMenu;

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-primary-400">Smart City</h2>
        <p className="text-sm text-gray-400 mt-1">Complaint Management</p>
      </div>
      
      <div className="p-4 border-b border-gray-800 bg-gray-800/50">
        <p className="text-xs text-gray-400">Logged in as</p>
        <p className="text-sm font-semibold text-white capitalize">{user?.role}</p>
        <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
      </div>
      
      <nav className="mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white border-l-4 border-primary-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="text-lg" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">Smart City Platform v2.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;