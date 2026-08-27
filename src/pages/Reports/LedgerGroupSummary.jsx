import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FileText, Printer, Search } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { billsApi, clientsApi, receiptsApi, returnsApi, banksApi } from '../../services/api';

const parseDateString = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
    const parts = dateStr.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) return new Date(parts[2], parts[1] - 1, parts[0]);
    return new Date(parts[2], parts[1] - 1, parts[0]); // assuming dd/mm/yyyy
  }
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) return isoDate;
  return null;
};

const formatDate = (dateObj) => {
  if (!dateObj) return '';
  const d = String(dateObj.getDate()).padStart(2, '0');
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const y = String(dateObj.getFullYear()).slice(-2); 
  return `${d}/${m}/${y}`;
};

// Component for printing
const PrintLedgerGroupSummary = React.forwardRef(({ reportData, dateFrom, dateTo, selectedGroup }, ref) => {
  const printDate = new Date().toLocaleDateString('en-GB');
  
  const formattedFrom = dateFrom ? parseDateString(dateFrom)?.toLocaleDateString('en-GB') : '';
  const formattedTo = dateTo ? parseDateString(dateTo)?.toLocaleDateString('en-GB') : '';
  const dateRangeStr = (formattedFrom || formattedTo) 
    ? `${formattedFrom || 'Start'} - ${formattedTo || 'Today'}`
    : 'All Time';

  let totalOpening = 0;
  let totalDebit = 0;
  let totalCredit = 0;
  let totalClosing = 0;

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

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 uppercase">LEDGER GROUP SUMMARY REPORT</h2>
      </div>

      <div className="flex justify-between items-end mb-2 text-sm font-semibold text-slate-800">
        <div>Ledger Group Summary for the Period of {dateRangeStr}</div>
        <div className="text-xs">Print Date : {printDate}</div>
      </div>

      <table className="print-table text-xs w-full">
        <thead>
          <tr className="print-header font-bold text-left text-slate-800 uppercase">
            <th className="w-12 text-center border-r border-slate-400">S.NO</th>
            <th className="border-r border-slate-400">PARTICULARS</th>
            <th className="w-28 text-right border-r border-slate-400">OPENING</th>
            <th className="w-24 text-right border-r border-slate-400">DEBIT</th>
            <th className="w-24 text-right border-r border-slate-400">CREDIT</th>
            <th className="w-32 text-right">CLOSING</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, index) => {
            totalOpening += row.opening;
            totalDebit += row.debit;
            totalCredit += row.credit;
            totalClosing += row.closing;

            return (
              <tr key={index} className="text-slate-900 border-b border-slate-200">
                <td className="text-center border-r border-slate-300 py-2">{index + 1}</td>
                <td className="border-r border-slate-300 uppercase font-semibold">{row.name}</td>
                <td className="text-right border-r border-slate-300">{Math.abs(row.opening).toFixed(2)} {row.opening >= 0 ? (row.opening === 0 ? '' : 'Dr') : 'Cr'}</td>
                <td className="text-right border-r border-slate-300">{row.debit > 0 ? row.debit.toFixed(2) : '0.00'}</td>
                <td className="text-right border-r border-slate-300">{row.credit > 0 ? row.credit.toFixed(2) : '0.00'}</td>
                <td className="text-right font-bold">{Math.abs(row.closing).toFixed(2)} {row.closing >= 0 ? 'Dr' : 'Cr'}</td>
              </tr>
            );
          })}

          {reportData.length === 0 && (
            <tr>
              <td colSpan="6" className="p-6 text-center text-slate-500">No ledgers found for this group.</td>
            </tr>
          )}

          {reportData.length > 0 && (
            <tr className="font-bold border-t-2 border-b-2 border-slate-800 text-sm text-slate-900 bg-slate-50">
              <td colSpan="2" className="text-center py-3 border-r border-slate-400">TOTAL</td>
              <td className="text-right py-3 border-r border-slate-400">{Math.abs(totalOpening).toFixed(2)} {totalOpening >= 0 ? 'Dr' : 'Cr'}</td>
              <td className="text-right py-3 border-r border-slate-400">{totalDebit.toFixed(2)}</td>
              <td className="text-right py-3 border-r border-slate-400">{totalCredit.toFixed(2)}</td>
              <td className="text-right py-3">{Math.abs(totalClosing).toFixed(2)} {totalClosing >= 0 ? 'Dr' : 'Cr'}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default function LedgerGroupSummary() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGroup, setSelectedGroup] = useState('Bank Accounts');
  const [selectedLedger, setSelectedLedger] = useState('ALL');
  
  const [reportData, setReportData] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [availableLedgers, setAvailableLedgers] = useState([]);
  
  const printRef = useRef();

  const [allData, setAllData] = useState({ clients: [], bills: [], receipts: [], returns: [], banks: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, billsData, receiptsData, returnsData, banksData] = await Promise.all([
          clientsApi.getAll(),
          billsApi.getAll(),
          receiptsApi.getAll(),
          returnsApi.getAll(),
          banksApi.getAll()
        ]);
        
        const mappedBills = billsData.map(b => {
          const customer = clientsData.find(c => c.id === b.customer_id);
          return {
            ...b,
            billInfo: { billNo: b.bill_no, date: b.date },
            customer: customer || {},
            totals: { amount: b.net_amount }
          };
        });

        const mappedClients = clientsData.map(c => ({
          ...c,
          ledgerName: c.name,
          group: c.group_name || 'Customer'
        }));
        
        const mappedReceipts = receiptsData.map(r => {
          const customer = clientsData.find(c => c.id === r.customer_id);
          return {
            ...r,
            customerName: customer ? customer.name : '',
            accountName: r.payment_mode || 'CASH'
          };
        });

        setAllData({
          clients: mappedClients,
          bills: mappedBills,
          receipts: mappedReceipts,
          returns: returnsData,
          banks: banksData
        });

        const now = new Date();
        setDateFrom(now.toISOString().split('T')[0]);

        const clientGroups = [...new Set(mappedClients.map(c => c.group).filter(Boolean))];
        if (!clientGroups.includes('Customer')) clientGroups.push('Customer');
        
        const allGroups = ['Bank Accounts', ...clientGroups].sort();
        setAvailableGroups(allGroups);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Update available ledgers when group changes
  useEffect(() => {
    setSelectedLedger('ALL'); // Reset ledger when group changes
    
    if (selectedGroup === 'Bank Accounts') {
      const receipts = allData.receipts;
      const allBanks = allData.banks.map(b => typeof b === 'string' ? b : b.name);
      const uniqueAcNames = [...new Set([...receipts.map(r => r.accountName || 'CASH').filter(Boolean), 'CASH', ...allBanks])];
      setAvailableLedgers(uniqueAcNames.sort());
    } else {
      const clients = allData.clients;
      const groupClients = clients.filter(c => c.group === selectedGroup).map(c => c.ledgerName).filter(Boolean);
      setAvailableLedgers([...new Set(groupClients)].sort());
    }
  }, [selectedGroup, allData]);

  useEffect(() => {
    calculateReport();
  }, [dateFrom, dateTo, selectedGroup, selectedLedger]);

  const calculateReport = () => {
    const clients = allData.clients;
    const bills = allData.bills;
    const receipts = allData.receipts;
    const returns = allData.returns;

    let fromDateObj = dateFrom ? new Date(dateFrom) : null;
    if(fromDateObj) fromDateObj.setHours(0,0,0,0);
    
    let toDateObj = dateTo ? new Date(dateTo) : null;
    if(toDateObj) toDateObj.setHours(23,59,59,999);

    let ledgersToProcess = [];

    if (selectedGroup === 'Bank Accounts') {
      if (selectedLedger === 'ALL') {
        ledgersToProcess = availableLedgers.map(name => ({ name, type: 'Bank' }));
      } else {
        ledgersToProcess = [{ name: selectedLedger, type: 'Bank' }];
      }
    } else {
      if (selectedLedger === 'ALL') {
        ledgersToProcess = availableLedgers.map(name => ({ name, type: 'Client' }));
      } else {
        ledgersToProcess = [{ name: selectedLedger, type: 'Client' }];
      }
    }

    const reportRows = [];

    ledgersToProcess.forEach(ledger => {
      let opening = 0;
      let debit = 0;
      let credit = 0;

      if (ledger.type === 'Bank') {
        const ledgerReceipts = receipts.filter(r => (r.accountName || 'CASH') === ledger.name);
        
        ledgerReceipts.forEach(r => {
          const dObj = parseDateString(r.date);
          const amt = parseFloat(r.amount) || 0;
          
          if (fromDateObj && dObj < fromDateObj) {
            opening += amt; // Receipt to Bank is Debit
          } else if ((!fromDateObj || dObj >= fromDateObj) && (!toDateObj || dObj <= toDateObj)) {
            debit += amt;
          }
        });
      } else {
        // Client logic
        const ledgerBills = bills.filter(b => b.customer?.name === ledger.name);
        const ledgerReceipts = receipts.filter(r => r.customerName === ledger.name);
        const ledgerReturns = returns.filter(rt => rt.customer?.name === ledger.name);

        ledgerBills.forEach(b => {
          const dObj = parseDateString(b.billInfo?.date);
          const amt = parseFloat(b.totals?.amount) || 0;
          if (fromDateObj && dObj < fromDateObj) opening += amt;
          else if ((!fromDateObj || dObj >= fromDateObj) && (!toDateObj || dObj <= toDateObj)) debit += amt;
        });

        ledgerReceipts.forEach(r => {
          const dObj = parseDateString(r.date);
          const amt = parseFloat(r.amount) || 0;
          if (fromDateObj && dObj < fromDateObj) opening -= amt;
          else if ((!fromDateObj || dObj >= fromDateObj) && (!toDateObj || dObj <= toDateObj)) credit += amt;
        });

        ledgerReturns.forEach(rt => {
          const dObj = parseDateString(rt.returnInfo?.date);
          const amt = parseFloat(rt.totals?.amount) || 0;
          if (fromDateObj && dObj < fromDateObj) opening -= amt;
          else if ((!fromDateObj || dObj >= fromDateObj) && (!toDateObj || dObj <= toDateObj)) credit += amt;
        });
      }

      const closing = opening + debit - credit;

      // Only include ledger if it has some activity or balance
      if (opening !== 0 || debit !== 0 || credit !== 0 || closing !== 0) {
        reportRows.push({
          name: ledger.name,
          opening,
          debit,
          credit,
          closing
        });
      }
    });

    setReportData(reportRows);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ledger_Group_Summary_${selectedGroup}`,
  });

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Ledger Group Summary</h1>
            <p className="text-slate-500 text-sm">View summary of balances for all ledgers under a specific group.</p>
          </div>
        </div>
        
        <button 
          onClick={handlePrint}
          disabled={reportData.length === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer border-none"
        >
          <Printer size={18} />
          Print Report
        </button>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          
          <div className="flex-1 max-w-[200px] relative">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 uppercase cursor-pointer"
            >
              {availableGroups.map((grp, idx) => (
                <option key={idx} value={grp}>{grp}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 max-w-sm relative">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{selectedGroup === 'Bank Accounts' ? 'Select Bank' : 'Select Ledger'}</label>
            <select
              value={selectedLedger}
              onChange={(e) => setSelectedLedger(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 uppercase cursor-pointer"
            >
              <option value="ALL">{selectedGroup === 'Bank Accounts' ? '-- ALL BANKS --' : '-- ALL LEDGERS --'}</option>
              {availableLedgers.map((ldr, idx) => (
                <option key={idx} value={ldr}>{ldr}</option>
              ))}
            </select>
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

      {/* Screen Preview */}
      <div className="bg-white dark:bg-[#1E1E2D] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col p-2 overflow-x-auto">
         <div className="min-w-[800px] flex justify-center py-4 bg-slate-200 dark:bg-slate-900">
           <div className="shadow-2xl max-w-4xl w-full">
             <PrintLedgerGroupSummary 
                ref={printRef} 
                reportData={reportData} 
                dateFrom={dateFrom} 
                dateTo={dateTo} 
                selectedGroup={selectedGroup}
              />
           </div>
         </div>
      </div>
    </div>
  );
}
