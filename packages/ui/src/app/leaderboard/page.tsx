'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { formatBalance, formatAddress } from '../../utils/compressionUtils';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';

export default function LeaderboardPage() {
  const { publicKey } = useWallet();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Items per page (configurable)
  
  // Fetch leaderboard data with pagination support
  const { 
    leaderboard, 
    loading, 
    error, 
    refetch, 
    totalCount, 
    totalPages 
  } = useLeaderboard(
    'FtQ7umDWQmGbuVAPEzhD4Mz8NZ3mCPNKYmZzMp2VWbeP', // cXP token mint
    itemsPerPage, // items per page
    currentPage, // current page
    publicKey?.toBase58() // current user's wallet address
  );

  /**
   * Handle page change from pagination component
   * @param page - The new page number to navigate to
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of leaderboard when changing pages
    document.getElementById('leaderboard-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Handle items per page change
   * @param newItemsPerPage - New number of items to display per page
   */
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  /**
   * Get rank icon with medal emojis for top 3 positions
   * @param rank - The rank position
   * @returns String representation of rank
   */
  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">cXP Token Leaderboard</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-lg">Loading leaderboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-scroll h-[calc(100vh-120px)] bg-black text-white pt-8">
      <div className="max-w-4xl mx-auto">
        <div id="leaderboard-top" className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">cXP Token Leaderboard</h1>
          
          {/* Total count and page info */}
          {totalCount > 0 && (
            <div className="text-gray-400 text-sm mb-4">
              Total holders: {totalCount.toLocaleString()} | 
              Page {currentPage} of {totalPages}
            </div>
          )}
          
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {/* Control buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button
              onClick={refetch}
              className="py-6 font-bold bg-[#121212] hover:bg-[#1A1A1A] text-white border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh Data"}
            </Button>
            
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Show per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="bg-[#121212] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                disabled={loading}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {leaderboard.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No cXP token holders found</p>
            <p className="text-gray-500 text-sm mt-2">
              Make sure you have cXP tokens in your wallet
            </p>
          </div>
        ) : (
          <div className="border-gray-800 border-1 bg-[#121212] rounded-lg overflow-hidden shadow-xl">
            <div className="bg-[#121212] px-6 py-4">
              <h2 className="text-xl font-semibold">
                Top Holders
                {loading && <span className="ml-2 text-sm text-gray-400">(Loading...)</span>}
              </h2>
            </div>
            
            <div className="divide-y divide-zinc-700">
              {leaderboard.map((entry) => (
                <div
                  key={entry.owner}
                  className={`px-6 py-4 flex items-center justify-between hover:bg-gray-750 transition-colors ${
                    entry.isCurrentUser 
                      ? 'bg-gradient-to-r from-blue-900/40 to-blue-800/20 border-l-4 border-blue-500' 
                      : entry.rank <= 3 
                        ? 'bg-gradient-to-r from-yellow-900/20 to-transparent' 
                        : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold min-w-[60px]">
                      {getRankIcon(entry.rank)}
                      {entry.isCurrentUser && <span className="ml-1 text-blue-400">👑</span>}
                    </div>
                    <div>
                      <div className="font-mono text-sm text-gray-300">
                        {formatAddress(entry.owner)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {entry.owner}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-400">
                      {formatBalance(entry.balance)} cXP
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalCount}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
} 