// src/components/Billing/DownloadPDFButton.js
import React, { useState } from 'react';
import { FaDownload, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DownloadPDFButton = ({ invoiceData, paymentId, label = 'Download PDF' }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // If we have invoice data with QR code, generate PDF
      if (invoiceData) {
        // In production, use a PDF generation library
        // For now, we'll simulate download
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create a simple text file as placeholder
        const content = `
          SMART CITY PLATFORM - INVOICE
          ================================
          Invoice: ${invoiceData.invoice_number}
          Bill: ${invoiceData.bill_number}
          Category: ${invoiceData.category}
          Amount: ₹${invoiceData.paid_amount}
          Payment Date: ${new Date(invoiceData.paid_at).toLocaleString()}
          Transaction ID: ${invoiceData.transaction_id}
          Status: ${invoiceData.payment_status}
        `;
        
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoiceData.invoice_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Invoice downloaded!');
      } else if (paymentId) {
        // Download receipt from API
        const response = await fetch(`http://localhost:8000/payments/receipt/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        const link = document.createElement('a');
        link.href = data.pdf_url || `http://localhost:8000${data.pdf_path}`;
        link.download = `receipt-${data.receipt_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Receipt downloaded!');
      }
    } catch (error) {
      toast.error('Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
    >
      {loading ? (
        <FaSpinner className="animate-spin" />
      ) : (
        <FaDownload />
      )}
      <span>{loading ? 'Generating...' : label}</span>
    </button>
  );
};

export default DownloadPDFButton;