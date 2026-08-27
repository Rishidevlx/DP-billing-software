import React, { useState, useEffect, useRef } from 'react';
import { FileText, Printer, Search } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { booksApi, billsApi, returnsApi, stocksApi, clientsApi } from '../../services/api';

const parseDate = (dStr) => {
  if (!dStr) return '';
  // If it's a full ISO string (e.g. 2026-08-27T10:00:00Z), extract just the date part
  if (typeof dStr === 'string' && dStr.includes('T')) {
    dStr = dStr.split('T')[0];
  }
  
  if (dStr.includes('-') && dStr.split('-')[0].length === 4) return dStr.substring(0, 10);
  
  const parts = dStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return dStr.substring(0, 10);
};

// Component for printing
const PrintItemReport = React.forwardRef(({ transactions, selectedBook, dateFrom, dateTo }, ref) => {
  const printDate = new Date().toLocaleDateString('en-GB');
  
  const formattedFrom = dateFrom ? parseDate(dateFrom).split('-').reverse().join('/') : '';
  const formattedTo = dateTo ? parseDate(dateTo).split('-').reverse().join('/') : '';
  const dateRangeStr = (formattedFrom || formattedTo) 
    ? `${formattedFrom || 'Start'} - ${formattedTo || 'Today'}`
    : 'All Time';

  let runningBalance = 0;

  return (
    <div ref={ref} className="p-8 bg-white text-black min-h-screen print:p-4" style={{ fontFamily: 'Arial, sans-serif' }}>
      <style type="text/css" media="print">
        {`
          @page { size: A4 portrait; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; color-adjust: exact; }
          .print-table th, .print-table td { border-left: 1px solid #000; border-right: 1px solid #000; }
          .print-table { border-collapse: collapse; border: 1px solid #000; }
          .print-header-border { border-top: 1px solid #000; border-bottom: 1px solid #000; }
        `}
      </style>

      <div className="text-center mb-6">
        <h1 className="text-xl font-bold uppercase text-blue-900 mb-2 tracking-widest">Item Report</h1>
        <h2 className="text-lg font-bold uppercase text-slate-800 mb-4">{selectedBook ? selectedBook.itemName : 'All Items'}</h2>
        <div className="flex justify-between items-end text-xs font-bold text-slate-700">
          <div>Date : {dateRangeStr}</div>
          <div>Print Date : {printDate}</div>
        </div>
      </div>

      <table className="w-full text-left print-table text-xs">
        <thead>
          <tr className="print-header-border text-blue-900 font-bold bg-gray-50/50">
            <th className="p-2 w-20 text-center uppercase border-r border-black">DATE</th>
            <th className="p-2 w-24 text-center uppercase border-r border-black">VCH TYPE</th>
            <th className="p-2 w-20 text-center uppercase border-r border-black">VCH NO</th>
            <th className="p-2 uppercase border-r border-black">PARTY NAME</th>
            <th className="p-2 w-16 text-right uppercase border-r border-black">IN</th>
            <th className="p-2 w-16 text-right uppercase border-r border-black">OUT</th>
            <th className="p-2 w-16 text-right uppercase">BALANCE</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, index) => {
            runningBalance += t.inQty - t.outQty;
            return (
              <tr key={index}>
                <td className="px-2 py-1 text-center border-r border-black">{t.dateStr}</td>
                <td className="px-2 py-1 text-center font-medium border-r border-black">{t.vchType}</td>
                <td className="px-2 py-1 text-center border-r border-black">{t.vchNo}</td>
                <td className="px-2 py-1 font-semibold border-r border-black uppercase">{t.partyName}</td>
                <td className="px-2 py-1 text-right font-bold border-r border-black">{t.inQty > 0 ? t.inQty : ''}</td>
                <td className="px-2 py-1 text-right font-bold border-r border-black">{t.outQty > 0 ? t.outQty : ''}</td>
                <td className="px-2 py-1 text-right font-bold">{runningBalance}</td>
              </tr>
            );
          })}
          {transactions.length === 0 && (
            <tr>
              <td colSpan="7" className="p-4 text-center">No transactions found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default function ItemReport() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  
  const [booksList, setBooksList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchField, setActiveSearchField] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeBookIndex, setActiveBookIndex] = useState(0);
  
  const [transactions, setTransactions] = useState([]);
  
  // API Data States
  const [allBills, setAllBills] = useState([]);
  const [allReturns, setAllReturns] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [clients, setClients] = useState([]);

  const printRef = useRef();

  useEffect(() => {
    // Determine start of month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setDateFrom(firstDay.toISOString().split('T')[0]);
    
    // Fetch all required data once
    Promise.all([
      booksApi.getAll(),
      billsApi.getAll(),
      returnsApi.getAll(),
      stocksApi.getAll(),
      clientsApi.getAll()
    ]).then(([b, bls, ret, stk, cli]) => {
      setBooksList(b.map(book => ({ id: book.id, itemName: book.book_name, itemCode: book.alias_name })));
      setAllBills(bls);
      setAllReturns(ret);
      setAllStocks(stk);
      setClients(cli);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (allBills.length > 0 || allReturns.length > 0 || allStocks.length > 0) {
       calculateReport();
    }
  }, [dateFrom, dateTo, selectedBook, allBills, allReturns, allStocks]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.book-search-container')) {
        setActiveSearchField(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const calculateReport = () => {
    const bills = allBills;
    const returns = allReturns;
    const stockEntries = allStocks;

    const allTransactions = [];

    stockEntries.forEach(entry => {
      // Find book
      const book = booksList.find(b => b.id === entry.book_id) || {};
      const itemName = book.itemName || 'Unknown';
      
      if (!selectedBook || (itemName.toLowerCase() === selectedBook.itemName.toLowerCase())) {
        const dStr = entry.date;
        allTransactions.push({
          dateRaw: parseDate(dStr),
          dateStr: dStr.includes('-') ? dStr.split('-').reverse().join('/') : dStr,
          vchType: 'Stock Entry',
          vchNo: entry.id.toString().substring(0, 6).toUpperCase(),
          partyName: 'Self',
          inQty: parseFloat(entry.qty) || 0,
          outQty: 0
        });
      }
    });

    returns.forEach(ret => {
      ret.items?.forEach(item => {
        const book = booksList.find(b => b.id === item.book_id) || {};
        const itemName = book.itemName || 'Unknown';

        if (!selectedBook || (itemName.toLowerCase() === selectedBook.itemName.toLowerCase())) {
          const dStr = ret.date || '';
          const customer = clients.find(c => c.id === ret.customer_id) || {};
          
          allTransactions.push({
            dateRaw: parseDate(dStr),
            dateStr: dStr.includes('-') ? dStr.split('-').reverse().join('/') : dStr,
            vchType: 'Sales Return',
            vchNo: ret.return_no || '',
            partyName: customer.name || 'Unknown',
            inQty: parseFloat(item.qty) || 0,
            outQty: 0
          });
        }
      });
    });

    bills.forEach(bill => {
      bill.items?.forEach(item => {
        const book = booksList.find(b => b.id === item.book_id) || {};
        const itemName = book.itemName || 'Unknown';

        if (!selectedBook || (itemName.toLowerCase() === selectedBook.itemName.toLowerCase())) {
          const dStr = bill.date || '';
          const customer = clients.find(c => c.id === bill.customer_id) || {};

          allTransactions.push({
            dateRaw: parseDate(dStr),
            dateStr: dStr.includes('-') ? dStr.split('-').reverse().join('/') : dStr,
            vchType: 'Sale',
            vchNo: bill.bill_no || '',
            partyName: customer.name || 'Unknown',
            inQty: 0,
            outQty: parseFloat(item.qty) || 0
          });
        }
      });
    });

    const parsedFrom = dateFrom ? parseDate(dateFrom) : '0000-00-00';
    const parsedTo = dateTo ? parseDate(dateTo) : '9999-12-31';

    // Filter by date
    const filteredTxns = allTransactions.filter(t => {
      return t.dateRaw >= parsedFrom && t.dateRaw <= parsedTo;
    });

    // Sort by date chronological
    filteredTxns.sort((a, b) => {
      if (a.dateRaw < b.dateRaw) return -1;
      if (a.dateRaw > b.dateRaw) return 1;
      return 0;
    });

    setTransactions(filteredTxns);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Item_Report_${selectedBook ? selectedBook.itemName : 'Empty'}`,
  });

  const searchResults = booksList.filter(b => 
    (b.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.itemCode || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Item Report</h1>
            <p className="text-slate-500 text-sm">View all inward and outward transactions for a specific item.</p>
          </div>
        </div>
        
        <button 
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Printer size={18} />
          Print Report
        </button>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 max-w-sm relative book-search-container">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Item</label>
            <div className="relative">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setActiveSearchField(true);
                  if (selectedBook && e.target.value !== selectedBook.itemName) {
                    setSelectedBook(null);
                  }
                }}
                onFocus={() => {
                  setActiveSearchField(true);
                  if (selectedBook) setSearchTerm(selectedBook.itemName);
                }}
                placeholder="Search Item Name or Code..."
                className="w-full pl-9 pr-3 py-2 border border-blue-400 dark:border-blue-500 rounded-md bg-blue-50 dark:bg-blue-900/20 text-slate-900 dark:text-white text-sm focus:outline-none uppercase"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-blue-500" />
              
              {activeSearchField && searchResults.length > 0 && (
                <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white dark:bg-[#1E1E2D] border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  <ul className="py-1">
                    {searchResults.map((book, i) => (
                      <li 
                        key={book.id}
                        onClick={() => {
                          setSelectedBook(book);
                          setSearchTerm(book.itemName);
                          setActiveSearchField(false);
                        }}
                        className={`px-3 py-2 cursor-pointer text-sm flex justify-between ${activeBookIndex === i ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                      >
                        <span className="font-semibold uppercase">{book.itemName}</span>
                        <span className="text-slate-400 text-xs">{book.itemCode}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Date From</label>
            <input 
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Date To</label>
            <input 
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-28">Date</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-32">Vch Type</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-28">Vch No</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400">Party Name</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-24 text-right">IN (Qty)</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-24 text-right">OUT (Qty)</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((t, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1a1a2e]/50">
                    <td className="p-3 text-sm text-slate-500">{t.dateStr}</td>
                    <td className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.vchType}</td>
                    <td className="p-3 text-sm text-slate-500">{t.vchNo}</td>
                    <td className="p-3 text-sm font-bold text-slate-800 dark:text-white uppercase">{t.partyName}</td>
                    <td className="p-3 text-sm text-right font-bold text-emerald-600 dark:text-emerald-400">{t.inQty > 0 ? t.inQty : '-'}</td>
                    <td className="p-3 text-sm text-right font-bold text-red-500 dark:text-red-400">{t.outQty > 0 ? t.outQty : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">No transactions found in the selected period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hidden">
        <PrintItemReport 
          ref={printRef} 
          transactions={transactions} 
          selectedBook={selectedBook}
          dateFrom={dateFrom} 
          dateTo={dateTo} 
        />
      </div>
    </div>
  );
}
