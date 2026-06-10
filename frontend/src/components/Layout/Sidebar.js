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
  FaTint,
  FaCalendarAlt,
  FaChartLine,
  FaExclamationTriangle,
  FaBolt,
  FaPlug,
  FaClipboardList,
  FaWater,
  FaTruck,
  FaRoute,
  FaTrashAlt,
  FaRecycle
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Citizen Menu
  const citizenMenu = [
    { path: '/dashboard', name: 'Dashboard', icon: FaTachometerAlt },
    { path: '/complaints', name: 'My Complaints', icon: FaFileAlt },
    { path: '/complaints/raise', name: 'Raise Complaint', icon: FaPlusCircle },
    { path: '/my-assignments', name: 'My Assignments', icon: FaBuilding },
    { path: '/profile', name: 'My Profile', icon: FaUser },
    { path: '/water-dashboard', name: 'Water Dashboard', icon: FaTint },
    { path: '/water-zones', name: 'Water Zones', icon: FaBuilding },
    { path: '/water-leaks', name: 'Report Leak', icon: FaExclamationTriangle },
    { path: '/electricity-dashboard', name: 'Power Dashboard', icon: FaPlug },
    { path: '/waste-dashboard', name: 'Waste Dashboard', icon: FaRecycle },
  ];

  // Admin Menu
  const adminMenu = [
    // Main
    { path: '/admin-dashboard', name: 'Dashboard', icon: FaChartBar },
    { path: '/complaints', name: 'All Complaints', icon: FaFileAlt },
    { path: '/departments', name: 'Departments', icon: FaBuilding },
    { path: '/citizens', name: 'Citizens', icon: FaUsers },
    { path: '/profile', name: 'My Profile', icon: FaUser },
    
    // Water Supply
    { path: '/water-dashboard', name: 'Water Dashboard', icon: FaTint },
    { path: '/water-zones', name: 'Water Zones', icon: FaBuilding },
    { path: '/water-schedules', name: 'Supply Schedule', icon: FaCalendarAlt },
    { path: '/water-tanks', name: 'Water Tanks', icon: FaTint },
    { path: '/water-consumption', name: 'Water Consumption', icon: FaChartLine },
    { path: '/water-leaks', name: 'Leak Reports', icon: FaExclamationTriangle },
    
    // Electricity
    { path: '/electricity-dashboard', name: 'Power Dashboard', icon: FaPlug },
    { path: '/substations', name: 'Substations', icon: FaBuilding },
    { path: '/transformers', name: 'Transformers', icon: FaBolt },
    { path: '/power-outages', name: 'Outages', icon: FaExclamationTriangle },
    { path: '/electricity-consumption', name: 'Elec. Consumption', icon: FaChartLine },
    { path: '/maintenance', name: 'Maintenance', icon: FaClipboardList },
    
    // Waste Management
    { path: '/waste-dashboard', name: 'Waste Dashboard', icon: FaRecycle },
    { path: '/waste-vehicles', name: 'Vehicles', icon: FaTruck },
    { path: '/waste-routes', name: 'Routes', icon: FaRoute },
    { path: '/waste-bins', name: 'Waste Bins', icon: FaTrashAlt },
    { path: '/waste-collections', name: 'Collections', icon: FaChartLine },
    { path: '/sanitation-workers', name: 'Sanitation', icon: FaUsers },
  ];

  const menuItems = isAdmin ? adminMenu : citizenMenu;

  const renderAdminMenu = () => {
    const mainItems = menuItems.slice(0, 5);
    const waterItems = menuItems.slice(5, 11);
    const electricityItems = menuItems.slice(11, 17);
    const wasteItems = menuItems.slice(17);

    return (
      <>
        {/* Main Section */}
        <div className="px-4 py-2 mt-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Main</p>
        </div>
        {mainItems.map((item) => (
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

        {/* Water Supply Section */}
        <div className="px-4 py-2 mt-4 pt-2 border-t border-gray-800">
          <p className="text-xs text-blue-400 uppercase tracking-wider flex items-center">
            <FaWater className="mr-1" size={10} /> Water Supply
          </p>
        </div>
        {waterItems.map((item) => (
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

        {/* Electricity Section */}
        <div className="px-4 py-2 mt-4 pt-2 border-t border-gray-800">
          <p className="text-xs text-yellow-400 uppercase tracking-wider flex items-center">
            <FaBolt className="mr-1" size={10} /> Electricity Power
          </p>
        </div>
        {electricityItems.map((item) => (
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

        {/* Waste Management Section */}
        <div className="px-4 py-2 mt-4 pt-2 border-t border-gray-800">
          <p className="text-xs text-green-400 uppercase tracking-wider flex items-center">
            <FaTrashAlt className="mr-1" size={10} /> Waste Management
          </p>
        </div>
        {wasteItems.map((item) => (
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
      </>
    );
  };

  const renderCitizenMenu = () => {
    return menuItems.map((item) => (
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
    ));
  };

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-primary-400">Smart City</h2>
        <p className="text-sm text-gray-400 mt-1">Management Platform</p>
      </div>
      
      <div className="p-4 border-b border-gray-800 bg-gray-800/50">
        <p className="text-xs text-gray-400">Logged in as</p>
        <p className="text-sm font-semibold text-white capitalize">{user?.role}</p>
        <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="py-4">
          {isAdmin ? renderAdminMenu() : renderCitizenMenu()}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <p className="text-xs text-gray-500 text-center">Smart City Platform v5.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;