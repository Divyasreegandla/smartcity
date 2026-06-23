// src/pages/billing/InvoiceDownload.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePayments } from '../../context/PaymentContext';
import Layout from '../../components/Layout/Layout';
import InvoicePreview from '../../components/Billing/InvoicePreview';
import DownloadPDFButton from '../../components/Billing/DownloadPDFButton';
import { FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const InvoiceDownload = () => {
  const { paymentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getInvoice, currentInvoice, loading } = usePayments();

  useEffect(() => {
    if (paymentId) {
      getInvoice(paymentId);
    }
  }, [paymentId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (!currentInvoice) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Invoice not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/bills/history')} className="text-gray-600 hover:text-gray-800">
              <FaArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Invoice</h1>
              <p className="text-gray-500">{currentInvoice.invoice_number}</p>
            </div>
          </div>
          <DownloadPDFButton invoiceData={currentInvoice} />
        </div>

        <InvoicePreview invoice={currentInvoice} />
      </div>
    </Layout>
  );
};

export default InvoiceDownload;