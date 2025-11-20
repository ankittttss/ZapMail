import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { FilterState } from "../../types/email";
import {
  TO_ACCOUNTS,
  CATEGORIES,
  ITEMS_PER_PAGE_OPTIONS,
} from "../../constants/emailConstant";

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  itemsPerPage: number;
  onItemsPerPageChange: (limit: number) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  itemsPerPage,
  onItemsPerPageChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = [
    filters.toAccount !== "all",
    filters.category !== "all",
    filters.searchTerm.trim() !== "",
  ].filter(Boolean).length;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by subject or sender..."
                value={filters.searchTerm}
                onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-black-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm text-black placeholder:text-black"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 font-medium transition-colors shadow-sm bg-black"
            >
              <Filter className="w-5 h-5 text-black" />
              <div className="text-black">Filters</div>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Items Per Page */}
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm bg-white text-black"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} per page
                </option>
              ))}
            </select>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm bg-black">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filter Emails</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={onClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium text-black"
                  >
                    <X className="w-4 h-4" />
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* To Account Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Account
                  </label>
                  <select
                    value={filters.toAccount}
                    onChange={(e) =>
                      onFilterChange({ toAccount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-black"
                  >
                    {TO_ACCOUNTS.map((account) => (
                      <option key={account.value} value={account.value}>
                        {account.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      onFilterChange({ category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-black"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
