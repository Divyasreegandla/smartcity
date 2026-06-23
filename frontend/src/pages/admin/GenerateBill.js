// src/pages/admin/GenerateBill.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCitizens, generateBill } from '../../services/api';
import Layout from '../../components/Layout/Layout';
import { 
  FaPlus, 
  FaUser, 
  FaFileInvoice, 
  FaCalendarAlt, 
  FaArrowLeft,
  FaExclamationTriangle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const GenerateBill = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    citizen_id: '',
    category_id: '1',
    bill_month: new Date().getMonth() + 1,
    bill_year: new Date().getFullYear(),
    due_date: '',  // ✅ Keep as empty string, not a Date object
    amount: '',
    late_fee: '0'
  });

  const categories = [
    { id: 1, name: 'Electricity' },
    { id: 2, name: 'Water' },
    { id: 3, name: 'Property Tax' },
    { id: 4, name: 'Fiber Internet' },
    { id: 5, name: 'Waste Management' }
  ];

  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    setFetching(true);
    try {
      const response = await getCitizens();
      let citizensData = [];
      if (response.data && Array.isArray(response.data)) {
        citizensData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        citizensData = response.data.data;
      } else if (Array.isArray(response)) {
        citizensData = response;
      }
      setCitizens(citizensData);
      
      if (citizensData.length === 0) {
        toast.info('No citizens found. Please register a citizen first.', { duration: 5000 });
      }
    } catch (error) {
      let errorMsg = 'Failed to fetch citizens';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          errorMsg = detail[0]?.msg || detail[0]?.message || 'Validation error';
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      toast.error(errorMsg);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validate form
    if (!formData.citizen_id) {
      toast.error('Please select a citizen');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // ✅ Build due_date properly
      let dueDate = formData.due_date;
      if (!dueDate) {
        // If no due date provided, set to 30 days from now
        const date = new Date();
        date.setDate(date.getDate() + 30);
        dueDate = date.toISOString();
      } else {
        // Convert YYYY-MM-DD to ISO string
        dueDate = new Date(dueDate).toISOString();
      }

      const data = {
        citizen_id: parseInt(formData.citizen_id),
        category_id: parseInt(formData.category_id),
        bill_month: parseInt(formData.bill_month),
        bill_year: parseInt(formData.bill_year),
        due_date: dueDate,
        amount: parseFloat(formData.amount),
        late_fee: parseFloat(formData.late_fee) || 0
      };

      const response = await generateBill(data);
      toast.success('Bill generated successfully!');
      
      // ✅ Reset form
      setFormData({
        citizen_id: '',
        category_id: '1',
        bill_month: new Date().getMonth() + 1,
        bill_year: new Date().getFullYear(),
        due_date: '',
        amount: '',
        late_fee: '0'
      });
      
      fetchCitizens();
    } catch (error) {
      let errorMsg = 'Failed to generate bill';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          errorMsg = detail[0]?.msg || detail[0]?.message || 'Validation error';
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/bills')} className="text-gray-600 hover:text-gray-800">
            <FaArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Generate Bill</h1>
            <p className="text-gray-500">Create new utility bills for citizens</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Citizen Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Citizen *</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <select
                  name="citizen_id"
                  value={formData.citizen_id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                  disabled={fetching}
                >
                  <option value="">{fetching ? 'Loading citizens...' : 'Select a citizen'}</option>
                  {citizens.map((citizen) => (
                    <option key={citizen.user_id || citizen.id} value={citizen.user_id || citizen.id}>
                      {citizen.user?.full_name || citizen.full_name || 'Unknown'} - {citizen.user?.email || citizen.email || 'No email'}
                    </option>
                  ))}
                </select>
              </div>
              {citizens.length === 0 && !fetching && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2">
                  <FaExclamationTriangle className="text-yellow-500" />
                  <p className="text-sm text-yellow-700">
                    No citizens found. 
                    <button 
                      onClick={() => navigate('/register')}
                      className="ml-2 text-yellow-800 font-semibold hover:underline"
                    >
                      Register a citizen
                    </button>
                  </p>
                </div>
              )}
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Category *</label>
              <div className="relative">
                <FaFileInvoice className="absolute left-3 top-3 text-gray-400" />
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Month & Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                <select
                  name="bill_month"
                  value={formData.bill_month}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                <select
                  name="bill_year"
                  value={formData.bill_year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date & Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Leave empty for 30 days from now</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="e.g., 1500"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            {/* Late Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Late Fee (₹)</label>
              <input
                type="number"
                name="late_fee"
                value={formData.late_fee}
                onChange={handleChange}
                placeholder="e.g., 100"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                min="0"
                step="0.01"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || citizens.length === 0}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
            >
              <FaPlus />
              <span>{loading ? 'Generating...' : 'Generate Bill'}</span>
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default GenerateBill;