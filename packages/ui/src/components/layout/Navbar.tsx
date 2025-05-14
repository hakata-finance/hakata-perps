'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import logo from '../../../public/logo.png';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getCxpBalance } from '@/lib/compressed-tokens';

const navLinks = [
  { label: 'Trade', href: '/trade' },
  { label: 'Vault', href: '/vault' },
  { label: 'Faucet', href: '/faucet' },
];

const Navbar = () => {
  const pathname = usePathname();
  const { connected, publicKey } = useWallet();
  const [cxpBalance, setCxpBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) {
        setCxpBalance(null);

        return;
      }
      
      setIsLoading(true);

      try {
        const balance = await getCxpBalance(publicKey);
        setCxpBalance(balance);
      } catch (error) {
        console.error("Error fetching cXP balance:", error);
        setCxpBalance(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBalance();
    // Set up polling every 30 seconds to update balance
    const interval = setInterval(fetchBalance, 30000);
    
    return () => clearInterval(interval);
  }, [publicKey]);

  return (
    <nav className="bg-[#121212] border-b border-gray-800 px-4 py-3 flex items-center  text-white">
      <div className="flex items-center space-x-2">
        <Image src={logo} alt="Hakata Finance logo" width={30} height={30} />
        <h1 className="font-bold text-xl">Hakata Finance</h1>
        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">BETA</span>
      </div>
      <ul className="flex gap-4 ml-6 mr-auto">
          {navLinks.map((link) => {
            const isSelected = pathname.includes(link.href);

            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`text-[#949FA6] hover:text-white transition-colors px-2 py-1 relative${isSelected ? ' text-white before:content-["" ] before:absolute before:bottom-[-22px] before:left-0 before:w-full before:h-[1px] before:bg-white' : ''}`}
                  tabIndex={0}
                  aria-label={link.label}
                  aria-current={isSelected ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      <div className="flex items-center space-x-4 text-sm">
        {connected && (
          <>
            {!isLoading && (
              <div className="text-sm text-gray-400"><span className="text-white">cXP: </span> {cxpBalance?.toFixed(2) ?? "0.00"}</div>
            )}
          </>
        )}
        <WalletMultiButton />
      </div>
    </nav>
  );
};

export default Navbar;
