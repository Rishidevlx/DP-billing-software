import React, { useState } from 'react';
import ItemReport from './ItemReport';
import SaleSummary from './SaleSummary';
import StockReport from './StockReport';
import EntryReport from './EntryReport';
import BillReportTab from './BillReportTab';

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState('item'); // 'item', 'sales', 'stock'

  const generateTestData = () => {
    if (!window.confirm("This will wipe all your clients, bills, returns, and receipts and generate dummy data! Are you sure?")) return;

    const books = JSON.parse(localStorage.getItem('books') || '[]');
    if (books.length === 0) {
      alert("No books found! Please add books in Inventory first.");
      return;
    }

    const clients = [];
    const cities = ['CHENNAI', 'MADURAI', 'COIMBATORE', 'TRICHY', 'SALEM'];
    const districts = ['CHENNAI DIST', 'MADURAI DIST', 'COIMBATORE DIST', 'TRICHY DIST', 'SALEM DIST'];
    for(let i = 1; i <= 10; i++) {
      clients.push({
        id: `cust-${Date.now()}-${i}`,
        ledgerName: `TEST SCHOOL ${i}`,
        printName: `TEST SCHOOL ${i}`,
        group: 'Customer',
        city: cities[i % 5],
        district: districts[i % 5],
        state: 'Tamil Nadu',
        mobileNo: `987650000${i}`,
        partyType: 'School'
      });
    }

    const bills = [];
    let billNo = 1;
    clients.forEach(c => {
      for(let j = 1; j <= 10; j++) {
        const b1 = books[Math.floor(Math.random() * books.length)];
        const b2 = books[Math.floor(Math.random() * books.length)];
        
        const items = [
          { id: `item-${Date.now()}-${billNo}-1`, itemCode: b1.itemCode, itemName: b1.itemName, qty: 10, rate: parseFloat(b1.price) || 100, amount: (parseFloat(b1.price) || 100) * 10 },
          { id: `item-${Date.now()}-${billNo}-2`, itemCode: b2.itemCode, itemName: b2.itemName, qty: 5, rate: parseFloat(b2.price) || 150, amount: (parseFloat(b2.price) || 150) * 5 }
        ];
        
        const totalAmt = items.reduce((sum, item) => sum + item.amount, 0);
        const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

        const month = String(Math.floor(Math.random() * 8) + 1).padStart(2, '0');
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');

        bills.push({
          id: `bill-${Date.now()}-${billNo}`,
          billInfo: { billNo: String(billNo), date: `2026-${month}-${day}`, mode: 'Credit' },
          customer: { name: c.ledgerName, id: c.id, city: c.city, district: c.district },
          items,
          totals: { qty: totalQty, amount: totalAmt },
          amountPaid: 0,
          balance: totalAmt
        });
        billNo++;
      }
    });

    const returns = [];
    let returnNo = 1;
    for(let i = 0; i < 5; i++) {
      const c = clients[i];
      const b1 = books[Math.floor(Math.random() * books.length)];
      
      returns.push({
        id: `ret-${Date.now()}-${returnNo}`,
        returnInfo: { returnNo: String(returnNo), date: `2026-08-23` },
        customer: { name: c.ledgerName, id: c.id, city: c.city, district: c.district },
        items: [
          { id: `ret-item-${Date.now()}-1`, itemCode: b1.itemCode, itemName: b1.itemName, qty: 2, rate: parseFloat(b1.price) || 100, amount: (parseFloat(b1.price) || 100) * 2 }
        ],
        totals: { qty: 2, amount: (parseFloat(b1.price) || 100) * 2 }
      });
      returnNo++;
    }

    localStorage.setItem('clients', JSON.stringify(clients));
    localStorage.setItem('bills', JSON.stringify(bills));
    localStorage.setItem('returns', JSON.stringify(returns));
    localStorage.setItem('receipts', JSON.stringify([]));

    alert("Test data generated successfully! 10 Customers, 100 Bills, and 5 Returns have been created. (Old data removed)");
    window.location.reload();
  };

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
        <button 
          onClick={generateTestData}
          className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-md flex-shrink-0"
        >
          Generate Test Data
        </button>
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
