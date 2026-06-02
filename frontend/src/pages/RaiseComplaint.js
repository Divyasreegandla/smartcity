import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createComplaint, uploadComplaintImage } from '../services/api';
import Layout from '../components/Layout/Layout';
import FileUpload from '../components/Common/FileUpload';
import { FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RaiseComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    complaint_type: '',
    title: '',
    description: '',
    location: '',
    priority: 'medium'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});

  const complaintTypes = [
    { value: 'road_damage', label: 'Road Damage' },
    { value: 'street_light_issue', label: 'Street Light Issue' },
    { value: 'water_leakage', label: 'Water Leakage' },
    { value: 'garbage_collection', label: 'Garbage Collection' },
    { value: 'drainage_blockage', label: 'Drainage Blockage' },
    { value: 'public_property_damage', label: 'Public Property Damage' },
    { value: 'other', label: 'Other' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.complaint_type) newErrors.complaint_type = 'Complaint type required';
    if (!formData.title || formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!formData.description || formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (!formData.location) newErrors.location = 'Location required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await createComplaint(formData);
      const complaintId = response.data.id;
      
      if (selectedFile) {
        await uploadComplaintImage(complaintId, selectedFile);
        toast.success('Complaint raised with image!');
      } else {
        toast.success('Complaint raised successfully!');
      }
      
      navigate('/complaints');
    } catch (error) {
      console.error('Error:', error);
      // Extract error message properly
      let errorMsg = 'Failed to raise complaint';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail) && detail[0]?.msg) {
          errorMsg = detail[0].msg;
        } else if (typeof detail === 'object') {
          errorMsg = 'Validation error occurred';
        }
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/complaints')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <FaArrowLeft />
          <span>Back to Complaints</span>
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-4">
            <h1 className="text-xl font-bold text-white">Raise a Complaint</h1>
            <p className="text-primary-100 text-sm">Fill in the details below to register your complaint</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1">Complaint Type *</label>
              <select
                name="complaint_type"
                value={formData.complaint_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select complaint type</option>
                {complaintTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.complaint_type && <p className="text-red-500 text-xs mt-1">{errors.complaint_type}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief summary of the issue"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Detailed description of the problem"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Address or landmark"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {priorityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Upload Image (Optional)</label>
              <FileUpload
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
                onRemove={() => setSelectedFile(null)}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <FaPaperPlane />
              <span>{loading ? 'Submitting...' : 'Submit Complaint'}</span>
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RaiseComplaint;