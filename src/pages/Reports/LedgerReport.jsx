import React, { useState, useEffect, useRef } from 'react';
import { Search, Printer, FileText } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PrintLedger from './PrintLedger';
import { clientsApi, billsApi, receiptsApi, returnsApi, banksApi } from '../../services/api';

export default function LedgerReport() {
  const [clients, setClients] = useState([]);
  const [bills, setBills] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [returns, setReturns] = useState([]);

  const [cities, setCities] = useState([]);
  const [partyTypes, setPartyTypes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [acNames, setAcNames] = useState([]);

  const [filters, setFilters] = useState({
    group: 'ALL',
    city: 'ALL',
    partyType: 'ALL',
    acName: 'ALL',
    ledgerName: '',
    fromDate: '',
    toDate: ''
  });

  const [activeSearchField, setActiveSearchField] = useState(false);
  const [activeClientIndex, setActiveClientIndex] = useState(0);

  const [isLetterFormat, setIsLetterFormat] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    Promise.all([
      clientsApi.getAll(),
      billsApi.getAll(),
      receiptsApi.getAll(),
      returnsApi.getAll(),
      banksApi.getAll()
    ]).then(([loadedClients, loadedBills, loadedReceipts, loadedReturns, loadedBanks]) => {
      // Map API fields if needed for Ledger
      const mappedClients = loadedClients.map(c => ({...c, ledgerName: c.name}));
      
      setClients(mappedClients);
      setBills(loadedBills);
      setReceipts(loadedReceipts);
      setReturns(loadedReturns);

      const uniqueCities = [...new Set(mappedClients.map(c => c.city).filter(Boolean))];
      const uniquePartyTypes = [...new Set(mappedClients.map(c => c.partyType).filter(Boolean))];
      const uniqueGroups = [...new Set(mappedClients.map(c => c.group).filter(Boolean))];
      const allBanks = loadedBanks.map(b => typeof b === 'string' ? b : b.name);
      const uniqueAcNames = [...new Set([...loadedReceipts.map(r => r.payment_mode || 'CASH').filter(Boolean), 'CASH', ...allBanks])].sort();
      
      if (!uniqueGroups.includes('Customer')) uniqueGroups.push('Customer');

      setCities(uniqueCities);
      setPartyTypes(uniquePartyTypes);
      setGroups(uniqueGroups);
      setAcNames(uniqueAcNames);
    }).catch(console.error);
  }, []);

  const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
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
    const y = String(dateObj.getFullYear()).slice(-2); 
    return `${d}/${m}/${y}`;
  };

  let transactions = [];
  let selectedClient = null;

  if (filters.ledgerName) {
    selectedClient = clients.find(c => c.ledgerName === filters.ledgerName) || { ledgerName: filters.ledgerName };
  }

  if (selectedClient && selectedClient.ledgerName) {
    let clientBills = bills.filter(b => b.customer_id === selectedClient.id);
    let clientReceipts = receipts.filter(r => r.customer_id === selectedClient.id);
    let clientReturns = returns.filter(rt => rt.customer_id === selectedClient.id);

    let allTransactions = [];

    clientBills.forEach(b => {
       allTransactions.push({
           dateObj: parseDateString(b.date),
           dateStr: b.date,
           particulars: 'SALES',
           acName: '-',
           vchType: 'Sales',
           vchNo: b.bill_no,
           debit: parseFloat(b.net_amount) || 0,
           credit: 0,
           narration: ''
       });
    });

    clientReceipts.forEach(r => {
       allTransactions.push({
           dateObj: parseDateString(r.date),
           dateStr: parseDateString(r.date) ? parseDateString(r.date).toLocaleDateString('en-GB') : r.date,
           particulars: 'RECEIPT',
           acName: r.payment_mode || 'CASH',
           vchType: 'Receipt',
           vchNo: r.receipt_no,
           debit: 0,
           credit: parseFloat(r.amount) || 0,
           narration: r.remarks || ''
       });
    });

    clientReturns.forEach(rt => {
       allTransactions.push({
           dateObj: parseDateString(rt.date),
           dateStr: rt.date,
           particulars: 'SALES RETURN',
           acName: '-',
           vchType: 'Return',
           vchNo: rt.return_no,
           debit: 0,
           credit: parseFloat(rt.net_amount) || 0,
           narration: ''
       });
    });

    allTransactions.sort((a, b) => {
        if (!a.dateObj && !b.dateObj) return 0;
        if (!a.dateObj) return -1;
        if (!b.dateObj) return 1;
        return a.dateObj - b.dateObj;
    });

    let runningBalance = 0; 
    let openingBalance = 0; 

    let fromDateObj = filters.fromDate ? new Date(filters.fromDate) : null;
    if(fromDateObj) fromDateObj.setHours(0,0,0,0);
    
    let toDateObj = filters.toDate ? new Date(filters.toDate) : null;
    if(toDateObj) toDateObj.setHours(23,59,59,999);

    allTransactions.forEach(t => {
        if (fromDateObj && t.dateObj < fromDateObj) {
            openingBalance += t.debit - t.credit;
        } else if ((!fromDateObj || t.dateObj >= fromDateObj) && (!toDateObj || t.dateObj <= toDateObj)) {
             runningBalance = (transactions.length === 0 ? openingBalance : runningBalance) + t.debit - t.credit;
             t.closingAmt = Math.abs(runningBalance).toFixed(2);
             t.closingType = runningBalance >= 0 ? 'Dr' : 'Dr';
             transactions.push(t);
        }
    });
    
    if (fromDateObj && transactions.length > 0) {
       transactions.unshift({
           dateStr: parseDateString(filters.fromDate).toLocaleDateString('en-GB'),
           particulars: 'OPENING BALANCE',
           acName: '-',
           vchType: '',
           vchNo: '',
           debit: openingBalance > 0 ? openingBalance : 0,
           credit: openingBalance < 0 ? Math.abs(openingBalance) : 0,
           closingAmt: Math.abs(openingBalance).toFixed(2),
           closingType: openingBalance >= 0 ? 'Dr' : 'Dr',
           narration: ''
       });
    }
  } else if (filters.acName && filters.acName !== 'ALL') {
    // A/C Name Report Mode
    let allTransactions = [];
    let matchingReceipts = receipts.filter(r => (r.payment_mode || 'CASH') === filters.acName);

    matchingReceipts.forEach(r => {
       let nar = '';
       if(r.narration_sno || r.narration_pg || r.narration_date) {
           nar = `sno ${r.narration_sno || ''} pg ${r.narration_pg || ''} dated ${r.narration_date || ''}`.trim();
       }
       
       const client = clients.find(c => c.id === r.customer_id);
       const custName = client ? client.ledgerName : 'UNKNOWN CUSTOMER';

       allTransactions.push({
           dateObj: parseDateString(r.date),
           dateStr: parseDateString(r.date) ? parseDateString(r.date).toLocaleDateString('en-GB') : r.date,
           particulars: custName, // Show customer name here
           acName: r.payment_mode || 'CASH',
           vchType: 'Receipt',
           vchNo: r.receipt_no,
           debit: 0,
           credit: parseFloat(r.amount) || 0,
           narration: nar
       });
    });

    allTransactions.sort((a, b) => {
        if (!a.dateObj && !b.dateObj) return 0;
        if (!a.dateObj) return -1;
        if (!b.dateObj) return 1;
        return a.dateObj - b.dateObj;
    });

    let runningBalance = 0; 
    let openingBalance = 0; 

    let fromDateObj = filters.fromDate ? new Date(filters.fromDate) : null;
    if(fromDateObj) fromDateObj.setHours(0,0,0,0);
    
    let toDateObj = filters.toDate ? new Date(filters.toDate) : null;
    if(toDateObj) toDateObj.setHours(23,59,59,999);

    allTransactions.forEach(t => {
        if (fromDateObj && t.dateObj < fromDateObj) {
            openingBalance += t.credit;
        } else if ((!fromDateObj || t.dateObj >= fromDateObj) && (!toDateObj || t.dateObj <= toDateObj)) {
             runningBalance = (transactions.length === 0 ? openingBalance : runningBalance) + t.credit;
             t.closingAmt = Math.abs(runningBalance).toFixed(2);
             t.closingType = 'Dr';
             transactions.push(t);
        }
    });
    
    if (fromDateObj && transactions.length > 0) {
       transactions.unshift({
           dateStr: parseDateString(filters.fromDate).toLocaleDateString('en-GB'),
           particulars: 'OPENING BALANCE',
           acName: '-',
           vchType: '',
           vchNo: '',
           debit: 0,
           credit: openingBalance,
           closingAmt: openingBalance.toFixed(2),
           closingType: 'Dr',
           narration: ''
       });
    }
    
    selectedClient = { ledgerName: `A/C Report: ${filters.acName}` };
  }

  let filteredClients = clients.filter(c => {
    let matches = true;
    if (filters.group && filters.group !== 'ALL') matches = matches && (c.group === filters.group);
    if (filters.city && filters.city !== 'ALL') matches = matches && (c.city === filters.city);
    if (filters.partyType && filters.partyType !== 'ALL') matches = matches && (c.partyType === filters.partyType);
    return matches;
  });

  const searchResults = filteredClients.filter(c => 
    (c.ledgerName || '').toLowerCase().includes((filters.ledgerName || '').toLowerCase()) ||
    (c.mobileNo || '').includes(filters.ledgerName || '')
  );

  // Compute summary for ALL customers if no ledger is selected
  let allCustomersSummary = [];
  if (!filters.ledgerName && (!filters.acName || filters.acName === 'ALL')) {
    let fromDateObj = filters.fromDate ? new Date(filters.fromDate) : null;
    if(fromDateObj) fromDateObj.setHours(0,0,0,0);
    let toDateObj = filters.toDate ? new Date(filters.toDate) : null;
    if(toDateObj) toDateObj.setHours(23,59,59,999);

    allCustomersSummary = filteredClients.map(c => {
      let opening = 0;
      let debit = 0;
      let credit = 0;

      // Sales
      const clientBills = bills.filter(b => b.customer_id === c.id);
      clientBills.forEach(b => {
        const dObj = parseDateString(b.date);
        const amt = parseFloat(b.net_amount) || 0;
        if (fromDateObj && dObj < fromDateObj) {
          opening += amt;
        } else if ((!fromDateObj || dObj >= fromDateObj) && (!toDateObj || dObj <= toDateObj)) {
          debit += amt;
        }
      });

      // Receipts
      const clientReceipts = receipts.filter(r => r.customer_id === c.id);
      clientReceipts.forEach(r => {
        const dObj = parseDateString(r.date);
        const amt = parseFloat(r.amount) || 0;
        if (fromDateObj && dObj < fromDateObj) {
          opening -= amt;
        } else if ((!fromDateObj || dObj >= fromDateObj) && (!toDateObj || dObj <= toDateObj)) {
          credit += amt;
        }
      });

      // Returns
      const clientReturns = returns.filter(rt => rt.customer_id === c.id);
      clientReturns.forEach(rt => {
        const dObj = parseDateString(rt.date);
        const amt = parseFloat(rt.net_amount) || 0;
        if (fromDateObj && dObj < fromDateObj) {
          opening -= amt;
        } else if ((!fromDateObj || dObj >= fromDateObj) && (!toDateObj || dObj <= toDateObj)) {
          credit += amt;
        }
      });

      const closing = opening + debit - credit;

      return {
        ...c,
        opening,
        debit,
        credit,
        closing
      };
    }).filter(c => c.opening !== 0 || c.debit !== 0 || c.credit !== 0 || c.closing !== 0);
    
    // sort alphabetically
    allCustomersSummary.sort((a,b) => (a.ledgerName||'').localeCompare(b.ledgerName||''));
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveClientIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveClientIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSearchField && searchResults.length > 0) {
        setFilters(prev => ({ ...prev, ledgerName: searchResults[activeClientIndex].ledgerName }));
        setActiveSearchField(false);
      }
    } else if (e.key === 'Escape') {
      setActiveSearchField(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveSearchField(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ledger_Report_${filters.ledgerName || filters.acName}`,
  });

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Ledger Statement</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="letterFormat"
              checked={isLetterFormat}
              onChange={(e) => setIsLetterFormat(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="letterFormat" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              Letter Format
            </label>
          </div>
        <button 
          onClick={handlePrint} 
          disabled={!filters.ledgerName && filters.acName === 'ALL'}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium flex items-center gap-2 transition-colors border-none cursor-pointer"
        >
          <Printer size={16} />
          Print Ledger
        </button>
      </div>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg p-5 mb-6 shadow-sm">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Search size={18} className="text-slate-400" /> Filter Options
        </h3>
        
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From Date</label>
              <input 
                type="date" 
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To Date</label>
              <input 
                type="date" 
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Group</label>
              <select 
                value={filters.group}
                onChange={(e) => handleFilterChange('group', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 text-sm"
              >
                <option value="ALL">ALL</option>
                {groups.map((g, i) => <option key={i} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">City</label>
              <select 
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 text-sm"
              >
                <option value="ALL">ALL</option>
                {cities.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Party Type</label>
              <select 
                value={filters.partyType}
                onChange={(e) => handleFilterChange('partyType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 text-sm"
              >
                <option value="ALL">ALL</option>
                {partyTypes.map((pt, i) => <option key={i} value={pt}>{pt}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Banks</label>
              <select 
                value={filters.acName}
                onChange={(e) => {
                  handleFilterChange('acName', e.target.value);
                  if (e.target.value !== 'ALL') handleFilterChange('ledgerName', ''); // Clear ledger when picking A/C
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 text-sm"
              >
                <option value="ALL">ALL</option>
                {acNames.map((a, i) => <option key={i} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ledger Name *</label>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="text" 
                  value={filters.ledgerName}
                  onChange={(e) => handleFilterChange('ledgerName', e.target.value)}
                  onFocus={() => { setActiveSearchField(true); setActiveClientIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Select a ledger to view..."
                  className="w-full pl-9 pr-3 py-2 border border-blue-400 dark:border-blue-500 rounded-md bg-blue-50 dark:bg-blue-900/20 text-slate-900 dark:text-slate-100 text-sm"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-blue-500" />
                
                {activeSearchField && filters.ledgerName && searchResults.length > 0 && (
                  <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white dark:bg-[#1E1E2D] border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    <ul className="py-1">
                      {searchResults.map((c, i) => (
                        <li 
                          key={i}
                          onClick={() => {
                            handleFilterChange('ledgerName', c.ledgerName);
                            setActiveSearchField(false);
                          }}
                          className={`px-3 py-2 cursor-pointer text-sm ${activeClientIndex === i ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          {c.ledgerName} {c.mobileNo && `(${c.mobileNo})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* RESULTS TABLE */}
      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        {filters.ledgerName || (filters.acName && filters.acName !== 'ALL') ? (
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-100 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Date</th>
                    <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Particulars</th>
                    <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">A/C Name</th>
                    <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Vch Type</th>
                    <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Vch No</th>
                    <th className="p-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Debit</th>
                    <th className="p-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Credit</th>
                    <th className="p-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Closing</th>
                </tr>
                </thead>
                <tbody>
                {transactions.length > 0 ? (
                    transactions.map((t, index) => (
                    <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1E1E2D]/50 transition-colors">
                        <td className="p-3 text-sm text-slate-500 whitespace-nowrap">{t.dateStr}</td>
                        <td className="p-3 text-sm font-medium text-slate-900 dark:text-white uppercase">
                            {t.particulars}
                            {t.narration && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-normal italic mt-0.5 whitespace-pre-wrap">{t.narration}</div>
                            )}
                        </td>
                        <td className="p-3 text-sm text-slate-700 dark:text-slate-300 font-semibold">{t.acName}</td>
                        <td className="p-3 text-sm text-slate-700 dark:text-slate-300">{t.vchType}</td>
                        <td className="p-3 text-sm text-slate-700 dark:text-slate-300">{t.vchNo}</td>
                        <td className="p-3 text-sm text-right font-medium text-slate-700 dark:text-slate-300">
                            {t.debit ? t.debit.toFixed(2) : ''}
                        </td>
                        <td className="p-3 text-sm text-right font-medium text-slate-700 dark:text-slate-300">
                            {t.credit ? t.credit.toFixed(2) : ''}
                        </td>
                        <td className="p-3 text-sm text-right font-bold text-slate-900 dark:text-white">
                            {t.closingAmt} <span className="text-xs font-normal text-slate-500">{t.closingType}</span>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 dark:text-slate-400">
                        No transactions found for this ledger in the selected period.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Customer Name</th>
                    <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Group</th>
                    <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">City</th>
                    <th className="p-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Opening</th>
                    <th className="p-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Debit</th>
                    <th className="p-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Credit</th>
                    <th className="p-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {allCustomersSummary.length > 0 ? (
                    allCustomersSummary.map((c, index) => (
                      <tr 
                        key={index} 
                        className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1E1E2D]/50 transition-colors cursor-pointer"
                        onClick={() => handleFilterChange('ledgerName', c.ledgerName)}
                      >
                        <td className="p-3 text-sm font-bold text-blue-600 dark:text-blue-400 uppercase">{c.ledgerName}</td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{c.group || '-'}</td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{c.city || '-'}</td>
                        <td className="p-3 text-sm text-right font-medium text-slate-700 dark:text-slate-300">
                          {c.opening !== 0 ? `${Math.abs(c.opening).toFixed(2)} ${c.opening > 0 ? 'Dr' : 'Cr'}` : '0.00'}
                        </td>
                        <td className="p-3 text-sm text-right font-medium text-slate-700 dark:text-slate-300">
                          {c.debit !== 0 ? c.debit.toFixed(2) : '0.00'}
                        </td>
                        <td className="p-3 text-sm text-right font-medium text-slate-700 dark:text-slate-300">
                          {c.credit !== 0 ? c.credit.toFixed(2) : '0.00'}
                        </td>
                        <td className="p-3 text-sm text-right font-bold text-slate-900 dark:text-white">
                          {c.closing !== 0 ? `${Math.abs(c.closing).toFixed(2)} ${c.closing > 0 ? 'Dr' : 'Cr'}` : '0.00'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-slate-500 dark:text-slate-400">
                        <Search size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No Customers Found</h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">No ledger balances found for the selected filters in this period.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        )}
      </div>

      <div className="hidden">
        <PrintLedger ref={printRef} data={transactions} filters={filters} selectedClient={selectedClient} isLetterFormat={isLetterFormat} />
      </div>

    </div>
  );
}
