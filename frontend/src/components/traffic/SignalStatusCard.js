import React from 'react';
import { FaMapMarkerAlt, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';

const SignalStatusCard = ({ signal, onEdit, onDelete, onStatusChange, isAdmin }) => {
  const getStatusIcon = (status) => {
    switch(status) {
      case 'red': return '🔴';
      case 'yellow': return '🟡';
      case 'green': return '🟢';
      case 'flashing': return '⚠️';
      case 'maintenance': return '🔧';
      default: return '⚪';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'red': return 'bg-red-100 text-red-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'flashing': return 'bg-orange-100 text-orange-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!signal) return null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className={`p-3 border-b ${getStatusColor(signal.signal_status)}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getStatusIcon(signal.signal_status)}</span>
            <span className="font-mono text-sm font-bold">{signal.signal_code || 'N/A'}</span>
          </div>
          <span className="text-sm font-medium capitalize">{signal.signal_status || 'unknown'}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2">{signal.junction_name || 'Unknown Junction'}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FaMapMarkerAlt className="mr-2 text-primary-500 flex-shrink-0" />
            <span>{signal.location || 'Unknown Location'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaCalendarAlt className="mr-2 text-primary-500 flex-shrink-0" />
            <span>Installed: {signal.installation_date ? new Date(signal.installation_date).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex justify-between items-center pt-3 border-t">
            <select
              value={signal.signal_status || 'red'}
              onChange={(e) => onStatusChange?.(signal.id, e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="red">🔴 Red</option>
              <option value="yellow">🟡 Yellow</option>
              <option value="green">🟢 Green</option>
              <option value="flashing">⚠️ Flashing</option>
              <option value="maintenance">🔧 Maintenance</option>
            </select>
            <div className="flex space-x-2">
              <button onClick={() => onEdit?.(signal)} className="text-blue-600 hover:text-blue-800">
                <FaEdit />
              </button>
              <button onClick={() => onDelete?.(signal.id)} className="text-red-600 hover:text-red-800">
                <FaTrash />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalStatusCard;