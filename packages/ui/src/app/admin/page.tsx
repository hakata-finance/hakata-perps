'use client';

import { redirect } from 'next/navigation';
import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAdminAirdrop } from '@/hooks/useAdminAirdrop';

/**
 * Admin page component for managing cXP airdrops
 * Only accessible to users with admin privileges
 */
const AdminPage = () => {
  const { connected } = useWallet();
  const isAdmin = useIsAdmin();
  const { isAirdropping, performAirdrop } = useAdminAirdrop();
  
  // Form state for airdrop inputs
  const [recipientAddress, setRecipientAddress] = useState('');
  const [airdropAmount, setAirdropAmount] = useState('');

  /**
   * Handle the airdrop form submission
   * Validates inputs and performs the airdrop
   */
  const handleAirdrop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate recipient address
    if (!recipientAddress.trim()) {
      toast.error('Please enter a recipient address');
      return;
    }
    
    // Validate amount
    const amount = parseFloat(airdropAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }
    
    try {
      // Convert string address to PublicKey
      const recipientPublicKey = new PublicKey(recipientAddress.trim());
      
      // Perform the airdrop
      const txId = await performAirdrop(recipientPublicKey, amount);
      
      if (txId) {
        // Clear form on success
        setRecipientAddress('');
        setAirdropAmount('');
        
        console.log('Airdrop successful, transaction ID:', txId);
      }
    } catch (error) {
      console.error('Invalid public key format:', error);
      toast.error('Invalid recipient address format');
    }
  };

  if (!isAdmin || !connected) {
    // Redirect non-admin users to the main page
    // This provides better UX by automatically sending unauthorized users back to home
    // rather than showing an access denied message
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Admin Panel</h1>
          <p className="text-gray-400 text-lg">Manage cXP token airdrops</p>
        </div>

        {/* Airdrop Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#121212] border border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">cXP Airdrop</h2>
            
            <form onSubmit={handleAirdrop} className="space-y-6">
              {/* Recipient Address Input */}
              <div>
                <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient Public Key
                </label>
                <input
                  id="recipientAddress"
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter user's public key (e.g., 4fYNw3dojWmQ...)"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isAirdropping}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the public key of the user who will receive the cXP tokens
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <label htmlFor="airdropAmount" className="block text-sm font-medium text-gray-300 mb-2">
                  cXP Amount
                </label>
                <input
                  id="airdropAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={airdropAmount}
                  onChange={(e) => setAirdropAmount(e.target.value)}
                  placeholder="Enter amount (e.g., 10.5)"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isAirdropping}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the amount of cXP tokens to airdrop (minimum 0.01)
                </p>
              </div>

              {/* Airdrop Button */}
              <button
                type="submit"
                disabled={isAirdropping || !recipientAddress.trim() || !airdropAmount}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#121212]"
              >
                {isAirdropping ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Airdrop...</span>
                  </div>
                ) : (
                  'Airdrop cXP'
                )}
              </button>
            </form>

            {/* Info Section */}
            <div className="mt-8 p-4 bg-[#1a1a1a] border border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium mb-2">ℹ️ Important Notes</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Ensure the recipient address is valid before proceeding</li>
                <li>• Airdrop transactions are irreversible once confirmed</li>
                <li>• The transaction will be signed with the admin authority</li>
                <li>• Recipients will receive tokens in their associated token account</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 