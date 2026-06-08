import React from 'react';
import { FaChartLine } from 'react-icons/fa';

const ConsumptionChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.units_consumed || 0), 1);
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <FaChartLine className="text-primary-500" />
      </div>
      
      <div className="flex items-end justify-between h-48 space-x-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-primary-500 rounded-t-lg transition-all duration-500 hover:bg-primary-600"
              style={{ height: `${(item.units_consumed / maxValue) * 100}%`, minHeight: '4px' }}
            ></div>
            <p className="text-xs text-gray-500 mt-2">{item.day || item.date?.split('-')[2]}</p>
            <p className="text-sm font-semibold text-gray-700">
              {(item.units_consumed / 1000).toFixed(1)}k
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsumptionChart;