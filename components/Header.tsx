import React from 'react';
import { CubeIcon } from './icons/CubeIcon';
import { MobileIcon } from './icons/MobileIcon';
import { DesktopIcon } from './icons/DesktopIcon';

interface HeaderProps {
  isMobileView: boolean;
  onToggleMobileView: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileView, onToggleMobileView }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <CubeIcon className="h-8 w-8 text-primary" />
            <span className="ml-3 text-2xl font-bold text-gray-800">
              Thiện Cô Đao
            </span>
          </div>
          <div className="flex items-center">
            <button 
              onClick={onToggleMobileView} 
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              aria-label={isMobileView ? 'Chuyển sang giao diện máy tính' : 'Chuyển sang giao diện di động'}
            >
              {isMobileView ? <DesktopIcon className="w-6 h-6" /> : <MobileIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};