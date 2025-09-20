
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'text-primary' }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-6">
      <div className={`p-4 bg-blue-100 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};
