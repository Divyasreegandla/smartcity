import React from 'react';
import { FaUser, FaPhone, FaMapMarkerAlt, FaEdit, FaSun, FaMoon, FaRegMoon } from 'react-icons/fa';

const WorkerCard = ({ worker, onEdit, isAdmin }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShiftIcon = (shift) => {
    switch(shift) {
      case 'morning': return <FaSun className="text-yellow-500" />;
      case 'evening': return <FaMoon className="text-orange-500" />;
      case 'night': return <FaRegMoon className="text-blue-500" />;
      default: return <FaSun className="text-yellow-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{worker.full_name}</h3>
          <p className="text-xs text-gray-500">{worker.employee_code}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(worker.status)}`}>
          {worker.status.replace('_', ' ')}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <FaPhone className="mr-2 text-primary-500" />
          <span>{worker.phone}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaMapMarkerAlt className="mr-2 text-primary-500" />
          <span>{worker.assigned_area}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          {getShiftIcon(worker.shift_type)}
          <span className="ml-2 capitalize">{worker.shift_type} Shift</span>
        </div>
      </div>
      
      {isAdmin && (
        <div className="flex justify-end pt-3 border-t">
          <button onClick={() => onEdit(worker)} className="flex items-center space-x-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
            <FaEdit size={14} />
            <span className="text-sm">Edit</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkerCard;