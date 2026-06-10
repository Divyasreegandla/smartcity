import React from 'react';
import { FaTruck, FaUser, FaPhone, FaEdit, FaTrash } from 'react-icons/fa';

const VehicleCard = ({ vehicle, onEdit, onDelete, isAdmin }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVehicleTypeIcon = (type) => {
    switch(type) {
      case 'compactor': return '🚛';
      case 'tipper': return '🚚';
      case 'dumper': return '🚜';
      default: return '🚛';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
            {getVehicleTypeIcon(vehicle.vehicle_type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{vehicle.vehicle_number}</h3>
            <p className="text-xs text-gray-500 capitalize">{vehicle.vehicle_type}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(vehicle.status)}`}>
          {vehicle.status}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <FaUser className="mr-2 text-primary-500" />
          <span>{vehicle.driver_name}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaPhone className="mr-2 text-primary-500" />
          <span>{vehicle.contact_number}</span>
        </div>
      </div>
      
      {isAdmin && (
        <div className="flex justify-end space-x-2 pt-3 border-t">
          <button onClick={() => onEdit(vehicle)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
            <FaEdit />
          </button>
          <button onClick={() => onDelete(vehicle.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
            <FaTrash />
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleCard;