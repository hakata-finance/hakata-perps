import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import logo from '../../../public/logo.png';
import Link from 'next/link';

const navLinks = [
  { label: 'Trade', href: '/trade' },
  { label: 'Vault', href: '/vault' },
  { label: 'Faucet', href: '/faucet' },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-[#121212] border-b border-gray-800 px-4 py-3 flex items-center  text-white">
      <div className="flex items-center space-x-2">
        <Image src={logo} alt="Hakata Finance logo" width={30} height={30} />
        <h1 className="font-bold text-xl">Hakata Finance</h1>
        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">BETA</span>
      </div>
      <ul className="flex gap-4 ml-6 mr-auto">
          {navLinks.map((link) => {
            const isSelected = pathname === link.href;
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
        {/* <div className="text-sm text-gray-400">Balance: <span className="text-white">$10,000.00</span></div> */}
        <WalletMultiButton />
      </div>
    </nav>
  );
};

export default Navbar;
