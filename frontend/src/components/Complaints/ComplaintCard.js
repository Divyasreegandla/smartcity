import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../Common/StatusBadge';
import PriorityBadge from '../Common/PriorityBadge';
import { FaMapMarkerAlt, FaCalendarAlt, FaEye } from 'react-icons/fa';

const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();

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

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{complaint.title}</h3>
          <p className="text-xs text-gray-500">{complaint.complaint_number}</p>
        </div>
        <div className="flex space-x-2">
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{complaint.description}</p>
      
      <div className="flex items-center text-xs text-gray-500 mb-2">
        <FaMapMarkerAlt className="mr-1" />
        {complaint.location}
      </div>
      
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <FaCalendarAlt className="mr-1" />
        {new Date(complaint.created_at).toLocaleDateString()}
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{getComplaintTypeLabel(complaint.complaint_type)}</span>
        <button
          onClick={() => navigate(`/complaints/${complaint.id}`)}
          className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
        >
          <FaEye />
          <span>View Details</span>
        </button>
      </div>
    </div>
  );
};

export default ComplaintCard;