import React, { useState, useEffect, useRef } from 'react';
import { Search, Printer, FileText } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PrintLedger from './PrintLedger';

export default function LedgerReport() {
  const [clients, setClients] = useState([]);
  const [bills, setBills] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [returns, setReturns] = useState([]);

  const [cities, setCities] = useState([]);
  const [partyTypes, setPartyTypes] = useState([]);
  const [groups, setGroups] = useState([]);

  const [filters, setFilters] = useState({
    group: 'Customer',
    city: 'ALL',
    partyType: 'ALL',
    ledgerName: '',
    fromDate: '',
    toDate: ''
  });

  const [activeSearchField, setActiveSearchField] = useState(false);
  const [activeClientIndex, setActiveClientIndex] = useState(0);

  const printRef = useRef();

  useEffect(() => {
    const loadedClients = JSON.parse(localStorage.getItem('clients') || '[]');
    const loadedBills = JSON.parse(localStorage.getItem('bills') || '[]');
    const loadedReceipts = JSON.parse(localStorage.getItem('receipts') || '[]');
    const loadedReturns = JSON.parse(localStorage.getItem('returns') || '[]');

    setClients(loadedClients);
    setBills(loadedBills);
    setReceipts(loadedReceipts);
    setReturns(loadedReturns);

    // Extract unique cities, party types, and groups
    const uniqueCities = [...new Set(loadedClients.map(c => c.city).filter(Boolean))];
    const uniquePartyTypes = [...new Set(loadedClients.map(c => c.partyType).filter(Boolean))];
    const uniqueGroups = [...new Set(loadedClients.map(c => c.group).filter(Boolean))];
    
    if (!uniqueGroups.includes('Customer')) uniqueGroups.push('Customer');

    setCities(uniqueCities);
    setPartyTypes(uniquePartyTypes);
    setGroups(uniqueGroups);
  }, []);

  const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return null;
  };

  // Compute stats for each client
  const clientsWithStats = clients.map(client => {
    let clientBills = bills.filter(b => b.customer?.name === client.ledgerName);
    let clientReceipts = receipts.filter(r => r.customerName === client.ledgerName);
    let clientReturns = returns.filter(rt => rt.customer?.name === client.ledgerName);

    if (filters.fromDate) {
      const fromDateObj = new Date(filters.fromDate);
      fromDateObj.setHours(0, 0, 0, 0);
      clientBills = clientBills.filter(b => {
        const d = parseDateString(b.billInfo?.date);
        return d ? d >= fromDateObj : true;
      });
      clientReceipts = clientReceipts.filter(r => {
        const d = parseDateString(r.date);
        return d ? d >= fromDateObj : true;
      });
      clientReturns = clientReturns.filter(rt => {
        const d = parseDateString(rt.returnInfo?.date);
        return d ? d >= fromDateObj : true;
      });
    }

    if (filters.toDate) {
      const toDateObj = new Date(filters.toDate);
      toDateObj.setHours(23, 59, 59, 999);
      clientBills = clientBills.filter(b => {
        const d = parseDateString(b.billInfo?.date);
        return d ? d <= toDateObj : true;
      });
      clientReceipts = clientReceipts.filter(r => {
        const d = parseDateString(r.date);
        return d ? d <= toDateObj : true;
      });
      clientReturns = clientReturns.filter(rt => {
        const d = parseDateString(rt.returnInfo?.date);
        return d ? d <= toDateObj : true;
      });
    }

    const totalPurchases = clientBills.reduce((sum, b) => sum + (parseFloat(b.totals?.amount) || 0), 0);
    const totalPaid = clientReceipts.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    const totalReturns = clientReturns.reduce((sum, rt) => sum + (parseFloat(rt.totals?.amount) || 0), 0);
    
    // balanceDue = totalPurchases - totalPaid because totalPurchases is already net of returns (original bill is modified)
    const balanceDue = totalPurchases - totalPaid;

    return {
      ...client,
      totalPurchases,
      totalPaid,
      totalReturns,
      balanceDue
    };
  });

  // Filter clients based on selections
  let filteredData = clientsWithStats.filter(c => {
    let matches = true;
    if (filters.group && filters.group !== 'ALL') {
      matches = matches && (c.group === filters.group);
    }
    if (filters.city && filters.city !== 'ALL') {
      matches = matches && (c.city === filters.city);
    }
    if (filters.partyType && filters.partyType !== 'ALL') {
      matches = matches && (c.partyType === filters.partyType);
    }
    // Strict name match if selected from autocomplete, else includes
    if (filters.ledgerName) {
      matches = matches && (
        (c.ledgerName || '').toLowerCase().includes(filters.ledgerName.toLowerCase()) ||
        (c.mobileNo || '').includes(filters.ledgerName)
      );
    }
    return matches;
  });

  // Autocomplete matching list
  const searchResults = clients.filter(c => 
    (c.ledgerName || '').toLowerCase().includes((filters.ledgerName || '').toLowerCase()) ||
    (c.mobileNo || '').includes(filters.ledgerName || '')
  );

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

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveSearchField(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ledger_Report_${new Date().toISOString().split('T')[0]}`,
  });

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Ledger Report</h1>
            <p className="text-slate-500 text-sm">View and print customer ledger summaries and balances.</p>
          </div>
        </div>
        <button 
          onClick={handlePrint} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2 transition-colors border-none cursor-pointer"
        >
          <Printer size={18} /> Print Report
        </button>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
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

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ledger Name / Mobile</label>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <input 
                type="text" 
                value={filters.ledgerName}
                onChange={(e) => handleFilterChange('ledgerName', e.target.value)}
                onFocus={() => { setActiveSearchField(true); setActiveClientIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search name or number..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 text-sm"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              
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

      {/* RESULTS TABLE */}
      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">S.No</th>
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Ledger Name</th>
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">City</th>
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Party Type</th>
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Mobile No</th>
                <th className="p-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Total Purchases</th>
                <th className="p-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Total Returns</th>
                <th className="p-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Total Paid</th>
                <th className="p-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Balance Due</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((client, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1E1E2D]/50 transition-colors">
                    <td className="p-3 text-sm text-slate-500">{index + 1}</td>
                    <td className="p-3 text-sm font-medium text-slate-900 dark:text-white uppercase">{client.ledgerName}</td>
                    <td className="p-3 text-sm text-slate-700 dark:text-slate-300 uppercase">{client.city || '-'}</td>
                    <td className="p-3 text-sm text-slate-700 dark:text-slate-300">{client.partyType || '-'}</td>
                    <td className="p-3 text-sm text-slate-700 dark:text-slate-300">{client.mobileNo || '-'}</td>
                    <td className="p-3 text-sm text-right font-medium text-blue-600 dark:text-blue-400">₹{client.totalPurchases.toFixed(2)}</td>
                    <td className="p-3 text-sm text-right font-medium text-orange-500 dark:text-orange-400">₹{client.totalReturns.toFixed(2)}</td>
                    <td className="p-3 text-sm text-right font-medium text-green-600 dark:text-green-400">₹{client.totalPaid.toFixed(2)}</td>
                    <td className="p-3 text-sm text-right font-bold text-red-600 dark:text-red-400">₹{client.balanceDue.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No ledger data found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 dark:bg-[#1a1a2e]">
                  <td colSpan="5" className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">TOTAL:</td>
                  <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400 text-base">
                    ₹{filteredData.reduce((sum, c) => sum + c.totalPurchases, 0).toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-bold text-orange-500 dark:text-orange-400 text-base">
                    ₹{filteredData.reduce((sum, c) => sum + c.totalReturns, 0).toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-bold text-green-600 dark:text-green-400 text-base">
                    ₹{filteredData.reduce((sum, c) => sum + c.totalPaid, 0).toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-bold text-red-600 dark:text-red-400 text-base">
                    ₹{filteredData.reduce((sum, c) => sum + c.balanceDue, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Hidden Print Component */}
      <div className="hidden">
        <PrintLedger ref={printRef} data={filteredData} filters={filters} />
      </div>

    </div>
  );
}
