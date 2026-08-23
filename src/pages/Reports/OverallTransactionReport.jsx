import React, { useState, useEffect, useRef } from 'react';
import { FileText, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const parseDateString = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
    const parts = dateStr.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) return new Date(parts[2], parts[1] - 1, parts[0]);
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) return isoDate;
  return null;
};

const formatDate = (dateObj) => {
  if (!dateObj) return '';
  const d = String(dateObj.getDate()).padStart(2, '0');
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const y = String(dateObj.getFullYear()); 
  return `${d}/${m}/${y}`;
};

// Component for printing
const PrintOverallTransactionReport = React.forwardRef(({ reportData, reportDate }, ref) => {
  const printDateStr = reportDate ? formatDate(parseDateString(reportDate)) : '';
  
  return (
    <div ref={ref} className="p-8 bg-white text-black min-h-screen print:p-4" style={{ fontFamily: 'Arial, sans-serif' }}>
      <style type="text/css" media="print">
        {`
          @page { size: A4 portrait; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; color-adjust: exact; }
          .print-table th, .print-table td { border: 1px solid #999; padding: 6px 8px; }
          .print-table { width: 100%; border-collapse: collapse; }
          .section-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 4px; }
          .header-row { background-color: #6482B9; color: white !important; font-weight: bold; }
          .sub-header { background-color: #5680c1; color: white !important; font-weight: bold; }
          /* Ensure colors print */
          @media print {
            .header-row th { background-color: #6482B9 !important; color: white !important; }
            .sub-header td { background-color: #5680c1 !important; color: white !important; }
          }
        `}
      </style>

      <div className="flex justify-between items-center mb-4 border-b border-slate-300 pb-2">
        <h2 className="section-title text-slate-700">Overall Transaction Report</h2>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 border border-slate-400 bg-slate-100 rounded text-sm font-semibold">
            Up to {printDateStr}
          </div>
        </div>
      </div>

      <table className="print-table text-sm w-full border border-slate-400 shadow-sm">
        <thead>
          <tr className="header-row bg-[#6482B9] text-white">
            <th className="text-left w-1/2">Descriptions</th>
            <th className="text-right w-1/4">Debit</th>
            <th className="text-right w-1/4">Credit</th>
          </tr>
        </thead>
        <tbody>
          <tr className="sub-header bg-[#5680c1] text-white">
            <td colSpan="3">Opening Payment</td>
          </tr>
          <tr>
            <td className="font-semibold text-blue-900 border-t-0 border-b-0 border-r border-slate-400"></td>
            <td className="text-right border-t-0 border-b-0 border-r border-slate-400"></td>
            <td className="text-right border-t-0 border-b-0">00.00</td>
          </tr>
          
          <tr className="border-t border-slate-400">
            <td className="border-r border-slate-400">Sales Bill - Bill Nos {reportData.salesBillNos}</td>
            <td className="text-right border-r border-slate-400">{reportData.salesAmount > 0 ? reportData.salesAmount.toFixed(2) : '00.00'}</td>
            <td className="text-right">00.00</td>
          </tr>
          
          <tr className="border-t border-slate-400">
            <td className="border-r border-slate-400">Sales Return - Ret. Nos {reportData.salesReturnNos}</td>
            <td className="text-right border-r border-slate-400">00.00</td>
            <td className="text-right">{reportData.returnsAmount > 0 ? reportData.returnsAmount.toFixed(2) : '00.00'}</td>
          </tr>
          
          <tr className="border-t border-slate-400">
            <td className="border-r border-slate-400">Receipt - Rcpt No. {reportData.receiptNos}</td>
            <td className="text-right border-r border-slate-400"></td>
            <td className="text-right">{reportData.receiptsAmount > 0 ? reportData.receiptsAmount.toFixed(2) : ''}</td>
          </tr>
          
          <tr className="border-t border-slate-400">
            <td className="border-r border-slate-400">Shortage Discount</td>
            <td className="text-right border-r border-slate-400"></td>
            <td className="text-right">{reportData.discountAmount > 0 ? reportData.discountAmount.toFixed(2) : ''}</td>
          </tr>
          
          <tr className="border-t border-slate-400">
            <td className="border-r border-slate-400">Payment - Paym No. ()</td>
            <td className="text-right border-r border-slate-400"></td>
            <td className="text-right"></td>
          </tr>
          
          <tr className="font-bold border-t-2 border-slate-500 bg-slate-50">
            <td className="border-r border-slate-400">Total</td>
            <td className="text-right border-r border-slate-400">{reportData.totalDebit.toFixed(2)}</td>
            <td className="text-right">{reportData.totalCredit.toFixed(2)}</td>
          </tr>
          
          <tr className="border-t border-slate-400 font-bold bg-slate-100">
            <td className="border-r border-slate-400">Closing Balance</td>
            <td className="text-right border-r border-slate-400">
              {reportData.closingBalance >= 0 ? reportData.closingBalance.toFixed(2) : ''}
            </td>
            <td className="text-right">
               {reportData.closingBalance < 0 ? Math.abs(reportData.closingBalance).toFixed(2) : ''}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

export default function OverallTransactionReport() {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState({
    salesAmount: 0,
    salesBillNos: '()',
    returnsAmount: 0,
    salesReturnNos: '()',
    receiptsAmount: 0,
    receiptNos: '()',
    discountAmount: 0,
    totalDebit: 0,
    totalCredit: 0,
    closingBalance: 0
  });
  
  const printRef = useRef();

  useEffect(() => {
    calculateReport();
  }, [reportDate]);

  const getMinMaxStr = (items, noSelector) => {
    if (items.length === 0) return '()';
    const nos = items.map(i => {
      const num = parseInt(noSelector(i));
      return isNaN(num) ? null : num;
    }).filter(n => n !== null);
    
    if (nos.length === 0) return '()';
    if (nos.length === 1) return `(${nos[0]})`;
    
    const min = Math.min(...nos);
    const max = Math.max(...nos);
    return min === max ? `(${min})` : `(${min} - ${max})`;
  };

  const calculateReport = () => {
    const bills = JSON.parse(localStorage.getItem('bills') || '[]');
    const receipts = JSON.parse(localStorage.getItem('receipts') || '[]');
    const returns = JSON.parse(localStorage.getItem('returns') || '[]');

    let targetDateObj = reportDate ? new Date(reportDate) : null;
    if(targetDateObj) targetDateObj.setHours(23,59,59,999);
    
    let totalSales = 0;
    let totalReturns = 0;
    let totalReceipts = 0;
    let totalDiscounts = 0;
    
    let validBills = [];
    let validReceipts = [];
    let validReturns = [];

    // Calculate Bills (Debit) up to selected date
    bills.forEach(b => {
      const dObj = parseDateString(b.billInfo?.date);
      const amt = parseFloat(b.totals?.amount) || 0;
      if (dObj && targetDateObj && dObj <= targetDateObj) {
        totalSales += amt;
        validBills.push(b);
      }
    });

    // Calculate Receipts & Discounts (Credit) up to selected date
    receipts.forEach(r => {
      const dObj = parseDateString(r.date);
      const amt = parseFloat(r.amount) || 0;
      const shortage = parseFloat(r.shortage) || 0;
      
      if (dObj && targetDateObj && dObj <= targetDateObj) {
        totalReceipts += amt;
        totalDiscounts += shortage;
        validReceipts.push(r);
      }
    });

    // Calculate Returns (Credit) up to selected date
    returns.forEach(rt => {
      const dObj = parseDateString(rt.returnInfo?.date);
      const amt = parseFloat(rt.totals?.amount) || 0;
      if (dObj && targetDateObj && dObj <= targetDateObj) {
        totalReturns += amt;
        validReturns.push(rt);
      }
    });
    
    let totalDebit = totalSales;
    let totalCredit = totalReturns + totalReceipts + totalDiscounts;
    
    const closingBalance = totalDebit - totalCredit;

    setReportData({
      salesAmount: totalSales,
      salesBillNos: getMinMaxStr(validBills, b => b.billInfo?.billNo),
      returnsAmount: totalReturns,
      salesReturnNos: getMinMaxStr(validReturns, rt => rt.returnInfo?.returnNo),
      receiptsAmount: totalReceipts,
      receiptNos: getMinMaxStr(validReceipts, r => r.voucherNo),
      discountAmount: totalDiscounts,
      totalDebit,
      totalCredit,
      closingBalance
    });
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Overall_Transaction_Report_${reportDate}`,
  });

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Overall Transaction Report</h1>
            <p className="text-slate-500 text-sm">View and print summary of all transactions from the beginning up to the selected date.</p>
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
        <div className="flex items-end gap-4 max-w-sm">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Up to Date</label>
            <input 
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none"
            />
          </div>
          <button 
            onClick={calculateReport}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-md font-semibold transition-colors cursor-pointer border-none"
          >
            GO
          </button>
        </div>
      </div>

      {/* Screen Preview */}
      <div className="bg-white dark:bg-[#1E1E2D] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col p-2 overflow-x-auto">
         <div className="min-w-[800px] flex justify-center py-4 bg-slate-200 dark:bg-slate-900">
           <div className="shadow-2xl max-w-4xl w-full">
             <PrintOverallTransactionReport 
                ref={printRef} 
                reportData={reportData} 
                reportDate={reportDate} 
              />
           </div>
         </div>
      </div>
    </div>
  );
}
