import React, { useState, useEffect, useRef } from 'react';
import { FileText, Printer, FileDown } from 'lucide-react';
import { exportHTMLToDoc } from '../../utils/exportToWord';
import { useReactToPrint } from 'react-to-print';
import { billsApi, clientsApi } from '../../services/api';

const parseDate = (dStr) => {
  if (!dStr) return '';
  if (dStr.includes('-') && dStr.split('-')[0].length === 4) return dStr;
  const parts = dStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dStr;
};

// Component for printing
const PrintCustomerWiseReport = React.forwardRef(({ groupedData, dateFrom, dateTo, selectedCustomer }, ref) => {
  const printDate = new Date().toLocaleDateString('en-GB');
  
  const formattedFrom = dateFrom ? parseDate(dateFrom).split('-').reverse().join('/') : '';
  const formattedTo = dateTo ? parseDate(dateTo).split('-').reverse().join('/') : '';
  const dateRangeStr = (formattedFrom || formattedTo) 
    ? `${formattedFrom || 'Start'} - ${formattedTo || 'Today'}`
    : 'All Time';

  let grandTotalQty = 0;
  let grandTotalFree = 0;
  let grandTotalAmount = 0;
  let grandTotalTaxable = 0;
  let grandTotalTaxAmt = 0;
  let grandTotal = 0;

  return (
    <div ref={ref} className="p-8 bg-white text-black min-h-screen print:p-4" style={{ fontFamily: 'Arial, sans-serif' }}>
      <style type="text/css" media="print">
        {`
          @page { size: A4 landscape; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; color-adjust: exact; }
          .print-table th, .print-table td { border-bottom: 1px dashed #ccc; padding: 4px 8px; }
          .print-table { width: 100%; border-collapse: collapse; }
          .print-header { border-top: 2px solid #000; border-bottom: 2px solid #000; }
        `}
      </style>

      <div className="flex justify-between items-end mb-4 pb-2 relative">
        <h2 className="text-lg font-bold">Sales Details for the Period of {dateRangeStr}</h2>
        <div className="text-xs font-semibold">Print Date : {printDate}</div>
      </div>

      <table className="print-table text-[10px] w-full">
        <thead>
          <tr className="print-header font-bold text-left">
            <th>Item Name</th>
            <th className="w-16">Vch. No</th>
            <th className="w-20">Date</th>
            <th className="w-12 text-right">Qty</th>
            <th className="w-12 text-right">Meter</th>
            <th className="w-12 text-right">Free</th>
            <th className="w-16 text-right">Rate</th>
            <th className="w-20 text-right">Amount</th>
            <th className="w-20 text-right">Taxable Value</th>
            <th className="w-16 text-right">Tax Amt</th>
            <th className="w-20 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedData).map(([customerKey, customerData], index) => {
            let custTotalQty = 0;
            let custTotalFree = 0;
            let custTotalAmount = 0;
            let custTotalTaxable = 0;
            let custTotalTaxAmt = 0;
            let custTotal = 0;

            const rows = customerData.items.map((item, idx) => {
              custTotalQty += Number(item.qty || 0);
              custTotalFree += Number(item.free || item.teachersCopy || 0);
              custTotalAmount += Number(item.amount || 0);
              custTotalTaxable += Number(item.amount || 0);
              custTotalTaxAmt += Number(item.taxAmt || 0);
              custTotal += Number(item.amount || 0) + Number(item.taxAmt || 0);

              return (
                <tr key={idx}>
                  <td className="uppercase font-semibold">{item.itemName}</td>
                  <td>{item.vchNo}</td>
                  <td>{item.date}</td>
                  <td className="text-right">{item.qty || 0}</td>
                  <td className="text-right">0</td>
                  <td className="text-right">{item.free || item.teachersCopy || 0}</td>
                  <td className="text-right">{Number(item.rate || 0).toFixed(2)}</td>
                  <td className="text-right">{Number(item.amount || 0).toFixed(2)}</td>
                  <td className="text-right">{Number(item.amount || 0).toFixed(2)}</td>
                  <td className="text-right">{Number(item.taxAmt || 0).toFixed(2)}</td>
                  <td className="text-right">{(Number(item.amount || 0) + Number(item.taxAmt || 0)).toFixed(2)}</td>
                </tr>
              );
            });

            grandTotalQty += custTotalQty;
            grandTotalFree += custTotalFree;
            grandTotalAmount += custTotalAmount;
            grandTotalTaxable += custTotalTaxable;
            grandTotalTaxAmt += custTotalTaxAmt;
            grandTotal += custTotal;

            return (
              <React.Fragment key={index}>
                <tr>
                  <td colSpan="11" className="pt-4 pb-1 uppercase">
                    <span className="bg-slate-200 px-2 py-1 border border-slate-400 font-bold text-[11px] shadow-sm text-slate-800">
                      {customerKey}
                    </span>
                  </td>
                </tr>
                {rows}
                <tr className="font-bold border-t border-slate-400 border-b-2">
                  <td colSpan="3"></td>
                  <td className="text-right">{custTotalQty}</td>
                  <td className="text-right">0</td>
                  <td className="text-right">{custTotalFree}</td>
                  <td></td>
                  <td className="text-right">{custTotalAmount.toFixed(2)}</td>
                  <td className="text-right">{custTotalTaxable.toFixed(2)}</td>
                  <td className="text-right">{custTotalTaxAmt.toFixed(2)}</td>
                  <td className="text-right">{custTotal.toFixed(2)}</td>
                </tr>
              </React.Fragment>
            );
          })}

          {Object.keys(groupedData).length === 0 && (
            <tr>
              <td colSpan="11" className="p-4 text-center text-sm">No records found.</td>
            </tr>
          )}

          {Object.keys(groupedData).length > 0 && (
            <tr className="font-bold border-t-2 border-b-2 border-black text-[11px] bg-slate-100">
              <td colSpan="3" className="text-right py-2 pr-4 uppercase">Grand Total :</td>
              <td className="text-right py-2">{grandTotalQty}</td>
              <td className="text-right py-2">0</td>
              <td className="text-right py-2">{grandTotalFree}</td>
              <td></td>
              <td className="text-right py-2">{grandTotalAmount.toFixed(2)}</td>
              <td className="text-right py-2">{grandTotalTaxable.toFixed(2)}</td>
              <td className="text-right py-2">{grandTotalTaxAmt.toFixed(2)}</td>
              <td className="text-right py-2">{grandTotal.toFixed(2)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default function CustomerWiseReport() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCustomer, setSelectedCustomer] = useState('ALL');
  
  const [groupedData, setGroupedData] = useState({});
  const [allCustomers, setAllCustomers] = useState([]);
  const [allBills, setAllBills] = useState([]);
  
  const printRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billsData, clientsData] = await Promise.all([
          billsApi.getAll(),
          clientsApi.getAll()
        ]);
        
        const mappedBills = billsData.map(b => {
          const customer = clientsData.find(c => c.id === b.customer_id);
          return {
            ...b,
            billInfo: { billNo: b.bill_no, date: b.date },
            customer: customer || {},
            items: b.items || []
          };
        });
        
        setAllBills(mappedBills);

        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        setDateFrom(firstDay.toISOString().split('T')[0]);

        const uniqueCustomers = new Map();
        mappedBills.forEach(bill => {
          const mobile = bill.customer?.mobile || '';
          const name = bill.customer?.name || 'Unknown';
          const key = `${mobile ? mobile + ',' : ''}${name}`.toUpperCase();
          if (!uniqueCustomers.has(key)) {
            uniqueCustomers.set(key, key);
          }
        });
        setAllCustomers(Array.from(uniqueCustomers.values()).sort());
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    calculateReport();
  }, [dateFrom, dateTo, selectedCustomer, allBills]);

  const calculateReport = () => {
    const bills = allBills;

    const parsedFrom = dateFrom ? parseDate(dateFrom) : '0000-00-00';
    const parsedTo = dateTo ? parseDate(dateTo) : '9999-12-31';

    const grouped = {};

    bills.forEach(bill => {
      const dRaw = parseDate(bill.billInfo?.date || '');
      
      if (dRaw >= parsedFrom && dRaw <= parsedTo) {
        const mobile = bill.customer?.mobile || '';
        const name = bill.customer?.name || 'Unknown';
        const customerKey = `${mobile ? mobile + ',' : ''}${name}`.toUpperCase();

        if (selectedCustomer === 'ALL' || selectedCustomer === customerKey) {
          if (!grouped[customerKey]) {
            grouped[customerKey] = { items: [] };
          }
          
          bill.items?.forEach(item => {
            grouped[customerKey].items.push({
              itemName: item.particulars || item.itemName || item.name || '',
              vchNo: bill.billInfo?.billNo || '',
              date: bill.billInfo?.date ? bill.billInfo.date.split('-').reverse().join('/') : '',
              qty: parseFloat(item.qty) || 0,
              free: parseFloat(item.teachersCopy) || 0,
              rate: parseFloat(item.rate) || 0,
              amount: parseFloat(item.amount) || 0,
              taxAmt: parseFloat(item.taxAmount) || 0
            });
          });
        }
      }
    });

    setGroupedData(grouped);
  };

  const handleExportWord = () => {
    if (printRef.current) {
      exportHTMLToDoc(printRef.current.innerHTML, `Customer_Wise_Report_${dateFrom}_to_${dateTo}`);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Customer_Wise_Report_${dateFrom}_to_${dateTo}`,
  });

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Customer Wise Report</h1>
            <p className="text-slate-500 text-sm">View and print sales details grouped by customer.</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleExportWord}
            disabled={Object.keys(groupedData).length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer border-none"
          >
            <FileDown size={18} />
            Export Word
          </button>
          <button 
            onClick={handlePrint}
            disabled={Object.keys(groupedData).length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer border-none"
          >
            <Printer size={18} />
            Print Report
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 min-w-[250px] relative">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Customer</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 uppercase cursor-pointer"
            >
              <option value="ALL">-- ALL CUSTOMERS --</option>
              {allCustomers.map((cust, idx) => (
                <option key={idx} value={cust}>{cust}</option>
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
         <div className="min-w-[800px]">
           <PrintCustomerWiseReport 
              ref={printRef} 
              groupedData={groupedData} 
              dateFrom={dateFrom} 
              dateTo={dateTo} 
              selectedCustomer={selectedCustomer}
            />
         </div>
      </div>
    </div>
  );
}
