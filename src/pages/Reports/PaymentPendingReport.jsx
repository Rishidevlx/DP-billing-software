import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Printer, Search, FileText } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { billsApi, clientsApi, receiptsApi } from '../../services/api';

const parseDate = (dStr) => {
  if (!dStr) return '';
  if (dStr.includes('-') && dStr.split('-')[0].length === 4) return dStr;
  const parts = dStr.split(/[-/]/);
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dStr;
};

// Component for printing
const PrintPaymentPendingReport = React.forwardRef(({ flatData, uptoDate }, ref) => {
  const printDate = new Date().toLocaleDateString('en-GB');
  const formattedUptoDate = uptoDate ? parseDate(uptoDate).split('-').reverse().join('-') : '';

  return (
    <div ref={ref} className="p-8 bg-white text-black min-h-screen print:p-4" style={{ fontFamily: 'Arial, sans-serif' }}>
      <style type="text/css" media="print">
        {`
          @page { size: A4 portrait; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; color-adjust: exact; }
          .print-header-border { border-top: 1px solid #000; border-bottom: 1px solid #000; }
          table { width: 100%; border-collapse: collapse; }
          th { padding: 4px; text-align: left; }
          td { padding: 2px 4px; }
        `}
      </style>

      <div className="text-center mb-6">
        <h1 className="text-xl font-bold uppercase text-blue-900 mb-4 tracking-widest">PAYMENT PENDING REPORT</h1>
        <div className="flex justify-between items-end text-xs font-bold text-slate-700">
          <div>Upto Date : {formattedUptoDate}</div>
          <div>Print Date : {printDate}</div>
        </div>
      </div>

      <table className="text-xs w-full">
        <thead>
          <tr className="print-header-border text-blue-900 font-bold bg-gray-50/50">
            <th className="w-48">Party Name</th>
            <th className="w-24 text-center">Bill Date</th>
            <th className="w-16">Bill No</th>
            <th className="text-right w-24">Bill Amount</th>
            <th className="text-right w-24">Recd Amt</th>
            <th className="text-right w-24">Pending Amt</th>
            <th className="text-right w-28">Running Bal</th>
            <th className="text-right w-16">Due Days</th>
          </tr>
        </thead>
        <tbody>
          {flatData.map((customer, custIdx) => {
            let runningBal = 0;
            return (
              <React.Fragment key={`cust-${custIdx}`}>
                <tr>
                  <td colSpan="8" className="pt-4 pb-1 font-bold text-blue-900">
                    {customer.name}
                  </td>
                </tr>
                
                {customer.bills.map((bill, bIdx) => {
                  runningBal += bill.pendingAmt;
                  return (
                    <tr key={`bill-${custIdx}-${bIdx}`}>
                      <td></td>
                      <td className="text-center">{bill.billDateStr}</td>
                      <td>{bill.billNo}</td>
                      <td className="text-right">{bill.billAmt.toFixed(2)}</td>
                      <td className="text-right">{bill.recdAmt > 0 ? bill.recdAmt.toFixed(2) : '0.00'}</td>
                      <td className="text-right">{bill.pendingAmt.toFixed(2)}</td>
                      <td className="text-right">{runningBal.toFixed(2)} Dr</td>
                      <td className="text-right">{bill.dueDays}</td>
                    </tr>
                  );
                })}
                {/* Customer Total Line */}
                <tr>
                  <td colSpan="3"></td>
                  <td colSpan="4" className="text-right font-bold pb-2 border-b border-black">
                    <div className="flex justify-between w-full">
                      <span></span>
                      <span>{runningBal.toFixed(2)} Dr</span>
                    </div>
                  </td>
                  <td></td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

export default function PaymentPendingReport() {
  const [uptoDate, setUptoDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  const printRef = useRef();

  const [allData, setAllData] = useState({ clients: [], bills: [], receipts: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, billsData, receiptsData] = await Promise.all([
          clientsApi.getAll(),
          billsApi.getAll(),
          receiptsApi.getAll()
        ]);
        
        const mappedBills = billsData.map(b => {
          const customer = clientsData.find(c => c.id === b.customer_id);
          return {
            ...b,
            id: b.id,
            billInfo: { billNo: b.bill_no, no: b.bill_no, date: b.date },
            customer: customer || {},
            totals: { amount: b.net_amount }
          };
        });
        
        setAllData({ clients: clientsData, bills: mappedBills, receipts: receiptsData });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const { flatData, availableDistricts, availableCities } = useMemo(() => {
    const clients = allData.clients;
    const allBills = allData.bills;
    const allReceipts = allData.receipts;

    const parsedUptoDate = parseDate(uptoDate);

    // Filter bills up to the selected date
    const eligibleBills = allBills.filter(b => {
      const bDate = parseDate(b.billInfo?.date);
      return bDate <= parsedUptoDate;
    });

    // Calculate received amounts per bill, strictly up to the 'uptoDate'
    const billRecdMap = {}; // billId -> recdAmt
    allReceipts.forEach(receipt => {
      const rDate = parseDate(receipt.date);
      if (rDate <= parsedUptoDate && receipt.allocations) {
        Object.entries(receipt.allocations).forEach(([billId, alloc]) => {
          if (!billRecdMap[billId]) billRecdMap[billId] = 0;
          billRecdMap[billId] += parseFloat(alloc) || 0;
        });
      }
    });

    // Grouping bills by customer
    const customerBillsMap = {};
    eligibleBills.forEach(bill => {
      const billAmt = parseFloat(bill.totals?.amount) || 0;
      const recdAmt = billRecdMap[bill.id] || 0;
      const pendingAmt = billAmt - recdAmt;

      // Only include if pending > 0
      if (pendingAmt > 0) {
        const custName = bill.customer?.name || 'Unknown';
        if (!customerBillsMap[custName]) customerBillsMap[custName] = [];
        
        // Calculate days
        const bDate = parseDate(bill.billInfo?.date);
        let dueDays = 0;
        if (bDate && parsedUptoDate) {
          const diffTime = Math.abs(new Date(parsedUptoDate) - new Date(bDate));
          dueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        customerBillsMap[custName].push({
          id: bill.id,
          billDateRaw: bDate,
          billDateStr: bDate ? bDate.split('-').reverse().join('/') : '',
          billNo: bill.billInfo?.no || '',
          billAmt,
          recdAmt,
          pendingAmt,
          dueDays
        });
      }
    });

    const distSet = new Set();
    const citySet = new Set();
    const flatCustomers = [];

    Object.entries(customerBillsMap).forEach(([custName, billsList]) => {
      if (billsList.length === 0) return;

      const clientInfo = clients.find(c => (c.ledgerName || '').toLowerCase() === custName.toLowerCase() || (c.printName || '').toLowerCase() === custName.toLowerCase());
      
      const district = clientInfo?.district ? clientInfo.district.toUpperCase() : 'OTHER DISTRICTS';
      const city = clientInfo?.city ? clientInfo.city.toUpperCase() : '';
      
      distSet.add(district);
      if (city) citySet.add(city);
      
      // Apply Dropdown Filters
      if (selectedDistrict !== 'All' && district !== selectedDistrict) return;
      if (selectedCity !== 'All' && city !== selectedCity) return;
      
      const mobile = clientInfo?.mobileNo || '';
      const printName = clientInfo?.printName || clientInfo?.ledgerName || custName;
      
      // Formatting customer display name
      const cityStr = city ? `, ${city}` : '';
      const displayName = `${mobile ? mobile + ', ' : ''}${printName.toUpperCase()}${cityStr}${mobile ? ', ' + mobile : ''}`;

      // Sort bills by date
      billsList.sort((a, b) => (a.billDateRaw > b.billDateRaw ? 1 : -1));

      flatCustomers.push({
        name: displayName,
        rawName: custName,
        district,
        city,
        bills: billsList
      });
    });

    flatCustomers.sort((a, b) => a.name.localeCompare(b.name));

    return {
      flatData: flatCustomers,
      availableDistricts: Array.from(distSet).sort(),
      availableCities: Array.from(citySet).sort()
    };
  }, [uptoDate, selectedDistrict, selectedCity, searchTerm, allData]);

  // Handle Search Filtering
  const searchFilteredData = useMemo(() => {
    if (!searchTerm) return flatData;
    const lowerSearch = searchTerm.toLowerCase();

    return flatData.filter(c => 
      c.name.toLowerCase().includes(lowerSearch) || 
      c.rawName.toLowerCase().includes(lowerSearch)
    );
  }, [flatData, searchTerm]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Payment_Pending_Report_${uptoDate}`,
  });

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Payment Pending Report</h1>
            <p className="text-slate-500 text-sm">View outstanding balances for your customers.</p>
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

      {/* Filters */}
      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Search Customer</label>
            <div className="relative">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or mobile..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none uppercase"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none uppercase"
            >
              <option value="All">ALL DISTRICTS</option>
              {availableDistricts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none uppercase"
            >
              <option value="All">ALL CITIES</option>
              {availableCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Upto Date</label>
            <input 
              type="date"
              value={uptoDate}
              onChange={(e) => setUptoDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Screen View */}
      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto p-4">
          {searchFilteredData.length > 0 ? (
             <div className="space-y-6">
               {searchFilteredData.map((cust, custIdx) => {
                  let runBal = 0;
                  return (
                   <div key={custIdx} className="bg-white dark:bg-[#1E1E2D] border border-slate-200 dark:border-slate-700 rounded p-4 shadow-sm">
                     <h4 className="font-bold text-blue-900 dark:text-blue-400 mb-3 text-sm">{cust.name}</h4>
                     
                     <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left">
                         <thead>
                           <tr className="text-slate-500 border-b border-slate-200 dark:border-slate-700">
                             <th className="pb-2 font-medium text-center w-24">Bill Date</th>
                             <th className="pb-2 font-medium w-24">Bill No</th>
                             <th className="pb-2 font-medium text-right">Bill Amount</th>
                             <th className="pb-2 font-medium text-right">Recd Amt</th>
                             <th className="pb-2 font-medium text-right text-blue-600">Pending Amt</th>
                             <th className="pb-2 font-medium text-right">Running Bal</th>
                             <th className="pb-2 font-medium text-center w-20">Days</th>
                           </tr>
                         </thead>
                         <tbody>
                           {cust.bills.map((b, bIdx) => {
                              runBal += b.pendingAmt;
                              return (
                               <tr key={bIdx} className="border-b border-slate-50 dark:border-slate-800/50">
                                 <td className="py-2 text-center text-slate-600 dark:text-slate-400">{b.billDateStr}</td>
                                 <td className="py-2 text-slate-600 dark:text-slate-400">{b.billNo}</td>
                                 <td className="py-2 text-right">{b.billAmt.toFixed(2)}</td>
                                 <td className="py-2 text-right">{b.recdAmt > 0 ? b.recdAmt.toFixed(2) : '-'}</td>
                                 <td className="py-2 text-right font-medium text-blue-600 dark:text-blue-400">{b.pendingAmt.toFixed(2)}</td>
                                 <td className="py-2 text-right font-semibold text-slate-700 dark:text-slate-300">{runBal.toFixed(2)} Dr</td>
                                 <td className="py-2 text-center text-slate-500">{b.dueDays}</td>
                               </tr>
                             );
                           })}
                         </tbody>
                         <tfoot>
                           <tr>
                             <td colSpan="4"></td>
                             <td colSpan="2" className="pt-3 text-right font-bold text-slate-800 dark:text-white border-t-2 border-slate-200 dark:border-slate-700">
                               {runBal.toFixed(2)} Dr
                             </td>
                             <td></td>
                           </tr>
                         </tfoot>
                       </table>
                     </div>
                   </div>
                 );
               })}
             </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              No pending payments found for the selected criteria.
            </div>
          )}
        </div>
      </div>

      <div className="hidden">
        <PrintPaymentPendingReport 
          ref={printRef} 
          flatData={searchFilteredData}
          uptoDate={uptoDate}
        />
      </div>
    </div>
  );
}
