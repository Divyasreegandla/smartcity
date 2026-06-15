import React from 'react';
import { FaCar, FaMapMarkerAlt, FaCalendarAlt, FaRupeeSign, FaCheckCircle } from 'react-icons/fa';

const ViolationCard = ({ violation, onUpdatePayment, isAdmin }) => {
  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getViolationTypeLabel = (type) => {
    const types = {
      speeding: '🚗 Speeding',
      red_light: '🔴 Red Light Jump',
      wrong_way: '⬅️ Wrong Way',
      no_helmet: '🪖 No Helmet',
      no_seatbelt: '🪑 No Seatbelt',
      illegal_parking: '🚫 Illegal Parking',
      other: '📌 Other'
    };
    return types[type] || type;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-gray-500">{violation.violation_number}</p>
          <div className="flex items-center space-x-2 mt-1">
            <FaCar className="text-primary-500" />
            <h3 className="font-semibold text-gray-800">{violation.vehicle_number}</h3>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPaymentStatusColor(violation.payment_status)}`}>
          {violation.payment_status}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">{getViolationTypeLabel(violation.violation_type)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaMapMarkerAlt className="mr-2 text-primary-500" />
          <span>{violation.location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaCalendarAlt className="mr-2 text-primary-500" />
          <span>{new Date(violation.violation_date).toLocaleString()}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 font-bold">
          <FaRupeeSign className="mr-2 text-primary-500" />
          <span>Fine: ₹{violation.fine_amount?.toLocaleString()}</span>
        </div>
      </div>
      
      {isAdmin && violation.payment_status !== 'paid' && (
        <div className="pt-3 border-t">
          <button
            onClick={() => onUpdatePayment?.(violation.id, 'paid')}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FaCheckCircle />
            <span>Mark as Paid</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ViolationCard;