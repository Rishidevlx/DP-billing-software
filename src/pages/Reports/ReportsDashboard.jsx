import React, { useState } from 'react';
import ItemReport from './ItemReport';
import SaleSummary from './SaleSummary';
import StockReport from './StockReport';
import EntryReport from './EntryReport';
import BillReportTab from './BillReportTab';

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState('item'); // 'item', 'sales', 'stock'

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="max-w-7xl mx-auto pt-4 px-4 sm:px-0 mb-2">
        <div className="flex space-x-1 bg-slate-200/50 dark:bg-[#151521] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('item')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'item' 
                ? 'bg-white dark:bg-[#1E1E2D] text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Item Report
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'sales' 
                ? 'bg-white dark:bg-[#1E1E2D] text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sales Summary
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'stock' 
                ? 'bg-white dark:bg-[#1E1E2D] text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Stock Report
          </button>
          <button
            onClick={() => setActiveTab('entry')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'entry' 
                ? 'bg-white dark:bg-[#1E1E2D] text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Entry Report
          </button>
          <button
            onClick={() => setActiveTab('bill')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'bill' 
                ? 'bg-white dark:bg-[#1E1E2D] text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Bill Report
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'item' && <ItemReport />}
        {activeTab === 'sales' && <SaleSummary />}
        {activeTab === 'stock' && <StockReport />}
        {activeTab === 'entry' && <EntryReport />}
        {activeTab === 'bill' && <BillReportTab />}
      </div>
    </div>
  );
}
