import React, { useState, useEffect, useRef } from 'react';
import { FileText, Printer, Search } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { billsApi, returnsApi, clientsApi } from '../../services/api';

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
const PrintSaleSummary = React.forwardRef(({ transactions, dateFrom, dateTo, totalAmount, totalRecdAmount }, ref) => {
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
          .print-table th, .print-table td { border-bottom: 1px dashed #ccc; padding: 4px 8px; }
          .print-table { width: 100%; border-collapse: collapse; }
          .print-header { border-top: 2px solid #000; border-bottom: 2px solid #000; }
        `}
      </style>

      <div className="flex justify-between items-end mb-4 border-b-2 border-black pb-2">
        <h2 className="text-lg font-bold">Sales Summary Details for the Period of {dateRangeStr}</h2>
        <div className="text-xs font-semibold">Print Date : {printDate}</div>
      </div>

      <table className="print-table text-xs">
        <thead>
          <tr className="print-header font-bold text-left">
            <th className="w-24">Date</th>
            <th className="w-24">Bill / Ret No</th>
            <th>Customer</th>
            <th className="w-24">Pay Mode</th>
            <th className="w-28 text-right">Net Amount</th>
            <th className="w-28 text-right">Recd. Amt</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, index) => (
            <tr key={index}>
              <td>{t.dateStr}</td>
              <td>{t.vchNo}</td>
              <td className="uppercase">{t.partyName}</td>
              <td className="uppercase">{t.payMode}</td>
              <td className="text-right">{t.netAmount.toFixed(2)}</td>
              <td className="text-right">{t.recdAmount > 0 ? t.recdAmount.toFixed(2) : ''}</td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan="6" className="p-4 text-center">No records found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between font-bold mt-4 pt-2 border-t-2 border-black text-sm">
        <div>Page 1 of 1</div>
        <div className="flex gap-16">
          <span>{totalAmount.toFixed(2)}</span>
          {/* If Recd Amount Total is needed, it can be added here */}
          <span className="w-16"></span>
        </div>
      </div>
    </div>
  );
});

export default function SaleSummary() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [transactions, setTransactions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalRecdAmount, setTotalRecdAmount] = useState(0);

  const [allBills, setAllBills] = useState([]);
  const [allReturns, setAllReturns] = useState([]);
  const [clients, setClients] = useState([]);
  
  const printRef = useRef();

  useEffect(() => {
    // Determine start of month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setDateFrom(firstDay.toISOString().split('T')[0]);

    Promise.all([
      billsApi.getAll(),
      returnsApi.getAll(),
      clientsApi.getAll()
    ]).then(([bls, ret, cli]) => {
      setAllBills(bls);
      setAllReturns(ret);
      setClients(cli);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (allBills.length > 0 || allReturns.length > 0) {
      calculateReport();
    }
  }, [dateFrom, dateTo, searchTerm, allBills, allReturns, clients]);

  const calculateReport = () => {
    const bills = allBills;
    const returns = allReturns;

    const allTransactions = [];

    bills.forEach(bill => {
      const dStr = bill.date || '';
      const netAmt = parseFloat(bill.net_amount) || 0;
      const recdAmt = parseFloat(bill.amountPaid) || 0; // Note: amountPaid may need separate fetch if tracking payments separately later
      
      const customer = clients.find(c => c.id === bill.customer_id) || {};
      const payMode = 'CREDIT'; // default for API until payment integration
      const mobile = customer.mobile || '';
      const name = customer.name || 'Unknown';
      const partyName = mobile ? `${mobile}, ${name}` : name;

      allTransactions.push({
        dateRaw: parseDate(dStr),
        dateStr: dStr.includes('-') ? dStr.split('-').reverse().join('/') : dStr,
        type: 'Sale',
        vchNo: bill.bill_no || '',
        partyName: partyName,
        payMode: payMode,
        netAmount: netAmt,
        recdAmount: recdAmt
      });
    });

    returns.forEach(ret => {
      const dStr = ret.date || '';
      const netAmt = parseFloat(ret.net_amount) || 0;
      const recdAmt = 0; // Usually returns don't have direct received amount in this context
      const customer = clients.find(c => c.id === ret.customer_id) || {};
      const mobile = customer.mobile || '';
      const name = customer.name || 'Unknown';
      const partyName = mobile ? `${mobile}, ${name}` : name;

      allTransactions.push({
        dateRaw: parseDate(dStr),
        dateStr: dStr.includes('-') ? dStr.split('-').reverse().join('/') : dStr,
        type: 'Return',
        vchNo: ret.return_no || '',
        partyName: partyName,
        payMode: 'RETURN',
        netAmount: -Math.abs(netAmt), // Negative for returns in summary if needed, but the printed format showed positive? Let's keep it positive or negative based on standard. Wait, the printout only shows positive net amounts. If it's a return it might just be listed. Let's make it negative to subtract from total, but display absolute? I will just make it negative.
        recdAmount: recdAmt
      });
    });

    const parsedFrom = dateFrom ? parseDate(dateFrom) : '0000-00-00';
    const parsedTo = dateTo ? parseDate(dateTo) : '9999-12-31';

    // Filter by date and search term
    const filteredTxns = allTransactions.filter(t => {
      const inDateRange = t.dateRaw >= parsedFrom && t.dateRaw <= parsedTo;
      const matchesSearch = t.partyName.toLowerCase().includes(searchTerm.toLowerCase()) || t.vchNo.toLowerCase().includes(searchTerm.toLowerCase());
      return inDateRange && matchesSearch;
    });

    // Sort by date chronological
    filteredTxns.sort((a, b) => {
      if (a.dateRaw < b.dateRaw) return -1;
      if (a.dateRaw > b.dateRaw) return 1;
      return 0;
    });

    setTransactions(filteredTxns);
    
    // Calculate Totals
    const tAmt = filteredTxns.reduce((sum, t) => sum + t.netAmount, 0);
    const tRecd = filteredTxns.reduce((sum, t) => sum + t.recdAmount, 0);
    setTotalAmount(tAmt);
    setTotalRecdAmount(tRecd);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Sales_Summary`,
  });

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Sales Summary</h1>
            <p className="text-slate-500 text-sm">View and print summary of all sales and returns.</p>
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
          <div className="flex-1 max-w-sm relative">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Search Customer / Bill No</label>
            <div className="relative">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 uppercase"
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
        </div>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-28">Date</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-32">Bill / Ret No</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400">Customer</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-28">Pay Mode</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-32 text-right">Net Amount</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-32 text-right">Recd. Amt</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((t, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1a1a2e]/50">
                    <td className="p-3 text-sm text-slate-500">{t.dateStr}</td>
                    <td className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t.vchNo} 
                      {t.type === 'Return' && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded">RET</span>}
                    </td>
                    <td className="p-3 text-sm font-bold text-slate-800 dark:text-white uppercase">{t.partyName}</td>
                    <td className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase">{t.payMode}</td>
                    <td className="p-3 text-sm text-right font-bold text-slate-800 dark:text-white">₹{Math.abs(t.netAmount).toFixed(2)}</td>
                    <td className="p-3 text-sm text-right font-bold text-green-600 dark:text-green-400">{t.recdAmount > 0 ? `₹${t.recdAmount.toFixed(2)}` : '-'}</td>
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
        
        {/* Totals Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e] flex justify-end gap-12">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Net Amount</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-end pr-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Recd Amount</span>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">₹{totalRecdAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="hidden">
        <PrintSaleSummary 
          ref={printRef} 
          transactions={transactions} 
          dateFrom={dateFrom} 
          dateTo={dateTo} 
          totalAmount={totalAmount}
          totalRecdAmount={totalRecdAmount}
        />
      </div>
    </div>
  );
}
