import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWaterSchedules, createWaterSchedule, updateWaterSchedule, getWaterZones } from '../services/api';
import Layout from '../components/Layout/Layout';
import { FaPlus, FaEdit, FaCalendarAlt, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const WaterSchedules = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [schedules, setSchedules] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    zone_id: '',
    supply_date: '',
    start_time: '',
    end_time: '',
    supply_status: 'scheduled'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesRes, zonesRes] = await Promise.all([
        getWaterSchedules(),
        getWaterZones()
      ]);
      setSchedules(schedulesRes.data || []);
      setZones(zonesRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.zone_id) {
      toast.error('Please select a zone');
      return;
    }
    if (!formData.supply_date) {
      toast.error('Please select a date');
      return;
    }
    if (!formData.start_time) {
      toast.error('Please select start time');
      return;
    }
    if (!formData.end_time) {
      toast.error('Please select end time');
      return;
    }
    
    // Format the data correctly for backend
    const submitData = {
      zone_id: parseInt(formData.zone_id),
      supply_date: formData.supply_date + 'T00:00:00',  // Add time component
      start_time: formData.start_time + ':00',  // Add seconds
      end_time: formData.end_time + ':00',      // Add seconds
      supply_status: formData.supply_status
    };
    
    try {
      if (editingSchedule) {
        await updateWaterSchedule(editingSchedule.id, submitData);
        toast.success('Schedule updated successfully');
      } else {
        await createWaterSchedule(submitData);
        toast.success('Schedule created successfully');
      }
      setShowModal(false);
      setEditingSchedule(null);
      setFormData({ zone_id: '', supply_date: '', start_time: '', end_time: '', supply_status: 'scheduled' });
      fetchData();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = (schedule) => {
    // Format date for input (YYYY-MM-DD)
    const formattedDate = schedule.supply_date ? schedule.supply_date.split('T')[0] : '';
    
    setEditingSchedule(schedule);
    setFormData({
      zone_id: schedule.zone_id,
      supply_date: formattedDate,
      start_time: schedule.start_time ? schedule.start_time.substring(0, 5) : '',
      end_time: schedule.end_time ? schedule.end_time.substring(0, 5) : '',
      supply_status: schedule.supply_status || 'scheduled'
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'scheduled': return 'Scheduled';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-500">Access denied. Admin only.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Water Supply Schedules</h1>
            <p className="text-gray-500">Manage daily water supply schedules for zones</p>
          </div>
          <button
            onClick={() => { 
              setEditingSchedule(null); 
              setFormData({ zone_id: '', supply_date: '', start_time: '', end_time: '', supply_status: 'scheduled' }); 
              setShowModal(true); 
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <FaPlus />
            <span>Add Schedule</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{schedule.zone_name}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {schedule.supply_date ? new Date(schedule.supply_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{schedule.start_time || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{schedule.end_time || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(schedule.supply_status)}`}>
                        {getStatusLabel(schedule.supply_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {schedules.length === 0 && (
            <div className="text-center py-12">
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No schedules found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                value={formData.zone_id}
                onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select Zone *</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.zone_name}</option>
                ))}
              </select>
              
              <input
                type="date"
                value={formData.supply_date}
                onChange={(e) => setFormData({ ...formData, supply_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                  placeholder="Start Time"
                  required
                />
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                  placeholder="End Time"
                  required
                />
              </div>
              
              <select
                value={formData.supply_status}
                onChange={(e) => setFormData({ ...formData, supply_status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default WaterSchedules;