import React, { useState } from 'react';
import { LayoutDashboard, FileText, Users, CreditCard, Bell, Settings, HelpCircle, Menu, X } from 'lucide-react';

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'My Files', icon: FileText },
    { name: 'Clients', icon: Users },
    { name: 'Subscription', icon: CreditCard },
    { name: 'Notifications', icon: Bell },
    { name: 'Settings', icon: Settings },
    { name: 'Support', icon: HelpCircle },
  ];

  return (
    <>
      {/* Hamburger Button - Visible on small screens */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-orange-400 text-white p-3 rounded-lg shadow-lg hover:bg-orange-500 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay - Visible when sidebar is open on small screens */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static ml-10 mb-10 mt w-64 h-screen bg-gradient-to-t from-orange-200 via-orange-50 to-white p-6 flex flex-col justify-between z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          <nav className="space-y-2 mt-16 md:mt-10 ">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.name;
              
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveItem(item.name);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-3xl transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-orange-200'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button className="w-full bg-orange-500 text-white font-medium py-3 px-4 rounded-xl hover:bg-orange-600 transition-colors shadow-md">
          Switch Account
        </button>
      </div>
    </>
  );
}