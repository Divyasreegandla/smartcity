import React from 'react';
import { FaExclamationTriangle, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const OutageStatusCard = ({ outage, onResolve }) => {
  const getStatusIcon = () => {
    switch(outage.status) {
      case 'reported': return <FaExclamationTriangle className="text-red-500 text-xl" />;
      case 'in_progress': return <FaSpinner className="text-yellow-500 text-xl animate-spin" />;
      case 'resolved': return <FaCheckCircle className="text-green-500 text-xl" />;
      case 'cancelled': return <FaTimesCircle className="text-gray-500 text-xl" />;
      default: return <FaExclamationTriangle className="text-red-500 text-xl" />;
    }
  };

  const getStatusColor = () => {
    switch(outage.status) {
      case 'reported': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    switch(outage.status) {
      case 'reported': return 'Reported';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'cancelled': return 'Cancelled';
      default: return outage.status;
    }
  };

  const duration = outage.duration_hours ? `${outage.duration_hours} hours` : 'Ongoing';

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-gray-500">{outage.outage_number}</p>
          <h3 className="font-semibold text-gray-800">{outage.area_name}</h3>
        </div>
        {getStatusIcon()}
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-2">{outage.outage_reason}</p>
        <div className="flex items-center text-xs text-gray-500">
          <span>Started: {new Date(outage.outage_start_time).toLocaleString()}</span>
        </div>
        {outage.outage_end_time && (
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <span>Resolved: {new Date(outage.outage_end_time).toLocaleString()}</span>
          </div>
        )}
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <span>Duration: {duration}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t">
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor()}`}>
          {getStatusLabel()}
        </span>
        {outage.status !== 'resolved' && outage.status !== 'cancelled' && onResolve && (
          <button
            onClick={() => onResolve(outage.id)}
            className="text-sm text-green-600 hover:text-green-700"
          >
            Mark Resolved
          </button>
        )}
      </div>
    </div>
  );
};

export default OutageStatusCard;