import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    </div>
  );
}
