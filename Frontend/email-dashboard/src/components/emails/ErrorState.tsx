import React from 'react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md shadow-xl">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button 
          onClick={onRetry}
          className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorState;