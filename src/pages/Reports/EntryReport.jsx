import React, { useState, useEffect, useRef } from 'react';
import { FileText, Printer, Search } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const parseDate = (dStr) => {
  if (!dStr) return '';
  if (dStr.includes('-') && dStr.split('-')[0].length === 4) return dStr;
  
  const parts = dStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return dStr;
};

// Component for printing
const PrintEntryReport = React.forwardRef(({ entries, dateFrom, dateTo, totalQty }, ref) => {
  const printDate = new Date().toLocaleDateString('en-GB');
  
  const formattedFrom = dateFrom ? parseDate(dateFrom).split('-').reverse().join('/') : '';
  const formattedTo = dateTo ? parseDate(dateTo).split('-').reverse().join('/') : '';
  const dateRangeStr = (formattedFrom || formattedTo) 
    ? `${formattedFrom || 'Start'} - ${formattedTo || 'Today'}`
    : 'All Time';

  return (
    <div ref={ref} className="p-8 bg-white text-black min-h-screen print:p-4" style={{ fontFamily: 'Arial, sans-serif' }}>
      <style type="text/css" media="print">
        {`
          @page { size: A4 portrait; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; color-adjust: exact; }
          .print-table th, .print-table td { border-bottom: 1px dashed #ccc; padding: 6px 8px; }
          .print-table { width: 100%; border-collapse: collapse; }
          .print-header { border-top: 2px solid #000; border-bottom: 2px solid #000; }
        `}
      </style>

      <div className="flex justify-between items-end mb-4 border-b-2 border-black pb-2">
        <h2 className="text-lg font-bold uppercase">Books Entry Report <span className="text-sm normal-case font-normal ml-2">({dateRangeStr})</span></h2>
        <div className="text-xs font-semibold">Print Date : {printDate}</div>
      </div>

      <table className="print-table text-sm">
        <thead>
          <tr className="print-header font-bold text-left">
            <th className="w-16 text-center">S.No</th>
            <th className="w-28">Date</th>
            <th>Item Name</th>
            <th className="w-28 text-right">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((t, index) => (
            <tr key={index}>
              <td className="text-center">{index + 1}</td>
              <td>{t.dateStr}</td>
              <td className="uppercase font-bold">{t.itemName}</td>
              <td className="text-right font-bold">{t.qty}</td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan="4" className="p-4 text-center">No entries found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between font-bold mt-4 pt-2 border-t-2 border-black text-sm">
        <div>Page 1 of 1</div>
        <div className="flex gap-4 items-center">
          <span>Total Quantity Entered :</span>
          <span className="text-lg">{totalQty}</span>
        </div>
      </div>
    </div>
  );
});

export default function EntryReport() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [booksList, setBooksList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchField, setActiveSearchField] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeBookIndex, setActiveBookIndex] = useState(0);
  
  const [entries, setEntries] = useState([]);
  const [totalQty, setTotalQty] = useState(0);
  
  const printRef = useRef();

  useEffect(() => {
    // Determine start of month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setDateFrom(firstDay.toISOString().split('T')[0]);
    
    const savedBooks = JSON.parse(localStorage.getItem('books') || '[]');
    setBooksList(savedBooks);
  }, []);

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

  useEffect(() => {
    calculateReport();
  }, [dateFrom, dateTo, selectedBook]);

  const calculateReport = () => {
    const stockEntries = JSON.parse(localStorage.getItem('stock_entries') || '[]');

    const allEntries = [];

    stockEntries.forEach(entry => {
      entry.items?.forEach(item => {
        if (!selectedBook || (item.itemName && item.itemName.toLowerCase() === selectedBook.itemName.toLowerCase())) {
          const dStr = entry.date || item.date || '';
          allEntries.push({
            dateRaw: parseDate(dStr),
            dateStr: dStr.includes('-') ? dStr.split('-').reverse().join('/') : dStr,
            itemCode: item.itemCode || '',
            itemName: item.itemName || 'Unknown Book',
            qty: parseFloat(item.quantity) || 0
          });
        }
      });
    });

    const parsedFrom = dateFrom ? parseDate(dateFrom) : '0000-00-00';
    const parsedTo = dateTo ? parseDate(dateTo) : '9999-12-31';

    // Filter by date and search term
    const filteredEntries = allEntries.filter(t => {
      const inDateRange = t.dateRaw >= parsedFrom && t.dateRaw <= parsedTo;
      const matchesSearch = selectedBook ? true : (
        t.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return inDateRange && matchesSearch;
    });

    // Sort by date chronological
    filteredEntries.sort((a, b) => {
      if (a.dateRaw < b.dateRaw) return -1;
      if (a.dateRaw > b.dateRaw) return 1;
      return 0;
    });

    setEntries(filteredEntries);
    
    // Calculate Totals
    const tQty = filteredEntries.reduce((sum, t) => sum + t.qty, 0);
    setTotalQty(tQty);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Books_Entry_Report${selectedBook ? '_' + selectedBook.itemName : ''}`,
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
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Entry Report</h1>
            <p className="text-slate-500 text-sm">View details of books entered into stock.</p>
          </div>
        </div>
        
        <button 
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer border-none"
        >
          <Printer size={18} />
          Print Report
        </button>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 max-w-sm relative book-search-container">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Book</label>
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
                placeholder="Search Book Name or Code..."
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

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-16 text-center">S.No</th>
                  <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-32">Date</th>
                  <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400">Item Name</th>
                  <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-32 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {entries.length > 0 ? (
                  entries.map((t, index) => (
                    <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1a1a2e]/50">
                      <td className="p-3 text-center text-sm font-medium text-slate-500">{index + 1}</td>
                      <td className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.dateStr}</td>
                      <td className="p-3 text-sm font-bold text-slate-800 dark:text-white uppercase">{t.itemName}</td>
                      <td className="p-3 text-sm text-right font-bold text-blue-600 dark:text-blue-400">{t.qty}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500">No book entries found in the selected period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Totals Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e] flex justify-end">
            <div className="flex items-center gap-4 pr-4">
              <span className="text-sm text-slate-500 font-semibold uppercase">Total Quantity Entered:</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalQty}</span>
            </div>
          </div>
        </>
      </div>

      <div className="hidden">
        <PrintEntryReport 
          ref={printRef} 
          entries={entries} 
          dateFrom={dateFrom} 
          dateTo={dateTo} 
          totalQty={totalQty}
        />
      </div>
    </div>
  );
}
