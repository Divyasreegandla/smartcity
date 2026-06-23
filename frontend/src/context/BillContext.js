// src/context/BillContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import billService from '../services/billService';

const BillContext = createContext();

export const useBills = () => useContext(BillContext);

export const BillProvider = ({ children }) => {
  const [bills, setBills] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [billHistory, setBillHistory] = useState([]);
  const [propertyTaxBills, setPropertyTaxBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPendingAmount, setTotalPendingAmount] = useState(0);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const data = await billService.getBills();
      setBills(data);
      return data;
    } catch (error) {
      toast.error('Failed to fetch bills');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingBills = useCallback(async () => {
    setLoading(true);
    try {
      const data = await billService.getPendingBills();
      setPendingBills(data);
      const total = data.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
      setTotalPendingAmount(total);
      return data;
    } catch (error) {
      toast.error('Failed to fetch pending bills');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBillHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await billService.getBillHistory();
      setBillHistory(data);
      return data;
    } catch (error) {
      toast.error('Failed to fetch bill history');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPropertyTaxBills = useCallback(async () => {
    setLoading(true);
    try {
      const data = await billService.getPropertyTaxBills();
      setPropertyTaxBills(data);
      return data;
    } catch (error) {
      toast.error('Failed to fetch property tax bills');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBillById = useCallback(async (billId) => {
    try {
      return await billService.getBillById(billId);
    } catch (error) {
      toast.error('Failed to fetch bill details');
      throw error;
    }
  }, []);

  const calculatePropertyTax = useCallback(async (propertyValue, propertyType) => {
    try {
      return await billService.calculatePropertyTax(propertyValue, propertyType);
    } catch (error) {
      toast.error('Failed to calculate property tax');
      throw error;
    }
  }, []);

  return (
    <BillContext.Provider
      value={{
        bills,
        pendingBills,
        billHistory,
        propertyTaxBills,
        loading,
        totalPendingAmount,
        fetchBills,
        fetchPendingBills,
        fetchBillHistory,
        fetchPropertyTaxBills,
        getBillById,
        calculatePropertyTax,
      }}
    >
      {children}
    </BillContext.Provider>
  );
};