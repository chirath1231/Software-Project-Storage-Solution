import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Folder, 
  Users, 
  CreditCard, 
  Bell, 
  Settings, 
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { id: 'files', label: 'My Files', icon: <Folder /> },
    { id: 'clients', label: 'Clients', icon: <Users /> },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell /> },
    { id: 'settings', label: 'Settings', icon: <Settings /> },
    { id: 'support', label: 'Support', icon: <HelpCircle /> }
  ];

  const handleMenuClick = (itemId) => {
    setActiveItem(itemId);
    
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 p-3 bg-gradient-to-b from-orange-500 to-amber-400 text-white rounded-xl shadow-lg md:hidden hover:scale-105 transition-transform"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Layout Container */}
      <div className="flex">
        <div
          className={`
            w-[280px] min-h-screen
            bg-gradient-to-b from-white via-orange-50 to-orange-200 
            flex flex-col py-6 
           
            transition-transform duration-300 ease-in-out
            z-40 mt-5 ml-5 rounded-2xl mb-5
            
            ${isOpen ? 'fixed inset-y-0 left-0 translate-x-0' : 'fixed inset-y-0 left-0 -translate-x-full'}
            
            md:relative md:translate-x-0 md:w-[260px]
            
            lg:w-[280px]
            
            xl:w-[300px]
          `}
        >
          <nav className="flex-1 px-4 py-2 flex flex-col gap-1 overflow-y-auto">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`
                  flex items-center gap-4 
                  py-3.5 px-5 
                  rounded-3xl cursor-pointer 
                  transition-all duration-300 
                  text-base font-medium
                  min-h-[48px]
                  
                  ${activeItem === item.id 
                    ? 'bg-gradient-to-b from-orange-500 to-amber-400 text-white font-semibold shadow-lg shadow-orange-500/30 scale-[1.02]' 
                    : 'text-gray-700 hover:bg-orange-500/10 hover:text-orange-600 hover:scale-[1.01] active:scale-100'}
                `}
                onClick={() => handleMenuClick(item.id)}
              >
                <span className="text-[22px] flex items-center flex-shrink-0">
                  {item.icon}
                </span>
                <span className="flex-1 whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            ))}
          </nav>

          {/* Switch Account Button */}
          <div className="px-4 pt-4 mt-2 border-t border-orange-200/50">
            <button className="
              w-full py-4 px-5 
              text-base font-semibold text-white 
              text-center 
              bg-gradient-to-b from-orange-500 to-amber-400 
              shadow-lg shadow-orange-500/30 
              transition-all duration-300 
              hover:shadow-xl hover:shadow-orange-500/40 
              hover:scale-105 
              active:scale-100
              min-h-[48px]
              rounded-3xl
            ">
              Switch Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}