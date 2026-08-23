import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';

const PrintCustomerLabels = React.forwardRef(({ clients, getClientAliases }, ref) => {
  return (
    <div ref={ref} className="bg-white text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      <style type="text/css" media="print">
        {`
          @page { size: A4 portrait; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; color-adjust: exact; }
          .label-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
          .label-cell { border: 1px solid #ccc; padding: 4mm; height: 42mm; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; page-break-inside: avoid; margin-bottom: 4mm; }
          .label-text { font-size: 12px; line-height: 1.4; }
          .alias-text { font-size: 11px; font-weight: bold; text-align: right; margin-top: auto; border-top: 1px dashed #ccc; padding-top: 2px; }
        `}
      </style>
      
      <div className="label-grid p-2 print:p-0">
        {clients.map((c, i) => {
          const aliases = getClientAliases(c.ledgerName);
          return (
            <div key={i} className="label-cell rounded-sm shadow-sm print:shadow-none print:rounded-none bg-white">
              <div className="label-text">
                {c.contactPerson && <div className="uppercase">{c.contactPerson}</div>}
                <div className="uppercase">{c.ledgerName}</div>
                {c.address && <div className="uppercase">{c.address}</div>}
                <div className="uppercase">
                  {c.city || ''} {c.pincode ? `- ${c.pincode}` : ''}
                </div>
                {c.district && <div className="uppercase">{c.district} District</div>}
                <div className="mt-1">
                  {c.phoneNo ? `Phone No : ${c.phoneNo} ` : ''} 
                  {c.mobileNo ? `Mobile No : ${c.mobileNo}` : ''}
                </div>
              </div>
              <div className="alias-text text-slate-700 min-h-[16px]">
                {aliases}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default function CustomerReport() {
  const [clients, setClients] = useState([]);
  const [bills, setBills] = useState([]);
  const [receipts, setReceipts] = useState([]);
  
  // Filter States
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedRepType, setSelectedRepType] = useState('CITY');
  const [selectedPartyType, setSelectedPartyType] = useState('ALL');
  const [isAllPartyType, setIsAllPartyType] = useState(true);
  
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(true);
  const [isActiveList, setIsActiveList] = useState(false);

  const printRef = useRef();

  useEffect(() => {
    const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
    setClients(savedClients);
    const savedBills = JSON.parse(localStorage.getItem('bills') || '[]');
    setBills(savedBills);
    const savedReceipts = JSON.parse(localStorage.getItem('receipts') || '[]');
    setReceipts(savedReceipts);
  }, []);

  // Unique options for dropdowns
  const groups = useMemo(() => {
    const vals = clients.map(c => c.group).filter(Boolean);
    return [...new Set(vals)].sort();
  }, [clients]);

  const partyTypes = useMemo(() => {
    const vals = clients.map(c => c.partyType).filter(Boolean);
    return [...new Set(vals)].sort();
  }, [clients]);

  // Options list based on Rep. Type (City or District)
  const availableOptions = useMemo(() => {
    let vals = [];
    if (selectedRepType === 'CITY') {
      vals = clients.map(c => c.city).filter(Boolean);
    } else {
      vals = clients.map(c => c.district).filter(Boolean);
    }
    return [...new Set(vals)].sort();
  }, [clients, selectedRepType]);

  // When Rep Type changes, reset selection
  useEffect(() => {
    setSelectedOptions([]);
    setIsAllSelected(true);
  }, [selectedRepType]);

  const currentYear = new Date().getFullYear();

  // Pre-calculate pending balances if "PAYMENT PENDING" is selected
  const customerPendingMap = useMemo(() => {
    if (selectedType !== 'PAYMENT PENDING') return {};
    
    const billRecdMap = {};
    receipts.forEach(receipt => {
      if (receipt.allocations) {
        Object.entries(receipt.allocations).forEach(([billId, alloc]) => {
          if (!billRecdMap[billId]) billRecdMap[billId] = 0;
          billRecdMap[billId] += parseFloat(alloc) || 0;
        });
      }
    });

    const pendingMap = {};
    bills.forEach(bill => {
      const custName = bill.customer?.name;
      if (!custName) return;
      
      const billAmt = parseFloat(bill.totals?.amount) || 0;
      const recdAmt = billRecdMap[bill.id] || 0;
      const pendingAmt = billAmt - recdAmt;
      
      if (!pendingMap[custName]) pendingMap[custName] = 0;
      pendingMap[custName] += pendingAmt;
    });
    
    return pendingMap;
  }, [selectedType, bills, receipts]);

  // Filtered Data
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchType = (selectedType === 'ALL') || 
                        (selectedType === 'PAYMENT PENDING' ? true : c.group === selectedType);
      const matchParty = isAllPartyType || c.partyType === selectedPartyType;
      
      let matchRep = true;
      if (!isAllSelected) {
        if (selectedOptions.length > 0) {
          if (selectedRepType === 'CITY') matchRep = selectedOptions.includes(c.city);
          else matchRep = selectedOptions.includes(c.district);
        } else {
          matchRep = false;
        }
      }
      
      let matchActive = true;
      if (isActiveList) {
        const hasPurchases = bills.some(b => 
          b.customer?.name === c.ledgerName && 
          b.billInfo?.date?.includes(currentYear.toString())
        );
        matchActive = hasPurchases;
      }
      
      let matchPaymentPending = true;
      if (selectedType === 'PAYMENT PENDING') {
         matchPaymentPending = (customerPendingMap[c.ledgerName] || 0) > 0;
      }
      
      return matchType && matchParty && matchRep && matchActive && matchPaymentPending;
    }).sort((a, b) => (a.ledgerName || '').localeCompare(b.ledgerName || ''));
  }, [clients, selectedType, selectedPartyType, isAllPartyType, selectedRepType, selectedOptions, isAllSelected, isActiveList, bills, currentYear, customerPendingMap]);

  const getClientAliases = (clientName) => {
    if (selectedType === 'PAYMENT PENDING') return '';
    
    const clientBills = bills.filter(b => 
      b.customer?.name === clientName && 
      b.billInfo?.date?.includes(currentYear.toString())
    );
    
    if (clientBills.length === 0) return '';

    const aliases = [];
    clientBills.forEach(b => {
      b.items?.forEach(item => {
        if (item.itemCode && !aliases.includes(item.itemCode)) {
          aliases.push(item.itemCode);
        }
      });
    });
    
    return aliases.join(', ');
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Customer_Address_Labels`,
  });

  return (
    <div className="bg-slate-100 dark:bg-slate-900 rounded-lg shadow-sm flex h-[calc(100vh-80px)] overflow-hidden">
      
      {/* Left Sidebar - Filters matching user screenshot */}
      <div className="w-[400px] bg-slate-50 dark:bg-[#151521] border-r border-slate-300 dark:border-slate-800 p-6 flex flex-col h-full shadow-lg z-10">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider">
          Customer List with Address
        </h2>
        
        <div className="flex flex-col gap-4 flex-1">
          {/* Type */}
          <div className="flex items-center">
            <label className="w-24 text-sm font-semibold text-slate-700 dark:text-slate-300">Type</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-sm outline-none uppercase shadow-sm"
            >
              <option value="ALL">ALL</option>
              <option value="PAYMENT PENDING">PAYMENT PENDING</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Rep. Type */}
          <div className="flex items-center">
            <label className="w-24 text-sm font-semibold text-slate-700 dark:text-slate-300">Rep. Type</label>
            <select 
              value={selectedRepType} 
              onChange={(e) => setSelectedRepType(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-sm outline-none uppercase shadow-sm"
            >
              <option value="CITY">CITY</option>
              <option value="DISTRICT">DISTRICT</option>
            </select>
          </div>

          {/* Party Type */}
          <div className="flex items-center">
            <label className="w-24 text-sm font-semibold text-slate-700 dark:text-slate-300">Party Type</label>
            <div className="flex-1 flex gap-2">
              <select 
                value={selectedPartyType} 
                onChange={(e) => setSelectedPartyType(e.target.value)}
                disabled={isAllPartyType}
                className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-sm outline-none uppercase disabled:opacity-50 shadow-sm"
              >
                {partyTypes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                <input 
                  type="checkbox" 
                  checked={isAllPartyType}
                  onChange={(e) => setIsAllPartyType(e.target.checked)}
                  className="rounded border-slate-400 cursor-pointer"
                />
                ALL
              </label>
            </div>
          </div>

          {/* City / District Checkbox List */}
          <div className="flex items-start mt-2 h-full flex-1 min-h-0">
            <label className="w-24 text-sm font-semibold text-slate-700 dark:text-slate-300 pt-2 uppercase">
              {selectedRepType}
            </label>
            
            <div className="flex-1 flex gap-2 h-full">
              <div className="flex-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] p-3 overflow-y-auto shadow-inner">
                {availableOptions.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2 mb-2 text-sm cursor-pointer text-slate-700 dark:text-slate-300 uppercase">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected || selectedOptions.includes(opt)}
                      disabled={isAllSelected}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedOptions(prev => [...prev, opt]);
                        else setSelectedOptions(prev => prev.filter(o => o !== opt));
                      }}
                      className="rounded border-slate-400 cursor-pointer w-3.5 h-3.5"
                    />
                    {opt}
                  </label>
                ))}
              </div>
              <label className="flex items-start gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer pt-2">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={(e) => {
                    setIsAllSelected(e.target.checked);
                    if (e.target.checked) setSelectedOptions([]);
                  }}
                  className="rounded border-slate-400 cursor-pointer mt-0.5"
                />
                ALL
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isActiveList}
              onChange={(e) => setIsActiveList(e.target.checked)}
              className="rounded border-slate-400 cursor-pointer w-4 h-4"
            />
            Active List
          </label>
          <button 
            onClick={handlePrint}
            disabled={filteredClients.length === 0}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-800 dark:text-slate-200 text-sm font-bold rounded border border-slate-300 dark:border-slate-600 shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Printer size={16} />
            Show Report
          </button>
        </div>
      </div>

      {/* Right Side - Live Preview */}
      <div className="flex-1 bg-slate-200 dark:bg-slate-900 p-6 overflow-y-auto flex flex-col items-center relative">
        <div className="absolute top-4 right-6 text-sm font-semibold text-slate-500">
          Showing {filteredClients.length} address labels
        </div>
        <div className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm]">
          <PrintCustomerLabels 
            ref={printRef} 
            clients={filteredClients} 
            getClientAliases={getClientAliases} 
          />
        </div>
      </div>

    </div>
  );
}
