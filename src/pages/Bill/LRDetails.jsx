import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { useReactToPrint } from 'react-to-print';
import PrintInvoice from './PrintInvoice';
import { billsApi, clientsApi } from '../../services/api';

export default function LRDetails() {
  const [bills, setBills] = useState([]);
  const [searchBillNo, setSearchBillNo] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showPendingLR, setShowPendingLR] = useState(false); 
  
  const [selectedBill, setSelectedBill] = useState(null);
  const [lrNoInput, setLrNoInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const inputRef = useRef(null);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedBill ? `Invoice_${selectedBill.billInfo?.billNo}` : 'Invoice',
  });

  const loadBills = async () => {
    try {
      const [billsData, clientsData] = await Promise.all([
        billsApi.getAll(),
        clientsApi.getAll()
      ]);
      
      const joinedBills = billsData.map(b => {
        const customer = clientsData.find(c => c.id === b.customer_id);
        return {
          id: b.id,
          billInfo: {
            billNo: b.bill_no,
            date: b.date,
            transport: b.transport,
            destination: b.destination,
            lrNo: b.lr_no,
            lrDate: b.lr_date,
            bundles: b.bundles
          },
          customer: {
            id: customer?.id,
            name: customer?.name || '',
            school: customer?.school || '',
            mobile: customer?.mobile || '',
            address1: customer?.address1 || '',
            town: customer?.town || '',
            district: customer?.district || ''
          },
          items: b.items,
          totals: {
            grossAmount: b.gross_amount,
            netAmount: b.net_amount,
            amount: b.net_amount
          }
        };
      });
      
      // Sort by descending id (newest first)
      joinedBills.sort((a, b) => b.id - a.id);
      setBills(joinedBills);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const handleRowAction = (bill) => {
    setSelectedBill(bill);
    setLrNoInput(bill.billInfo?.lrNo || '');
    setIsModalOpen(true);
    // Focus the input when modal opens
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const handleSaveLR = async (e) => {
    if (e) e.preventDefault();
    if (!selectedBill) return;

    try {
      // Update in DB
      await billsApi.updateLR(selectedBill.id, lrNoInput);
      
      const updatedBill = {
        ...selectedBill,
        billInfo: {
          ...selectedBill.billInfo,
          lrNo: lrNoInput
        }
      };

      const updatedBills = bills.map(b => b.id === selectedBill.id ? updatedBill : b);
      setBills(updatedBills);
      
      setSelectedBill(updatedBill); // Ensure print preview has updated data
      setIsModalOpen(false);

    Swal.fire({
      title: 'LR No Updated!',
      text: 'Do you want to print this bill?',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Yes, Print',
      cancelButtonText: 'No',
      confirmButtonColor: '#2563eb'
    }).then((result) => {
      if (result.isConfirmed) {
        handlePrint();
      }
    });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', `Failed to update LR No: ${error.message}`, 'error');
    }
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
    }
    return null;
  };

  const filteredBills = bills.filter(b => {
    let match = true;
    if (searchBillNo && !b.billInfo?.billNo?.toLowerCase().includes(searchBillNo.toLowerCase())) match = false;
    
    if (showPendingLR) {
      if (b.billInfo?.lrNo && b.billInfo.lrNo.trim() !== '') {
        match = false;
      }
    }
    
    if (fromDate || toDate) {
      const d = parseDate(b.billInfo?.date);
      if (d) {
        if (fromDate) {
          const fd = new Date(fromDate);
          if (d < fd) match = false;
        }
        if (toDate) {
          const td = new Date(toDate);
          if (d > td) match = false;
        }
      }
    }
    
    return match;
  });

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">LR Details</h1>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 w-48">
          <label className="text-xs font-semibold text-slate-500">Bill No</label>
          <input 
            type="text" 
            value={searchBillNo}
            onChange={(e) => setSearchBillNo(e.target.value)}
            placeholder="Search Bill No..."
            className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div className="flex flex-col gap-1 w-40">
          <label className="text-xs font-semibold text-slate-500">From Date</label>
          <input 
            type="date" 
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1 w-40">
          <label className="text-xs font-semibold text-slate-500">To Date</label>
          <input 
            type="date" 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 mb-1">
          <input 
            type="checkbox" 
            id="pendingLR"
            checked={showPendingLR}
            onChange={(e) => setShowPendingLR(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="pendingLR" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            Pending LR Only (Tick / Untick)
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Bill No</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Date</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Customer</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Transport</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Destination</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase text-center">Bundles</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">LR No</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr 
                    key={bill.id} 
                    onDoubleClick={() => handleRowAction(bill)}
                    onKeyDown={(e) => { if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); handleRowAction(bill); } }}
                    tabIndex={0}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:bg-blue-50 dark:focus:bg-slate-800 outline-none"
                  >
                    <td className="p-3 text-sm font-bold text-slate-900 dark:text-white">{bill.billInfo?.billNo}</td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{bill.billInfo?.date}</td>
                    <td className="p-3 text-sm font-medium text-slate-800 dark:text-slate-200">{bill.customer?.name}</td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{bill.billInfo?.transport}</td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{bill.billInfo?.destination}</td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-400 text-center">{bill.billInfo?.bundles}</td>
                    <td className="p-3 text-sm font-medium text-blue-600 dark:text-blue-400">{bill.billInfo?.lrNo || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 italic">No bills found matching filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LR Popup Modal */}
      {isModalOpen && selectedBill && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#151521] w-[400px] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e]">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase">LR Update</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveLR} className="p-5 flex flex-col gap-4">
              <div className="flex justify-between text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="text-slate-800 dark:text-white">Bill No : {selectedBill.billInfo?.billNo}</div>
                <div className="text-slate-600 dark:text-slate-400">Date : {selectedBill.billInfo?.date}</div>
              </div>
              
              <div className="grid grid-cols-[130px_1fr] gap-y-3 gap-x-2 text-sm text-slate-700 dark:text-slate-300">
                <div className="font-semibold uppercase text-slate-500">Transport</div>
                <div className="font-medium">{selectedBill.billInfo?.transport || '-'}</div>
                
                <div className="font-semibold uppercase text-slate-500">Destination</div>
                <div className="font-medium">{selectedBill.billInfo?.destination || '-'}</div>
                
                <div className="font-semibold uppercase text-slate-500">No. of Bundles</div>
                <div className="font-medium">{selectedBill.billInfo?.bundles || '0'}</div>
                
                <div className="font-semibold uppercase text-slate-500">LR Date</div>
                <div className="font-medium">{selectedBill.billInfo?.lrDate || selectedBill.billInfo?.date}</div>
                
                <div className="font-bold uppercase text-slate-800 dark:text-white self-center">LR No</div>
                <div>
                  <input 
                    ref={inputRef}
                    type="text" 
                    value={lrNoInput}
                    onChange={(e) => setLrNoInput(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>


              
              <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium rounded transition-colors border-none cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors border-none cursor-pointer">
                  <Save size={16} /> Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Print Component */}
      <div className="hidden">
        {selectedBill && <PrintInvoice ref={printRef} billData={selectedBill} />}
      </div>
    </div>
  );
}
