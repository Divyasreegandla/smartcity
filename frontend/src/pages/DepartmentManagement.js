import React, { useState, useEffect } from 'react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../services/api';
import Layout from '../components/Layout/Layout';
import ProtectedRoute from '../components/Common/ProtectedRoute';
import { FaPlus, FaEdit, FaTrash, FaBuilding } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    department_name: '',
    department_head: '',
    contact_number: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      setDepartments(response.data);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, formData);
        toast.success('Department updated');
      } else {
        await createDepartment(formData);
        toast.success('Department created');
      }
      setShowModal(false);
      setEditingDept(null);
      setFormData({ department_name: '', department_head: '', contact_number: '' });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
        toast.success('Department deleted');
        fetchDepartments();
      } catch (error) {
        toast.error('Failed to delete department');
      }
    }
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      department_name: dept.department_name,
      department_head: dept.department_head || '',
      contact_number: dept.contact_number || ''
    });
    setShowModal(true);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Department Management</h1>
            <p className="text-gray-500">Manage city departments for complaint assignment</p>
          </div>
          <button
            onClick={() => { setEditingDept(null); setFormData({ department_name: '', department_head: '', contact_number: '' }); setShowModal(true); }}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <FaPlus />
            <span>Add Department</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaBuilding className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{dept.department_name}</h3>
                    <p className="text-xs text-gray-500">ID: {dept.id}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(dept)} className="text-blue-600 hover:text-blue-800">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(dept.id)} className="text-red-600 hover:text-red-800">
                    <FaTrash />
                  </button>
                </div>
              </div>
              {dept.department_head && (
                <p className="text-sm text-gray-600"><span className="font-medium">Head:</span> {dept.department_head}</p>
              )}
              {dept.contact_number && (
                <p className="text-sm text-gray-600"><span className="font-medium">Contact:</span> {dept.contact_number}</p>
              )}
            </div>
          ))}
        </div>

        {departments.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No departments found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingDept ? 'Edit Department' : 'Add Department'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Department Name *"
                value={formData.department_name}
                onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Department Head"
                value={formData.department_head}
                onChange={(e) => setFormData({ ...formData, department_head: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
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

export default () => (
  <ProtectedRoute adminOnly>
    <DepartmentManagement />
  </ProtectedRoute>
);