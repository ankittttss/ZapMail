import React from 'react';

interface EmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasActiveFilters, onClearFilters }) => {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="text-6xl mb-4">📭</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No emails found</h3>
      <p className="text-gray-500">
        {hasActiveFilters
          ? 'Try adjusting your filters or search terms'
          : 'No emails to display'}
      </p>
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default EmptyState;
