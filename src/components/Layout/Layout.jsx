import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import GlobalClientModal from '../Modal/GlobalClientModal';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Check for Ctrl + N
      if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault(); // Prevent default browser behavior (like opening a new window)
        setIsClientModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-[#151521] overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar fixed on the left */}
      <Sidebar isOpen={isSidebarOpen} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Navbar toggleSidebar={toggleSidebar} />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </div>
      
      {/* Global Modals */}
      <GlobalClientModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
      />
    </div>
  );
}
