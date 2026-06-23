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
  FaRecycle,
  FaTrafficLight,
  FaCarCrash,
  FaRoad,
  FaGavel,
  FaMapMarkerAlt,
  // ============ PHASE 7 - Billing Icons ============
  FaFileInvoice,
  FaClock,
  FaHistory,
  FaCreditCard,
  FaMoneyBillWave,
  FaShieldAlt,
  FaEnvelope,
  FaPhone,
  FaWallet
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
    // Phase 6 - Traffic Management for Citizens
    { path: '/traffic-dashboard', name: 'Traffic Dashboard', icon: FaTrafficLight },
    { path: '/traffic-incidents', name: 'Report Incident', icon: FaCarCrash },
    { path: '/congestion-reports', name: 'Congestion', icon: FaChartLine },
    { path: '/traffic-violations', name: 'My Violations', icon: FaGavel },
    // ============ PHASE 7 - Billing for Citizens ============
    { path: '/bills', name: 'My Bills', icon: FaFileInvoice },
    { path: '/bills/pending', name: 'Pending Bills', icon: FaClock },
    { path: '/payment-history', name: 'Payment History', icon: FaHistory },
    { path: '/property-tax', name: 'Property Tax', icon: FaBuilding },
    { path: '/verify-mobile', name: 'Verify Mobile', icon: FaPhone },
    { path: '/verify-email', name: 'Verify Email', icon: FaEnvelope },
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
    
    // Phase 6 - Traffic Management
    { path: '/traffic-dashboard', name: 'Traffic Dashboard', icon: FaChartBar },
    { path: '/traffic-signals', name: 'Traffic Signals', icon: FaTrafficLight },
    { path: '/traffic-incidents', name: 'Incidents', icon: FaCarCrash },
    { path: '/congestion-reports', name: 'Congestion', icon: FaChartLine },
    { path: '/road-maintenance', name: 'Road Maintenance', icon: FaRoad },
    { path: '/traffic-violations', name: 'Violations', icon: FaGavel },
    
    // ============ PHASE 7 - Billing for Admin ============
    { path: '/generate-bill', name: 'Generate Bill', icon: FaPlusCircle },
    
    { path: '/bills', name: 'All Bills', icon: FaFileInvoice },
    { path: '/bills/pending', name: 'Pending Bills', icon: FaClock },
    { path: '/payment-history', name: 'Payment History', icon: FaHistory },
    { path: '/property-tax', name: 'Property Tax', icon: FaBuilding },
    { path: '/verify-mobile', name: 'Verify Mobile', icon: FaPhone },
    { path: '/verify-email', name: 'Verify Email', icon: FaEnvelope },
  ];

  const menuItems = isAdmin ? adminMenu : citizenMenu;

  const renderAdminMenu = () => {
    const mainItems = menuItems.slice(0, 5);
    const waterItems = menuItems.slice(5, 11);
    const electricityItems = menuItems.slice(11, 17);
    const wasteItems = menuItems.slice(17, 23);
    const trafficItems = menuItems.slice(23, 29);
    const billingItems = menuItems.slice(29, 35);

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

        {/* Phase 6 - Traffic Management Section */}
        <div className="px-4 py-2 mt-4 pt-2 border-t border-gray-800">
          <p className="text-xs text-purple-400 uppercase tracking-wider flex items-center">
            <FaTrafficLight className="mr-1" size={10} /> Traffic Management
          </p>
        </div>
        {trafficItems.map((item) => (
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

        {/* ============ PHASE 7 - Billing Section ============ */}
        <div className="px-4 py-2 mt-4 pt-2 border-t border-gray-800">
          <p className="text-xs text-emerald-400 uppercase tracking-wider flex items-center">
            <FaWallet className="mr-1" size={10} /> Billing & Payments
          </p>
        </div>
        {billingItems.map((item) => (
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
    // Split citizen menu into sections
    const mainItems = menuItems.slice(0, 5);
    const waterItems = menuItems.slice(5, 8);
    const powerItems = menuItems.slice(8, 9);
    const wasteItems = menuItems.slice(9, 10);
    const trafficItems = menuItems.slice(10, 14);
    const billingItems = menuItems.slice(14, 20);

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
            <FaBolt className="mr-1" size={10} /> Electricity
          </p>
        </div>
        {powerItems.map((item) => (
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

        {/* Phase 6 - Traffic Management Section */}
        <div className="px-4 py-2 mt-4 pt-2 border-t border-gray-800">
          <p className="text-xs text-purple-400 uppercase tracking-wider flex items-center">
            <FaTrafficLight className="mr-1" size={10} /> Traffic Management
          </p>
        </div>
        {trafficItems.map((item) => (
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

        {/* ============ PHASE 7 - Billing Section ============ */}
        <div className="px-4 py-2 mt-4 pt-2 border-t border-gray-800">
          <p className="text-xs text-emerald-400 uppercase tracking-wider flex items-center">
            <FaWallet className="mr-1" size={10} /> Billing & Payments
          </p>
        </div>
        {billingItems.map((item) => (
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
        <p className="text-xs text-gray-500 text-center">Smart City Platform v7.0</p>
        <p className="text-xs text-gray-600 text-center mt-1">Billing & Payment System</p>
      </div>
    </aside>
  );
};

export default Sidebar;