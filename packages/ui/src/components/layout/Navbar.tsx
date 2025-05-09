import Image from 'next/image';
import { Button } from '@/components/ui/button';

import logo from '../../../public/logo.png';
const Navbar = () => {
  return (
    <div className="bg-[#121212] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Image src={logo} alt="Hakata Finance logo" width={30} height={30} />
        <span className="font-bold text-xl">Hakata Finance</span>
        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">BETA</span>
      </div>
      <div className="flex items-center space-x-4">
        {/* <div className="text-sm text-gray-400">Balance: <span className="text-white">$10,000.00</span></div> */}
        <Button variant="outline" size="sm" className="border-gray-700">Connect Wallet</Button>
      </div>
    </div>
  );
};

export default Navbar;
