import React from 'react';
import { FaTint, FaUsers, FaMapMarker, FaEdit, FaTrash } from 'react-icons/fa';

const WaterZoneCard = ({ zone, onEdit, onDelete }) => {
  // Safely access properties with fallbacks
  const zoneName = zone?.zone_name || 'Unknown Zone';
  const zoneCode = zone?.zone_code || 'N/A';
  const zoneStatus = zone?.status || 'inactive';
  const areaName = zone?.area_name || 'Unknown Area';
  const population = zone?.population || 0;

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{zoneName}</h3>
          <p className="text-xs text-gray-500">{zoneCode}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(zoneStatus)}`}>
          {getStatusLabel(zoneStatus)}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <FaMapMarker className="mr-2 text-primary-500 flex-shrink-0" />
          <span>{areaName}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaUsers className="mr-2 text-primary-500 flex-shrink-0" />
          <span>Population: {population.toLocaleString()}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaTint className="mr-2 text-primary-500 flex-shrink-0" />
          <span>Zone ID: {zone?.id || 'N/A'}</span>
        </div>
      </div>
      
      {(onEdit || onDelete) && (
        <div className="flex justify-end space-x-2 pt-3 border-t">
          {onEdit && (
            <button
              onClick={() => onEdit(zone)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <FaEdit />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(zone?.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <FaTrash />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WaterZoneCard;