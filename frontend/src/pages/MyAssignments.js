import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyAssignments } from '../services/api';
import Layout from '../components/Layout/Layout';
import StatusBadge from '../components/Common/StatusBadge';
import PriorityBadge from '../components/Common/PriorityBadge';
import { FaBuilding, FaClock, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MyAssignments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await getMyAssignments();
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">My Assignments</h1>
          <p className="text-primary-100">Complaints assigned to your department</p>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No assignments found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{assignment.complaint_title}</h3>
                    <p className="text-xs text-gray-500">{assignment.complaint_number}</p>
                  </div>
                  <StatusBadge status={assignment.complaint_status} />
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FaBuilding className="mr-2 text-primary-500" />
                  {assignment.department_name}
                </div>
                
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <FaClock className="mr-1" />
                  Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                </div>
                
                {assignment.remarks && (
                  <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                    📝 {assignment.remarks}
                  </p>
                )}
                
                <button
                  onClick={() => navigate(`/complaints/${assignment.complaint_id}`)}
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                >
                  <FaEye />
                  <span>View Details</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyAssignments;