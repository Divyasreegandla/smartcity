import React from 'react';
import { FaMapMarkerAlt, FaEdit } from 'react-icons/fa';

const BinStatusCard = ({ bin, onEdit, isAdmin }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'empty': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'full': return 'bg-orange-100 text-orange-800';
      case 'overflowing': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'empty': return '🟢';
      case 'partial': return '🟡';
      case 'full': return '🟠';
      case 'overflowing': return '🔴';
      default: return '⚪';
    }
  };

  const fillPercentage = (bin.fill_level / bin.bin_capacity) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{bin.bin_code}</h3>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <FaMapMarkerAlt className="mr-1" size={10} />
            {bin.location}
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(bin.status)}`}>
          {getStatusIcon(bin.status)} {bin.status}
        </span>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Fill Level</span>
          <span className="font-medium">{fillPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`rounded-full h-2 transition-all duration-500 ${
              fillPercentage >= 80 ? 'bg-red-500' :
              fillPercentage >= 50 ? 'bg-orange-500' :
              fillPercentage >= 20 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${fillPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Capacity</p>
          <p className="font-medium">{bin.bin_capacity} kg</p>
        </div>
        <div>
          <p className="text-gray-500">Current Fill</p>
          <p className="font-medium">{bin.fill_level} kg</p>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mt-3">
        Installed: {new Date(bin.installed_date).toLocaleDateString()}
      </div>
      
      {isAdmin && (
        <div className="flex justify-end pt-3 border-t mt-2">
          <button onClick={() => onEdit(bin)} className="flex items-center space-x-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
            <FaEdit size={14} />
            <span className="text-sm">Update Level</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BinStatusCard;