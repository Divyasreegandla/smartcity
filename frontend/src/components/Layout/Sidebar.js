import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUser, FaUsers } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const citizenMenu = [
    { path: '/dashboard', name: 'Dashboard', icon: FaTachometerAlt },
    { path: '/profile', name: 'My Profile', icon: FaUser },
  ];

  const adminMenu = [
    { path: '/dashboard', name: 'Dashboard', icon: FaTachometerAlt },
    { path: '/citizens', name: 'Citizens List', icon: FaUsers },
    { path: '/profile', name: 'My Profile', icon: FaUser },
  ];

  const menuItems = isAdmin ? adminMenu : citizenMenu;

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-primary-400">Smart City</h2>
        <p className="text-sm text-gray-400 mt-1">Management Platform</p>
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
        <p className="text-xs text-gray-500 text-center">Smart City Platform v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;