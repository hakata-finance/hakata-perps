'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  loading?: boolean;
}

/**
 * Pagination component for navigating through paginated data
 * Provides previous/next buttons and page number indicators
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  loading = false
}) => {
  // Don't render if there's only one page or no items
  if (totalPages <= 1) {
    return null;
  }

  // Calculate the range of items being displayed
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Maximum number of page buttons to show
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      // Adjust range if we're near the beginning or end
      if (currentPage <= 3) {
        endPage = Math.min(5, totalPages);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
      }
      
      // Add first page if not included
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      // Add pages in range
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add last page if not included
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1 && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-[#121212] border-t border-gray-700">
      {/* Items info */}
      <div className="text-sm text-gray-400">
        Showing {startItem}-{endItem} of {totalItems} holders
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          onClick={handlePrevious}
          disabled={currentPage === 1 || loading}
          variant="outline"
          size="sm"
          className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </Button>
        
        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-gray-500">...</span>
              ) : (
                <Button
                  onClick={() => handlePageClick(page)}
                  disabled={loading}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  className={`min-w-[40px] ${
                    page === currentPage
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                      : "bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white border-gray-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Next button */}
        <Button
          onClick={handleNext}
          disabled={currentPage === totalPages || loading}
          variant="outline"
          size="sm"
          className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
