import React from 'react';
import { FaMapMarkerAlt, FaCar, FaClock } from 'react-icons/fa';

const CongestionCard = ({ report }) => {
  const getCongestionColor = (level) => {
    switch(level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCongestionIcon = (level) => {
    switch(level) {
      case 'low': return '🟢';
      case 'moderate': return '🟡';
      case 'high': return '🟠';
      case 'severe': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <FaMapMarkerAlt className="text-primary-500" />
          <h3 className="font-semibold text-gray-800">{report.area_name}</h3>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getCongestionColor(report.congestion_level)}`}>
          {getCongestionIcon(report.congestion_level)} {report.congestion_level}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <FaCar className="mx-auto text-primary-500 mb-1" />
          <p className="text-2xl font-bold text-gray-800">{report.vehicle_count || 0}</p>
          <p className="text-xs text-gray-500">Vehicles</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <FaClock className="mx-auto text-primary-500 mb-1" />
          <p className="text-sm font-medium text-gray-800">
            {new Date(report.report_time).toLocaleTimeString()}
          </p>
          <p className="text-xs text-gray-500">Last updated</p>
        </div>
      </div>
      
      <p className="text-xs text-gray-400 text-center">
        Reported: {new Date(report.created_at).toLocaleString()}
      </p>
    </div>
  );
};

export default CongestionCard;