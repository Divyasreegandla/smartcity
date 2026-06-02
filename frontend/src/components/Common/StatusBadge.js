const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    assigned: { color: 'bg-blue-100 text-blue-800', label: 'Assigned' },
    in_progress: { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
    resolved: { color: 'bg-green-100 text-green-800', label: 'Resolved' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;