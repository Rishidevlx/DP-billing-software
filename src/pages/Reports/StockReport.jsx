import React, { useState, useEffect, useRef } from 'react';
import { FileText, Printer, Search } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { booksApi, billsApi, returnsApi, stocksApi } from '../../services/api';

const parseDate = (dStr) => {
  if (!dStr) return '';
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
const PrintStockReport = React.forwardRef(({ reportData, dateFrom, dateTo, closingStockOnly }, ref) => {
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
          .print-table th, .print-table td { border-left: 1px solid #000; border-right: 1px solid #000; }
          .print-table { border-collapse: collapse; border: 1px solid #000; }
          .print-header-border { border-top: 1px solid #000; border-bottom: 1px solid #000; }
        `}
      </style>

      <div className="text-center mb-6">
        <h1 className="text-xl font-bold uppercase text-blue-900 mb-4 tracking-widest">Stock Report</h1>
        <div className="flex justify-between items-end text-xs font-bold text-slate-700">
          <div>Date : {dateRangeStr}</div>
          <div>Print Date : {printDate}</div>
        </div>
      </div>

      <table className="w-full text-left print-table text-xs">
        <thead>
          <tr className="print-header-border text-blue-900 font-bold bg-gray-50/50">
            <th className="p-2 w-10 text-center uppercase border-r border-black">S.NO</th>
            <th className="p-2 uppercase border-r border-black">ITEM NAME</th>
            {!closingStockOnly && (
              <>
                <th className="p-2 w-16 text-right uppercase border-r border-black">OP. STK</th>
                <th className="p-2 w-12 text-right uppercase border-r border-black">IN</th>
                <th className="p-2 w-12 text-right uppercase border-r border-black">OUT</th>
              </>
            )}
            <th className="p-2 w-16 text-right uppercase">CL. STK</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={closingStockOnly ? "3" : "6"} className="px-2 pt-2 pb-1 font-bold">BOOK</td>
          </tr>
          {reportData.map((book, index) => (
            <tr key={index}>
              <td className="px-2 py-0.5 text-center border-r border-black">{index + 1}</td>
              <td className="px-2 py-0.5 font-semibold border-r border-black uppercase whitespace-nowrap">{book.itemName}</td>
              {!closingStockOnly && (
                <>
                  <td className="px-2 py-0.5 text-right font-bold border-r border-black">{book.opStk}</td>
                  <td className="px-2 py-0.5 text-right font-bold border-r border-black">{book.inRange}</td>
                  <td className="px-2 py-0.5 text-right font-bold border-r border-black">{book.outRange}</td>
                </>
              )}
              <td className="px-2 py-0.5 text-right font-bold">{book.clStk}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default function StockReport() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [closingStockOnly, setClosingStockOnly] = useState(false);
  const [reportData, setReportData] = useState([]);
  
  const [allBooks, setAllBooks] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [allReturns, setAllReturns] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  
  const printRef = useRef();

  useEffect(() => {
    // Determine start of month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setDateFrom(firstDay.toISOString().split('T')[0]);

    Promise.all([
      booksApi.getAll(),
      billsApi.getAll(),
      returnsApi.getAll(),
      stocksApi.getAll()
    ]).then(([b, bls, ret, stk]) => {
      setAllBooks(b.map(book => ({ id: book.id, itemName: book.book_name, itemCode: book.alias_name, currentStock: book.stock })));
      setAllBills(bls);
      setAllReturns(ret);
      setAllStocks(stk);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (allBooks.length > 0 || allBills.length > 0) {
      calculateReport();
    }
  }, [dateFrom, dateTo, allBooks, allBills, allReturns, allStocks]);

  const calculateReport = () => {
    const books = allBooks;
    const bills = allBills;
    const returns = allReturns;
    const stockEntries = allStocks;

    const allTransactions = [];

    stockEntries.forEach(entry => {
      const book = books.find(b => b.id === entry.book_id) || {};
      allTransactions.push({
        date: parseDate(entry.date),
        type: 'IN',
        itemCode: book.itemCode,
        itemName: book.itemName,
        qty: parseFloat(entry.qty) || 0
      });
    });

    returns.forEach(ret => {
      ret.items?.forEach(item => {
        const book = books.find(b => b.id === item.book_id) || {};
        allTransactions.push({
          date: parseDate(ret.date),
          type: 'IN',
          itemCode: book.itemCode,
          itemName: book.itemName,
          qty: parseFloat(item.qty) || 0
        });
      });
    });

    bills.forEach(bill => {
      bill.items?.forEach(item => {
        const book = books.find(b => b.id === item.book_id) || {};
        allTransactions.push({
          date: parseDate(bill.date),
          type: 'OUT',
          itemCode: book.itemCode,
          itemName: book.itemName,
          qty: parseFloat(item.qty) || 0
        });
      });
    });

    const parsedFrom = dateFrom ? parseDate(dateFrom) : '0000-00-00';
    const parsedTo = dateTo ? parseDate(dateTo) : '9999-12-31';

    const calculatedData = books.map(book => {
      const bookTxns = allTransactions.filter(t => 
        t.itemName && book.itemName && 
        t.itemName.toLowerCase() === book.itemName.toLowerCase()
      );
      
      const totalInEver = bookTxns.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.qty, 0);
      const totalOutEver = bookTxns.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.qty, 0);
      
      const currentStock = parseFloat(book.currentStock) || 0;
      const initialStock = currentStock - totalInEver + totalOutEver;
      
      let inBefore = 0;
      let outBefore = 0;
      let inRange = 0;
      let outRange = 0;
      
      bookTxns.forEach(t => {
        const isBefore = t.date < parsedFrom;
        const isWithin = t.date >= parsedFrom && t.date <= parsedTo;
        
        if (isBefore) {
          if (t.type === 'IN') inBefore += t.qty;
          if (t.type === 'OUT') outBefore += t.qty;
        } else if (isWithin) {
          if (t.type === 'IN') inRange += t.qty;
          if (t.type === 'OUT') outRange += t.qty;
        }
      });
      
      const opStk = initialStock + inBefore - outBefore;
      const clStk = opStk + inRange - outRange;
      
      return {
        ...book,
        opStk,
        inRange,
        outRange,
        clStk
      };
    });

    setReportData(calculatedData);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Stock_Report_${dateFrom}_to_${dateTo}`,
  });

  const filteredData = reportData.filter(b => 
    (b.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.itemCode || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Stock Report</h1>
          <p className="text-slate-500 text-sm">View opening, inward, outward, and closing stock.</p>
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
          <div className="flex-1 max-w-xs relative">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Search Items</label>
            <div className="relative">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by code or name..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none uppercase"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
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

          <div className="flex items-center gap-2 pb-2 pl-2">
            <input 
              type="checkbox" 
              id="closingStockCheck"
              checked={closingStockOnly}
              onChange={(e) => setClosingStockOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
            />
            <label htmlFor="closingStockCheck" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer uppercase">
              Closing Stock Only (Print)
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-16 text-center">S.No</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-24">Code</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400">Item Name</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-24 text-right">OP. STK</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-24 text-right">IN</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-24 text-right">OUT</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-28 text-right">CL. STK</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((book, index) => (
                  <tr key={book.id || index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1a1a2e]/50">
                    <td className="p-3 text-center text-sm font-medium text-slate-500">{index + 1}</td>
                    <td className="p-3 text-sm text-slate-500 uppercase">{book.itemCode}</td>
                    <td className="p-3 text-sm font-semibold text-slate-800 dark:text-white uppercase">{book.itemName}</td>
                    <td className="p-3 text-sm text-right font-bold text-slate-700 dark:text-slate-300">{book.opStk}</td>
                    <td className="p-3 text-sm text-right font-bold text-blue-600 dark:text-blue-400">{book.inRange}</td>
                    <td className="p-3 text-sm text-right font-bold text-red-500 dark:text-red-400">{book.outRange}</td>
                    <td className="p-3 text-sm text-right font-bold text-emerald-600 dark:text-emerald-400">{book.clStk}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">No books found for the selected criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hidden">
        <PrintStockReport 
          ref={printRef} 
          reportData={filteredData} 
          dateFrom={dateFrom} 
          dateTo={dateTo} 
          closingStockOnly={closingStockOnly}
        />
      </div>
    </div>
  );
}
