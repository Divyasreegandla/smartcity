// src/components/Billing/InvoicePreview.js
import React from 'react';
import { FaBuilding, FaCalendarAlt, FaRupeeSign, FaQrcode } from 'react-icons/fa';

const InvoicePreview = ({ invoice }) => {
  if (!invoice) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <FaBuilding className="text-2xl" />
              <h1 className="text-2xl font-bold">Smart City Platform</h1>
            </div>
            <p className="text-primary-200 text-sm mt-1">Government Services Department</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-primary-200">Invoice</p>
            <p className="text-lg font-bold">{invoice.invoice_number}</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Citizen Details */}
        <div className="grid grid-cols-2 gap-8 mb-6 pb-6 border-b">
          <div>
            <p className="text-xs text-gray-500 font-medium">Bill To</p>
            <p className="font-semibold text-gray-800">{invoice.citizen_name || 'Citizen'}</p>
            <p className="text-sm text-gray-600">{invoice.address || 'Address not provided'}</p>
            <p className="text-sm text-gray-600">{invoice.email || ''}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">Invoice Details</p>
            <p className="text-sm text-gray-600">Bill: {invoice.bill_number}</p>
            <p className="text-sm text-gray-600">Service: {invoice.category}</p>
            <p className="text-sm text-gray-600">Period: {invoice.bill_month}/{invoice.bill_year}</p>
            <p className="text-sm text-gray-600">Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Payment Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Amount</span>
              <span>₹{invoice.amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Late Fee</span>
              <span>₹{invoice.late_fee?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxes</span>
              <span>₹{((invoice.amount || 0) * 0.18).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>Total Paid</span>
              <span className="text-primary-600 text-lg">₹{invoice.paid_amount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-500">Payment Method</p>
            <p className="font-medium text-gray-800 capitalize">{invoice.gateway}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Transaction ID</p>
            <p className="font-medium text-gray-800 text-sm">{invoice.transaction_id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Payment Date</p>
            <p className="font-medium text-gray-800">
              {invoice.paid_at ? new Date(invoice.paid_at).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              invoice.payment_status === 'success' || invoice.payment_status === 'paid'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {invoice.payment_status}
            </span>
          </div>
        </div>

        {/* QR Code */}
        {invoice.qr_code && (
          <div className="flex justify-center items-center border-t pt-4">
            <div className="flex items-center space-x-3">
              <FaQrcode className="text-gray-400 text-3xl" />
              <div>
                <p className="text-xs text-gray-500">Verify with QR Code</p>
                <img src={invoice.qr_code} alt="QR Code" className="w-24 h-24" />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-gray-400">
            This is a system-generated invoice. For support, contact help@smartcity.gov.in
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;