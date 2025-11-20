import React from 'react';
import { Mail } from 'lucide-react';

interface DashboardHeaderProps {
  totalEmails: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ totalEmails }) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Email Dashboard</h1>
            <p className="text-gray-600">Manage and organize your emails efficiently</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-blue-600">{totalEmails}</span>
                <span className="text-gray-600 text-sm">emails</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

