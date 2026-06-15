import React from 'react';
import { FaRoad, FaCalendarAlt, FaRupeeSign, FaWrench } from 'react-icons/fa';

const MaintenanceCard = ({ maintenance, onUpdateStatus, isAdmin }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'routine': return '🔄 Routine';
      case 'repair': return '🔧 Repair';
      case 'resurfacing': return '🛣️ Resurfacing';
      case 'reconstruction': return '🏗️ Reconstruction';
      case 'emergency': return '🚨 Emergency';
      default: return '📋 ' + type;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <FaRoad className="text-primary-500" />
          <h3 className="font-semibold text-gray-800">{maintenance.road_name}</h3>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(maintenance.status)}`}>
          {maintenance.status?.replace('_', ' ') || 'planned'}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <FaWrench className="mr-2 text-primary-500" />
          <span>{getTypeLabel(maintenance.maintenance_type)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaCalendarAlt className="mr-2 text-primary-500" />
          <span>Area: {maintenance.area_name}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaCalendarAlt className="mr-2 text-primary-500" />
          <span>Start: {maintenance.start_date ? new Date(maintenance.start_date).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaCalendarAlt className="mr-2 text-primary-500" />
          <span>Expected: {maintenance.expected_completion_date ? new Date(maintenance.expected_completion_date).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 font-semibold">
          <FaRupeeSign className="mr-2 text-primary-500" />
          <span>₹{maintenance.estimated_cost?.toLocaleString() || 0}</span>
        </div>
      </div>
      
      {isAdmin && maintenance.status !== 'completed' && (
        <div className="pt-3 border-t">
          <select
            value={maintenance.status || 'planned'}
            onChange={(e) => onUpdateStatus?.(maintenance.id, e.target.value)}
            className="w-full px-3 py-1 text-sm border rounded-lg"
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default MaintenanceCard;