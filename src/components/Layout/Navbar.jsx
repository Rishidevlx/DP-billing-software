import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Search, 
  Maximize, 
  Minimize,
  Bell, 
  Moon, 
  Sun,
  User as UserIcon,
  ChevronDown,
  Settings,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ toggleSidebar }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Initialize dark mode from localStorage or OS preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  // Listen for escape key fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="h-16 bg-white dark:bg-[#1E1E2D] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm transition-colors duration-300">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer border-none bg-transparent"
        >
          <Menu size={20} />
        </button>
        
        {/* Search */}
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-[#151521] rounded-md px-3 py-1.5 w-64 transition-all focus-within:ring-2 focus-within:ring-[#0E0D3A]/20 dark:focus-within:ring-slate-700 focus-within:bg-white dark:focus-within:bg-[#1E1E2D] border border-transparent focus-within:border-[#0E0D3A]/30 dark:focus-within:border-slate-600">
          <Search size={16} className="text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none ml-2 text-sm w-full text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Fullscreen */}
        <button 
          onClick={toggleFullScreen}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 hidden md:flex items-center justify-center cursor-pointer border-none bg-transparent"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        
        {/* Dark Mode */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer border-none bg-transparent flex items-center justify-center"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer border-none bg-transparent flex items-center justify-center"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1E1E2D]"></span>
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E1E2D] rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#151521]">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Notifications</h3>
                <span className="bg-primary-dark/10 dark:bg-primary-dark/30 text-primary-dark dark:text-slate-200 text-xs px-2 py-0.5 rounded-full font-medium">3 New</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">New invoice created</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Invoice #INV-2024-001 has been generated.</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Just now</p>
                </div>
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Client added successfully</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tech Solutions Inc was added to clients.</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">2 hours ago</p>
                </div>
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">System update</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your system has been updated to v1.0.2</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">1 day ago</p>
                </div>
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#151521] text-center">
                <a href="#" className="text-sm text-primary-dark dark:text-slate-300 font-medium hover:underline">View All Notifications</a>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative ml-1" ref={profileRef}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-md transition-colors border-l border-slate-200 dark:border-slate-700 pl-3 md:pl-4"
          >
            <div className="w-8 h-8 bg-[#0E0D3A] rounded-full flex items-center justify-center text-white shrink-0">
              <UserIcon size={16} />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">Admin User</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Founder</p>
            </div>
            <ChevronDown size={16} className="text-slate-400 dark:text-slate-500 hidden md:block" />
          </div>
          
          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E1E2D] rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#151521] md:hidden">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Admin User</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Founder</p>
              </div>
              <div className="py-1">
                <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0E0D3A] dark:hover:text-white transition-colors">
                  <UserIcon size={16} />
                  <span>Profile</span>
                </a>
                <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0E0D3A] dark:hover:text-white transition-colors">
                  <Settings size={16} />
                  <span>Settings</span>
                </a>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors w-full text-left bg-transparent border-none cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
