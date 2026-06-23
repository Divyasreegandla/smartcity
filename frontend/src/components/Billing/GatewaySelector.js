// src/components/Billing/GatewaySelector.js
import React, { useState } from 'react';
import { FaCreditCard, FaLock, FaShieldAlt, FaCheck } from 'react-icons/fa';

const GatewaySelector = ({ onSelect, loading }) => {
  const [selected, setSelected] = useState(null);

  const gateways = [
    {
      id: 'stripe',
      name: 'Stripe',
      icon: '💳',
      description: 'Pay with credit/debit card',
      features: ['Secure', 'Fast', 'Global'],
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      icon: '🏦',
      description: 'Pay with UPI, Cards, Net Banking',
      features: ['UPI', 'Cards', 'Net Banking'],
    },
    {
      id: 'cashfree',
      name: 'Cashfree',
      icon: '💰',
      description: 'Pay with all major payment methods',
      features: ['Instant', 'Secure', 'All Methods'],
    },
  ];

  const handleSelect = (gatewayId) => {
    setSelected(gatewayId);
    onSelect(gatewayId);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Select Payment Gateway</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gateways.map((gateway) => (
          <div
            key={gateway.id}
            className={`border-2 rounded-xl p-5 cursor-pointer transition hover:shadow-md ${
              selected === gateway.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
            onClick={() => handleSelect(gateway.id)}
          >
            <div className="flex justify-between items-start">
              <span className="text-3xl">{gateway.icon}</span>
              {selected === gateway.id && (
                <span className="bg-primary-500 text-white rounded-full p-1">
                  <FaCheck className="text-xs" />
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-800 mt-2">{gateway.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{gateway.description}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {gateway.features.map((feature, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <FaLock className="text-green-500" />
          <span>256-bit encryption</span>
        </div>
        <div className="flex items-center space-x-1">
          <FaShieldAlt className="text-blue-500" />
          <span>Secure payment</span>
        </div>
        <div className="flex items-center space-x-1">
          <FaCreditCard className="text-purple-500" />
          <span>Multiple payment methods</span>
        </div>
      </div>

      {selected && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            You're about to pay using <strong>{gateways.find(g => g.id === selected)?.name}</strong>
          </p>
          <p className="text-xs text-blue-600 mt-1">You will be redirected to complete the payment</p>
        </div>
      )}
    </div>
  );
};

export default GatewaySelector;