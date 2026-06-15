import React from 'react';
import { FaMapMarkerAlt, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const IncidentCard = ({ incident, onUpdateStatus, isAdmin }) => {
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'reported': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIncidentTypeLabel = (type) => {
    const types = {
      accident: '🚗 Accident',
      vehicle_breakdown: '🔧 Vehicle Breakdown',
      road_closure: '🚧 Road Closure',
      protest: '✊ Protest',
      construction: '🏗️ Construction',
      other: '📌 Other'
    };
    return types[type] || type;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-gray-500">{incident.incident_number}</p>
          <h3 className="font-semibold text-gray-800">{getIncidentTypeLabel(incident.incident_type)}</h3>
        </div>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityColor(incident.severity)}`}>
            {incident.severity}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(incident.status)}`}>
            {incident.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{incident.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <FaMapMarkerAlt className="mr-2 text-primary-500" />
          <span>{incident.location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaClock className="mr-2 text-primary-500" />
          <span>{new Date(incident.incident_time).toLocaleString()}</span>
        </div>
      </div>
      
      {isAdmin && incident.status !== 'resolved' && (
        <div className="pt-3 border-t">
          <select
            value={incident.status}
            onChange={(e) => onUpdateStatus?.(incident.id, e.target.value)}
            className="w-full px-3 py-1 text-sm border rounded-lg"
          >
            <option value="reported">Reported</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default IncidentCard;