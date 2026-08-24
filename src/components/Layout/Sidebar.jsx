import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Book, 
  Users, 
  BarChart2, 
  Settings, 
  HelpCircle,
  FileText,
  UserPlus,
  FilePlus,
  ChevronDown,
  ChevronRight,
  Truck,
  Package,
  PieChart,
  Printer
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const menuItems = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    path: '/dashboard',
  },
  {
    title: 'Bills',
    icon: <Receipt size={20} />,
    subItems: [
      { title: 'Create Bill', path: '/bill/create', icon: <FilePlus size={16} /> },
      { title: 'All Bills', path: '/bill/all', icon: <FileText size={16} /> },
      { title: 'Bill Print/Report', path: '/bill/report', icon: <Printer size={16} /> },
      { title: 'LR Details', path: '/bill/lr', icon: <Truck size={16} /> },
      { title: 'Create Return', path: '/returns/create', icon: <FilePlus size={16} /> },
      { title: 'All Returns', path: '/returns/all', icon: <FileText size={16} /> },
    ]
  },
  {
    title: 'Books',
    icon: <Book size={20} />,
    subItems: [
      { title: 'Add Books', path: '/books/add', icon: <FilePlus size={16} /> },
      { title: 'Books Details', path: '/books/details', icon: <FileText size={16} /> },
    ]
  },
  {
    title: 'Clients',
    icon: <Users size={20} />,
    subItems: [
      { title: 'Add Clients', path: '/clients/add', icon: <UserPlus size={16} /> },
      { title: 'Clients Details', path: '/clients/details', icon: <FileText size={16} /> }
    ]
  },
  {
    title: 'Stocks',
    icon: <Package size={20} />,
    subItems: [
      { title: 'All Stocks', path: '/stocks/all', icon: <Package size={16} /> },
      { title: 'Stock Entry', path: '/stocks/entry', icon: <FilePlus size={16} /> },
    ]
  },
  {
    title: 'Transport',
    icon: <Truck size={20} />,
    path: '/transport',
  },
  {
    title: 'Customer Report',
    icon: <Users size={20} />,
    subItems: [
      { title: 'Customer List With Address', path: '/customer/list', icon: <FileText size={16} /> },
      { title: 'Customer Wise Report', path: '/customer/wise-report', icon: <FileText size={16} /> },
    ]
  },
  {
    title: 'Reports',
    icon: <BarChart2 size={20} />,
    subItems: [
      { title: 'Dashboard', path: '/reports', icon: <FileText size={16} /> },
      { title: 'Daily Transaction Report', path: '/reports/daily-transaction', icon: <FileText size={16} /> },
      { title: 'Overall Transaction Report', path: '/reports/overall-transaction', icon: <FileText size={16} /> },
      { title: 'Ledger Statement', path: '/reports/ledger', icon: <FileText size={16} /> },
      { title: 'Ledger Group Summary', path: '/reports/ledger-group', icon: <FileText size={16} /> },
      { title: 'Payment Pending', path: '/reports/payment-pending', icon: <FileText size={16} /> },
      { title: 'Receipts', path: '/reports/receipts', icon: <FileText size={16} /> },
      { title: 'All Receipts', path: '/reports/all-receipts', icon: <Receipt size={16} /> },
    ]
  },
  {
    title: 'Settings',
    icon: <Settings size={20} />,
    subItems: [
      { title: 'Business Settings', path: '/settings/business', icon: <Settings size={16} /> },
      { title: 'Invoice Settings', path: '/settings/invoice', icon: <FileText size={16} /> },
      { title: 'Tax / GST Settings', path: '/settings/tax', icon: <Receipt size={16} /> },
      { title: 'E-Invoice API', path: '/settings/einvoice', icon: <FileText size={16} /> },
    ]
  },
  {
    title: 'Guidance',
    icon: <HelpCircle size={20} />,
    subItems: [
      { title: 'User Guide', path: '/guidance/guide', icon: <Book size={16} /> },
    ]
  }
];

