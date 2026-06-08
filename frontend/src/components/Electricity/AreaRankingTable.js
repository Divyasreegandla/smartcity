import React from 'react';
import { FaTrophy } from 'react-icons/fa';

const AreaRankingTable = ({ rankings }) => {
  const getMedalColor = (index) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-orange-500';
    return 'text-gray-300';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Top Consuming Areas</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {rankings.map((area, index) => (
          <div key={area.area} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 text-center">
                {index < 3 ? (
                  <FaTrophy className={`${getMedalColor(index)} text-lg mx-auto`} />
                ) : (
                  <span className="text-gray-400 font-medium">{index + 1}</span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">{area.area}</p>
                <p className="text-xs text-gray-500">{area.records || 0} records</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">{area.units_consumed.toLocaleString()} kWh</p>
              <p className="text-xs text-gray-500">Peak: {area.avg_peak_load?.toFixed(0) || 0} MW</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AreaRankingTable;