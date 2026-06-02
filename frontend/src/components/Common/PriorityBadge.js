const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
    medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
    high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
    critical: { color: 'bg-red-100 text-red-800', label: 'Critical' }
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

export default PriorityBadge;