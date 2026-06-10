import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSanitationWorkers, createSanitationWorker, updateSanitationWorker } from '../services/api';
import Layout from '../components/Layout/Layout';
import WorkerCard from '../components/Waste/WorkerCard';
import { FaPlus, FaSearch, FaUsers, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

const SanitationWorkerManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [formData, setFormData] = useState({
    employee_code: '',
    full_name: '',
    phone: '',
    assigned_area: '',
    shift_type: 'morning',
    status: 'active'
  });

  useEffect(() => {
    fetchWorkers();
  }, [statusFilter, shiftFilter]);

  const fetchWorkers = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (shiftFilter) params.shift_type = shiftFilter;
      const response = await getSanitationWorkers(params);
      setWorkers(response.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        await updateSanitationWorker(editingWorker.id, formData);
        toast.success('Worker updated successfully');
      } else {
        await createSanitationWorker(formData);
        toast.success('Worker added successfully');
      }
      setShowModal(false);
      setEditingWorker(null);
      setFormData({ employee_code: '', full_name: '', phone: '', assigned_area: '', shift_type: 'morning', status: 'active' });
      fetchWorkers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      employee_code: worker.employee_code,
      full_name: worker.full_name,
      phone: worker.phone,
      assigned_area: worker.assigned_area,
      shift_type: worker.shift_type,
      status: worker.status
    });
    setShowModal(true);
  };

  const filteredWorkers = workers.filter(worker =>
    worker.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.assigned_area?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sanitation Worker Management</h1>
            <p className="text-gray-500">Manage sanitation workers, shifts, and assigned areas</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditingWorker(null); setFormData({ employee_code: '', full_name: '', phone: '', assigned_area: '', shift_type: 'morning', status: 'active' }); setShowModal(true); }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FaPlus />
              <span>Add Worker</span>
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FaFilter className="text-gray-500" />
            <span className="font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, code, or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Shifts</option>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </div>
        </div>

        {/* Workers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onEdit={isAdmin ? handleEdit : null}
              isAdmin={isAdmin}
            />
          ))}
        </div>

        {filteredWorkers.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No sanitation workers found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingWorker ? 'Edit Worker' : 'Add Worker'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Employee Code *"
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Full Name *"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Assigned Area *"
                value={formData.assigned_area}
                onChange={(e) => setFormData({ ...formData, assigned_area: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <select
                value={formData.shift_type}
                onChange={(e) => setFormData({ ...formData, shift_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="morning">Morning Shift</option>
                <option value="evening">Evening Shift</option>
                <option value="night">Night Shift</option>
              </select>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
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

export default SanitationWorkerManagement;