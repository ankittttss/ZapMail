import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination } from '../../types/email';

interface PaginationControlsProps {
  pagination: Pagination;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  currentPage,
  itemsPerPage,
  onPageChange,
  onPrevPage,
  onNextPage
}) => {
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const totalPages = pagination.totalPages;
    const current = pagination.currentPage;
    
    pages.push(1);
    
    for (let i = Math.max(2, current - 2); i <= Math.min(totalPages - 1, current + 2); i++) {
      pages.push(i);
    }
    
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
          <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, pagination.totalItems)}</span> of{' '}
          <span className="font-semibold text-gray-900">{pagination.totalItems}</span> emails
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevPage}
            disabled={!pagination.hasPrevPage}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex gap-1">
            {getPageNumbers().map((pageNum, idx, arr) => (
              <React.Fragment key={pageNum}>
                {idx > 0 && arr[idx - 1] !== pageNum - 1 && (
                  <span className="px-2 py-2 text-gray-400">...</span>
                )}
                <button
                  onClick={() => onPageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={onNextPage}
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;