import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FaUserCircle className="text-gray-600 text-2xl" />
            <span className="text-gray-700">{user?.full_name}</span>
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full capitalize">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;