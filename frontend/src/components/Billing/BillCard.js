// src/components/Billing/BillCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaRupeeSign, FaEye, FaCreditCard } from 'react-icons/fa';

const BillCard = ({ bill, selectable = false, isSelected = false, onSelect }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Electricity': '⚡',
      'Water': '💧',
      'Property Tax': '🏠',
      'Fiber Internet': '🌐',
      'Waste Management': '♻️'
    };
    return icons[categoryName] || '📄';
  };

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition ${selectable ? 'cursor-pointer' : ''}`}>
      {selectable && (
        <div className="px-4 py-2 bg-gray-50 border-b flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-600">Select bill</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getCategoryIcon(bill.category_name)}</span>
            <div>
              <h3 className="font-semibold text-gray-800">{bill.category_name}</h3>
              <p className="text-xs text-gray-500">{bill.bill_number}</p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(bill.bill_status)}`}>
            {bill.bill_status}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <FaCalendarAlt className="mr-2 text-gray-400" />
            <span>Due: {new Date(bill.due_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaRupeeSign className="mr-2 text-gray-400" />
            <span className="font-bold text-lg text-primary-600">₹{bill.total_amount?.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-500">
            {bill.bill_month}/{bill.bill_year}
          </div>
        </div>

        <div className="flex mt-4 pt-3 border-t space-x-2">
          <button
            onClick={() => navigate(`/bills/${bill.id}`)}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition"
          >
            <FaEye className="text-xs" />
            <span>View Details</span>
          </button>
          {bill.bill_status !== 'paid' && (
            <button
              onClick={() => navigate('/payment-gateway', { state: { billIds: [bill.id] } })}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <FaCreditCard className="text-xs" />
              <span>Pay</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillCard;