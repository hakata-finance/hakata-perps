'use client';

import React, { useState, useEffect } from 'react';
import { 
  fetchCxpLeaderboard, 
  formatBalance, 
  formatAddress,
  LeaderboardData 
} from '../../utils/compressionUtils';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching leaderboard data...");
      const data = await fetchCxpLeaderboard(10);
      setLeaderboard(data);
      console.log("Leaderboard data loaded:", data.length, "entries");
    } catch (err) {
      console.error("Failed to fetch leaderboard data:", err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">cXP Token Leaderboard</h1>
          <p className="text-gray-400 mb-6">
            Top cXP Token Holders on Devnet
          </p>
          
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <button
            onClick={fetchLeaderboard}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {leaderboard.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No cXP token holders found</p>
            <p className="text-gray-500 text-sm mt-2">
              Make sure the HELIUS_API_KEY is configured on the server
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
            <div className="bg-gray-700 px-6 py-4">
              <h2 className="text-xl font-semibold">
                Top Holders ({leaderboard.length} found)
              </h2>
            </div>
            
            <div className="divide-y divide-gray-700">
              {leaderboard.map((entry) => (
                <div
                  key={entry.owner}
                  className={`px-6 py-4 flex items-center justify-between hover:bg-gray-750 transition-colors ${
                    entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-900/20 to-transparent' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold min-w-[60px]">
                      {getRankIcon(entry.rank)}
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
                    <div className="text-xs text-gray-500">
                      {entry.balance.toLocaleString()} tokens
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Real-time cXP Token Holders • Powered by Helius RPC</p>
          <p className="mt-2">
            Data fetched from Solana devnet using{' '}
            <a
              href="https://docs.helius.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Helius API
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 