export default function Sidebar({ isOpen }) {
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (title) => {
    if (!isOpen) return; // Don't toggle accordion if sidebar is closed
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <div 
      className={`h-screen bg-[#0E0D3A] text-[#94A3B8] transition-all duration-300 flex flex-col relative z-20 ${isOpen ? 'w-64' : 'w-[70px]'}`}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-white/10 gap-2">
        <img src="/DP-logo.png" alt="DP Logo" className="w-8 h-8 bg-white rounded-full p-0.5 object-cover" />
        {isOpen && (
          <h2 className="text-white text-xl font-bold tracking-wider">DOLPHIN</h2>
        )}
      </div>

      {/* Menu Area */}
      <div className={`flex-1 py-4 no-scrollbar ${isOpen ? 'overflow-y-auto overflow-x-hidden' : 'overflow-visible'}`}>
        {isOpen && <div className="px-6 mb-2 text-xs font-semibold text-white/50 tracking-wider">MENU</div>}
        
        <ul className="flex flex-col gap-1 px-3">
          {menuItems.map((item) => (
            <li key={item.title} className="relative group">
              {item.subItems ? (
                // Parent with Submenu
                <div 
                  className={`flex items-center justify-between cursor-pointer rounded-md transition-colors ${isOpen ? 'px-3 py-2.5' : 'justify-center p-3'} hover:text-white hover:bg-white/5 ${expandedMenus[item.title] && isOpen ? 'text-white' : ''}`}
                  onClick={() => toggleMenu(item.title)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${expandedMenus[item.title] && isOpen ? 'text-white' : ''}`}>{item.icon}</span>
                    {isOpen && <span className="font-medium text-sm whitespace-nowrap">{item.title}</span>}
                  </div>
                  {isOpen && (
                    <span className="text-white/50">
                      {expandedMenus[item.title] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                  )}
                </div>
              ) : (
                // Normal Link
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 rounded-md transition-colors ${isOpen ? 'px-3 py-2.5' : 'justify-center p-3'} hover:text-white hover:bg-white/5 ${isActive ? 'text-white bg-white/10' : ''}`
                  }
                >
                  <span>{item.icon}</span>
                  {isOpen && <span className="font-medium text-sm whitespace-nowrap">{item.title}</span>}
                </NavLink>
              )}

              {/* Submenu rendering (Accordion when open) */}
              {isOpen && item.subItems && (
                <div className={`overflow-hidden transition-all duration-300 ${expandedMenus[item.title] ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                  <ul className="pl-9 flex flex-col gap-1">
                    {item.subItems.map(sub => (
                      <li key={sub.title}>
                        <NavLink 
                          to={sub.path}
                          className={({ isActive }) => 
                            `flex items-center gap-2 py-2 text-sm transition-colors hover:text-white ${isActive ? 'text-white font-medium' : 'text-white/70'}`
                          }
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                          <span>{sub.title}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Floating Submenu (When Sidebar is closed) */}
              {!isOpen && item.subItems && (
                <div className="absolute left-full top-0 ml-1 w-48 bg-[#0E0D3A] rounded-md shadow-lg border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-2 border-b border-white/10 text-white font-medium text-sm">{item.title}</div>
                  <ul className="py-2">
                    {item.subItems.map(sub => (
                      <li key={sub.title}>
                        <NavLink 
                          to={sub.path}
                          className={({ isActive }) => 
                            `flex items-center px-4 py-2 text-sm transition-colors hover:text-white hover:bg-white/5 ${isActive ? 'text-white bg-white/5' : 'text-white/70'}`
                          }
                        >
                          {sub.title}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Floating Tooltip for Normal Links (When Sidebar is closed) */}
              {!isOpen && !item.subItems && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-1 px-3 py-1.5 bg-[#0E0D3A] text-white text-sm font-medium rounded-md shadow-lg border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                  {item.title}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
