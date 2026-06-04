import React from 'react';
import { FaTint, FaExclamationTriangle, FaCheckCircle, FaWrench } from 'react-icons/fa';

const TankStatusIndicator = ({ tank }) => {
  // Safely access properties with fallbacks
  const tankName = tank?.tank_name || 'Unknown Tank';
  const tankLocation = tank?.location || 'Unknown Location';
  const tankStatus = tank?.status || 'partial';
  const capacityLiters = tank?.capacity_liters || 0;
  const currentLevel = tank?.current_level || 0;
  
  const fillPercentage = capacityLiters > 0 ? (currentLevel / capacityLiters) * 100 : 0;
  
  const getStatusIcon = () => {
    switch(tankStatus) {
      case 'full': return <FaCheckCircle className="text-green-500 text-xl" />;
      case 'partial': return <FaTint className="text-blue-500 text-xl" />;
      case 'low': return <FaExclamationTriangle className="text-yellow-500 text-xl" />;
      case 'critical': return <FaExclamationTriangle className="text-red-500 text-xl" />;
      case 'maintenance': return <FaWrench className="text-gray-500 text-xl" />;
      default: return <FaTint className="text-blue-500 text-xl" />;
    }
  };

  const getStatusColor = () => {
    if (fillPercentage >= 90) return 'bg-green-500';
    if (fillPercentage >= 50) return 'bg-blue-500';
    if (fillPercentage >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (fillPercentage >= 90) return 'Full';
    if (fillPercentage >= 50) return 'Partial';
    if (fillPercentage >= 20) return 'Low';
    return 'Critical';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{tankName}</h3>
          <p className="text-xs text-gray-500">{tankLocation}</p>
        </div>
        {getStatusIcon()}
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Fill Level</span>
          <span className="font-medium">{fillPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`${getStatusColor()} rounded-full h-3 transition-all duration-500`}
            style={{ width: `${fillPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Capacity</p>
          <p className="font-medium">{capacityLiters.toLocaleString()} L</p>
        </div>
        <div>
          <p className="text-gray-500">Current Level</p>
          <p className="font-medium">{currentLevel.toLocaleString()} L</p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          tankStatus === 'full' ? 'bg-green-100 text-green-800' :
          tankStatus === 'partial' ? 'bg-blue-100 text-blue-800' :
          tankStatus === 'low' ? 'bg-yellow-100 text-yellow-800' :
          tankStatus === 'critical' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          Status: {getStatusText()}
        </span>
      </div>
    </div>
  );
};

export default TankStatusIndicator;