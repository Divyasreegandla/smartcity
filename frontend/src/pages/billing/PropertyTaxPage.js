// src/pages/billing/PropertyTaxPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBills } from '../../context/BillContext';
import Layout from '../../components/Layout/Layout';
import { FaArrowLeft, FaBuilding, FaCalculator, FaFileInvoice } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PropertyTaxPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { propertyTaxBills, fetchPropertyTaxBills, calculatePropertyTax, loading } = useBills();
  
  const [propertyValue, setPropertyValue] = useState('');
  const [propertyType, setPropertyType] = useState('residential');
  const [calculationResult, setCalculationResult] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    fetchPropertyTaxBills();
  }, []);

  const handleCalculate = async () => {
    if (!propertyValue || parseFloat(propertyValue) <= 0) {
      toast.error('Please enter a valid property value');
      return;
    }
    try {
      const result = await calculatePropertyTax(parseFloat(propertyValue), propertyType);
      setCalculationResult(result);
    } catch (error) {
      toast.error('Failed to calculate property tax');
    }
  };

  const propertyTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'agricultural', label: 'Agricultural' },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/bills')} className="text-gray-600 hover:text-gray-800">
            <FaArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Property Tax</h1>
            <p className="text-gray-500">Calculate and pay your property tax</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition"
          >
            <FaCalculator className="text-primary-500 text-3xl mx-auto mb-2" />
            <p className="font-semibold text-gray-800">Calculate Tax</p>
            <p className="text-sm text-gray-500">Estimate your property tax</p>
          </button>
          <button
            onClick={() => navigate('/bills/pending')}
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition"
          >
            <FaFileInvoice className="text-green-500 text-3xl mx-auto mb-2" />
            <p className="font-semibold text-gray-800">Pay Property Tax</p>
            <p className="text-sm text-gray-500">View and pay your tax bills</p>
          </button>
        </div>

        {/* Calculator */}
        {showCalculator && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Property Tax Calculator</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Value (₹)</label>
                <input
                  type="number"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                  placeholder="Enter property value"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                onClick={handleCalculate}
                className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Calculate Tax
              </button>

              {calculationResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Tax Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property Value</span>
                      <span>₹{calculationResult.property_value?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax Rate ({calculationResult.tax_rate}%)</span>
                      <span>₹{calculationResult.base_tax?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cess (2%)</span>
                      <span>₹{calculationResult.cess?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Charge (1%)</span>
                      <span>₹{calculationResult.service_charge?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span>Total Tax</span>
                      <span className="text-primary-600">₹{calculationResult.total_tax?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Property Tax Bills */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Your Property Tax Bills</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {propertyTaxBills.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FaBuilding className="text-4xl text-gray-300 mx-auto mb-2" />
                <p>No property tax bills found</p>
              </div>
            ) : (
              propertyTaxBills.map((bill) => (
                <div key={bill.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-800">{bill.bill_number}</p>
                    <p className="text-sm text-gray-500">
                      Month: {bill.bill_month}/{bill.bill_year}
                    </p>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(bill.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">₹{bill.total_amount?.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      bill.bill_status === 'paid' ? 'bg-green-100 text-green-800' :
                      bill.bill_status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bill.bill_status}
                    </span>
                    {bill.bill_status !== 'paid' && (
                      <button
                        onClick={() => navigate('/payment-gateway', { state: { billIds: [bill.id] } })}
                        className="block mt-1 text-sm text-primary-600 hover:text-primary-700"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyTaxPage;