// src/components/Billing/VerificationBadge.js
import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const VerificationBadge = ({ verified, type = 'email' }) => {
  const getConfig = () => {
    if (verified) {
      return {
        icon: FaCheckCircle,
        color: 'text-green-500',
        bg: 'bg-green-100',
        label: `Verified ${type}`,
      };
    }
    return {
      icon: FaTimesCircle,
      color: 'text-red-500',
      bg: 'bg-red-100',
      label: `Not Verified`,
    };
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${config.bg}`}>
      <Icon className={config.color} size={14} />
      <span className="text-xs font-medium text-gray-700">{config.label}</span>
    </div>
  );
};

export default VerificationBadge;