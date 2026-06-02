import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getComplaintById, 
  getComplaintHistory, 
  updateComplaintStatus, 
  getDepartments, 
  assignComplaint,
  getComplaintAssignments 
} from '../services/api';
import Layout from '../components/Layout/Layout';
import StatusBadge from '../components/Common/StatusBadge';
import PriorityBadge from '../components/Common/PriorityBadge';
import { FaArrowLeft, FaHistory, FaCheck, FaSpinner, FaBuilding, FaUser, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', remarks: '' });
  const [assignment, setAssignment] = useState({ department_id: '', remarks: '' });

  useEffect(() => {
    fetchData();
    fetchAssignments();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [complaintRes, historyRes, deptRes] = await Promise.all([
        getComplaintById(id),
        getComplaintHistory(id),
        getDepartments().catch(() => ({ data: [] }))
      ]);
      setComplaint(complaintRes.data);
      setHistory(historyRes.data);
      setDepartments(deptRes.data);
    } catch (error) {
      toast.error('Failed to load complaint details');
      navigate('/complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await getComplaintAssignments(id);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate.status) {
      toast.error('Please select a status');
      return;
    }
    try {
      await updateComplaintStatus(id, { status: statusUpdate.status, remarks: statusUpdate.remarks });
      toast.success('Status updated successfully');
      setShowStatusModal(false);
      setStatusUpdate({ status: '', remarks: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAssignComplaint = async () => {
    if (!assignment.department_id) {
      toast.error('Please select a department');
      return;
    }
    try {
      await assignComplaint({
        complaint_id: parseInt(id),
        department_id: parseInt(assignment.department_id),
        remarks: assignment.remarks
      });
      toast.success('Complaint assigned successfully');
      setShowAssignModal(false);
      setAssignment({ department_id: '', remarks: '' });
      fetchAssignments();
      fetchData();
    } catch (error) {
      toast.error('Failed to assign complaint');
    }
  };

  const getComplaintTypeLabel = (type) => {
    const types = {
      road_damage: 'Road Damage',
      street_light_issue: 'Street Light Issue',
      water_leakage: 'Water Leakage',
      garbage_collection: 'Garbage Collection',
      drainage_blockage: 'Drainage Blockage',
      public_property_damage: 'Public Property Damage',
      other: 'Other'
    };
    return types[type] || type;
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/complaints')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <FaArrowLeft />
          <span>Back to Complaints</span>
        </button>

        {/* Complaint Details */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{complaint.title}</h1>
              <p className="text-sm text-gray-500">{complaint.complaint_number}</p>
            </div>
            <div className="flex space-x-2">
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Description</h3>
              <p className="text-gray-700">{complaint.description}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Location</h3>
              <p className="text-gray-700">{complaint.location}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Complaint Type</h3>
                <p className="text-gray-700">{getComplaintTypeLabel(complaint.complaint_type)}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Submitted By</h3>
                <p className="text-gray-700">{complaint.citizen_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Submitted On</h3>
                <p className="text-gray-700">{new Date(complaint.created_at).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Last Updated</h3>
                <p className="text-gray-700">{new Date(complaint.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Information */}
        {assignments.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <FaBuilding className="mr-2" />
                Assignment Details
              </h2>
            </div>
            <div className="p-6">
              {assignments.map((assignment, idx) => (
                <div key={idx} className="border-l-4 border-primary-500 pl-4 py-3 mb-3 last:mb-0">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <p className="text-sm font-semibold text-gray-800">
                      Assigned to: {assignment.department_name}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <FaClock className="mr-1" size={12} />
                      {new Date(assignment.assigned_at).toLocaleString()}
                    </p>
                  </div>
                  {assignment.assigned_to_name && (
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <FaUser className="mr-2 text-gray-400" size={12} />
                      Assigned to person: {assignment.assigned_to_name}
                    </p>
                  )}
                  {assignment.assigned_by_name && (
                    <p className="text-sm text-gray-500 mt-1">
                      Assigned by: {assignment.assigned_by_name}
                    </p>
                  )}
                  {assignment.remarks && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                      📝 {assignment.remarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Actions */}
        {user?.role === 'admin' && complaint.status !== 'resolved' && (
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FaBuilding />
              <span>Assign to Department</span>
            </button>
            <button
              onClick={() => setShowStatusModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FaCheck />
              <span>Update Status</span>
            </button>
          </div>
        )}

        {/* Status History */}
        {history.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <FaHistory className="mr-2" />
                Status History
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <FaSpinner className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-medium">Status changed from</span>
                        <StatusBadge status={item.old_status} />
                        <span>to</span>
                        <StatusBadge status={item.new_status} />
                      </div>
                      {item.remarks && <p className="text-sm text-gray-600 mt-1">{item.remarks}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        By {item.updated_by} on {new Date(item.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Update Status</h2>
            <select
              value={statusUpdate.status}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-3"
            >
              <option value="">Select status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <textarea
              placeholder="Remarks (optional)"
              value={statusUpdate.remarks}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, remarks: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-4"
              rows="3"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowStatusModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleStatusUpdate} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Assign to Department</h2>
            <select
              value={assignment.department_id}
              onChange={(e) => setAssignment({ ...assignment, department_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-3"
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.department_name}</option>
              ))}
            </select>
            <textarea
              placeholder="Remarks (optional)"
              value={assignment.remarks}
              onChange={(e) => setAssignment({ ...assignment, remarks: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-4"
              rows="3"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleAssignComplaint} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Assign</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ComplaintDetails;