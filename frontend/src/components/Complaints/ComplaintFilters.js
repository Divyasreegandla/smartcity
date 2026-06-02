import React from 'react';

const ComplaintFilters = ({ filters, onFilterChange, onReset }) => {
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'road_damage', label: 'Road Damage' },
    { value: 'street_light_issue', label: 'Street Light' },
    { value: 'water_leakage', label: 'Water Leakage' },
    { value: 'garbage_collection', label: 'Garbage' },
    { value: 'drainage_blockage', label: 'Drainage' },
    { value: 'public_property_damage', label: 'Public Property' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search by complaint number..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {priorityOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        
        <select
          value={filters.complaint_type}
          onChange={(e) => onFilterChange('complaint_type', e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {typeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      
      {(filters.search || filters.status || filters.priority || filters.complaint_type) && (
        <div className="mt-3 text-right">
          <button
            onClick={onReset}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplaintFilters;