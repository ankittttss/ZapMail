'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardHeader from '../components/emails/DashboardHeader';
import FilterPanel from '../components/emails/FilterPanel';
import EmailList from '../components/emails/EmailList';
import PaginationControls from '../components/emails/PaginationControl';
import LoadingState from '../components/emails/LoadingSpinner';
import ErrorState from '../components/emails/ErrorState';
import { Email, Pagination, FilterState } from '../types/email';
import { fetchEmails, searchEmails } from '../services/emailService';
import axios from 'axios';

const EmailsPage = () => {
  const [allEmails, setAllEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleCategorise = async (id: string) => {
  await axios.get(`http://localhost:5000/app/categorise/${id}`);
 window.location.reload();

};

  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    toAccount: 'all',
    category: 'all'
  });

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Check if any filters are active
  const hasActiveFilters = 
    debouncedSearchTerm.trim() !== '' || 
    filters.toAccount !== 'all' || 
    filters.category !== 'all';

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [filters.searchTerm]);

  // Load emails when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page
    if (hasActiveFilters) {
      performSearch();
    } else {
      loadAllEmails();
    }
  }, [debouncedSearchTerm, filters.toAccount, filters.category]);

  const loadAllEmails = async () => {
    try {
      setLoading(true);
      // Fetch with a large limit to get all emails at once
      // Or implement proper backend pagination
      const result = await fetchEmails(1, 1000);
      setAllEmails(result.data || []);
      setError(null);
      console.log('All emails loaded:', result.data?.length);
    } catch (err) {
      setError('Failed to load emails');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      
      // Build search filters
      const searchFilters: Record<string, string> = {};
      
      if (debouncedSearchTerm.trim()) {
        searchFilters.subject = debouncedSearchTerm.trim();
      }
      
      if (filters.toAccount !== 'all') {
        searchFilters.to = filters.toAccount;
      }
      
      if (filters.category !== 'all') {
        searchFilters.category = filters.category;
      }

      const result = await searchEmails(searchFilters);
      
      if (result.success && result.emails) {
        setAllEmails(result.emails);
        console.log('Search results:', result.emails.length);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to search emails');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side pagination
  const paginatedEmails = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allEmails.slice(startIndex, endIndex);
  }, [allEmails, currentPage, itemsPerPage]);

  // Calculate pagination info
  const pagination: Pagination = useMemo(() => {
    const totalPages = Math.ceil(allEmails.length / itemsPerPage);
    return {
      currentPage,
      totalPages,
      totalItems: allEmails.length,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [allEmails.length, currentPage, itemsPerPage]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      toAccount: 'all',
      category: 'all'
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  if (loading && allEmails.length === 0) return <LoadingState />;
  if (error) return (
    <ErrorState 
      error={error} 
      onRetry={() => hasActiveFilters ? performSearch() : loadAllEmails()} 
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader totalEmails={allEmails.length} />
      
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading indicator for search */}
        {loading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">Searching...</p>
          </div>
        )}

        {/* Search results indicator */}
        {hasActiveFilters && !loading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Found {allEmails.length} result{allEmails.length !== 1 ? 's' : ''} across entire database
            </p>
          </div>
        )}

        <EmailList 
          emails={paginatedEmails}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          onCategorise={handleCategorise}
        />

        {/* Always show pagination */}
        {allEmails.length > 0 && (
          <PaginationControls
            pagination={pagination}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onPrevPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            onNextPage={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
          />
        )}
      </div>
    </div>
  );
};

export default EmailsPage;