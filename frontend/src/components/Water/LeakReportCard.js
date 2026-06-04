import React from 'react';
import { FaMapMarkerAlt, FaUser, FaClock, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const LeakReportCard = ({ report, onUpdateStatus, isAdmin }) => {
  // Safely access properties with fallbacks
  const reportStatus = report?.status || 'reported';
  const reportLocation = report?.location || 'Location not specified';
  const reportDescription = report?.description || 'No description';
  const reporterName = report?.reported_by_name || 'Unknown';
  const createdAt = report?.created_at ? new Date(report.created_at).toLocaleString() : 'Date unknown';
  const resolvedRemarks = report?.resolved_remarks;
  const zoneName = report?.zone_name || 'Unknown Zone';
  const reportId = report?.id || '';

  const getStatusColor = (status) => {
    switch(status) {
      case 'reported': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'reported': return 'Reported';
      case 'under_review': return 'Under Review';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (onUpdateStatus) {
      onUpdateStatus(reportId, newStatus, reportStatus);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-gray-500">Report #{reportId}</p>
          <p className="text-sm font-medium text-gray-800">{zoneName}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(reportStatus)}`}>
          {getStatusLabel(reportStatus)}
        </span>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-start text-sm text-gray-600">
          <FaMapMarkerAlt className="mr-2 text-primary-500 mt-0.5 flex-shrink-0" />
          <span>{reportLocation}</span>
        </div>
        <p className="text-sm text-gray-600 pl-6">{reportDescription}</p>
        <div className="flex items-center text-xs text-gray-500 pl-6">
          <FaUser className="mr-1 flex-shrink-0" />
          <span>Reported by: {reporterName}</span>
        </div>
        <div className="flex items-center text-xs text-gray-500 pl-6">
          <FaClock className="mr-1 flex-shrink-0" />
          <span>{createdAt}</span>
        </div>
      </div>
      
      {resolvedRemarks && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
          <strong>Resolution:</strong> {resolvedRemarks}
        </div>
      )}
      
      {isAdmin && reportStatus !== 'resolved' && (
        <div className="pt-3 border-t">
          <select
            value={reportStatus}
            onChange={handleStatusChange}
            className="w-full px-3 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="reported">Reported</option>
            <option value="under_review">Under Review</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default LeakReportCard;