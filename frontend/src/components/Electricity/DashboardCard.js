import React from 'react';

const DashboardCard = ({ title, value, icon, color, trend }) => {
  const getColorClasses = () => {
    switch(color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      case 'purple': return 'bg-purple-500';
      case 'orange': return 'bg-orange-500';
      default: return 'bg-primary-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`${getColorClasses()} p-3 rounded-lg text-white`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-semibold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

export default DashboardCard;