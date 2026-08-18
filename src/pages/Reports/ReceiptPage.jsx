import React, { useState, useEffect, useRef } from 'react';
import { Save, RefreshCw, Search, X, Check, Printer } from 'lucide-react';
import Swal from 'sweetalert2';
import { useReactToPrint } from 'react-to-print';
import PrintReceipt from './PrintReceipt';

export default function ReceiptPage() {
  const [clients, setClients] = useState([]);
  const [bills, setBills] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    voucherNo: '',
    date: new Date().toISOString().split('T')[0],
    accountName: 'CASH', // default
    customerName: '',
    amount: '',
    shortage: '',
    narrationSno: '',
    narrationPg: '',
    narrationDate: ''
  });

  // Autocomplete State
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);
  const clientInputRef = useRef(null);
  const amountInputRef = useRef(null);
  const narrationSnoRef = useRef(null);
  const narrationPgRef = useRef(null);
  const narrationDateRef = useRef(null);

  // Allocation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [allocatedBills, setAllocatedBills] = useState({}); // { billId: allocatedAmount }
  const [currentAmountToAllocate, setCurrentAmountToAllocate] = useState(0);

  // Print Ref
  const printRef = useRef(null);
  const [lastSavedReceipt, setLastSavedReceipt] = useState(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receipt_${formData.voucherNo}`,
    onAfterPrint: () => setLastSavedReceipt(null)
  });

  // Initialization
  useEffect(() => {
    const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
    setClients(savedClients);
    
    const savedBills = JSON.parse(localStorage.getItem('bills') || '[]');
    setBills(savedBills);
    
    const savedReceipts = JSON.parse(localStorage.getItem('receipts') || '[]');
    
    // Auto-generate Voucher No starting from 000
    const nextVoucher = savedReceipts.length.toString().padStart(3, '0');
    setFormData(prev => ({ ...prev, voucherNo: nextVoucher }));
  }, []);

  // Global Ctrl+S
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        document.getElementById('receiptSubmitBtn')?.click();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Customer Autocomplete logic
  const handleCustomerChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, customerName: value }));
    
    if (value.trim()) {
      const filtered = clients.filter(c => c.ledgerName?.toLowerCase().includes(value.toLowerCase()) || c.mobileNo?.includes(value));
      setFilteredClients(filtered);
      setShowClientDropdown(true);
    } else {
      setShowClientDropdown(false);
    }
  };

  const selectCustomer = (client) => {
    setFormData(prev => ({ ...prev, customerName: client.ledgerName }));
    setShowClientDropdown(false);
    setTimeout(() => amountInputRef.current?.focus(), 100);
  };

  const handleCustomerKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showClientDropdown && filteredClients.length > 0) {
        selectCustomer(filteredClients[0]);
      } else {
        amountInputRef.current?.focus();
      }
    }
  };

  // When amount is entered and user presses Enter
  const handleAmountKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const amount = parseFloat(formData.amount) || 0;
      if (amount <= 0) {
        Swal.fire('Error', 'Please enter a valid amount', 'error');
        return;
      }
      if (!formData.customerName) {
        Swal.fire('Error', 'Please select a customer first', 'error');
        return;
      }

      // Find unpaid bills for this customer
      const customerBills = bills.filter(b => b.customer?.name === formData.customerName);
      
      const unpaid = customerBills.map(b => {
        const total = parseFloat(b.totals?.amount || 0);
        const paid = parseFloat(b.amountPaid || 0);
        const balance = total - paid;
        return { ...b, balance, total, paid };
      }).filter(b => b.balance > 0);

      if (unpaid.length === 0) {
        Swal.fire('Info', 'No unpaid bills found for this customer.', 'info');
        return;
      }

      setUnpaidBills(unpaid);
      setCurrentAmountToAllocate(amount);
      setAllocatedBills({});
      setIsModalOpen(true);
    }
  };

  const handleAllocateAmount = (billId, isChecked) => {
    const bill = unpaidBills.find(b => b.id === billId);
    if (!bill) return;

    setAllocatedBills(prev => {
      const newAllocations = { ...prev };
      
      if (isChecked) {
        // Calculate how much we can allocate to this bill
        const totalAlreadyAllocated = Object.values(newAllocations).reduce((sum, val) => sum + val, 0);
        const remainingToAllocate = currentAmountToAllocate - totalAlreadyAllocated;
        
        if (remainingToAllocate <= 0) {
          Swal.fire('Info', 'Full amount already allocated', 'info');
          return prev;
        }

        const allocation = Math.min(bill.balance, remainingToAllocate);
        newAllocations[billId] = allocation;
      } else {
        delete newAllocations[billId];
      }
      
      return newAllocations;
    });
  };

  const confirmAllocation = () => {
    const totalAllocated = Object.values(allocatedBills).reduce((sum, val) => sum + val, 0);
    const shortage = currentAmountToAllocate - totalAllocated;
    
    setFormData(prev => ({ 
      ...prev, 
      shortage: shortage > 0 ? shortage.toFixed(2) : '0.00' 
    }));
    
    setIsModalOpen(false);
    setTimeout(() => narrationSnoRef.current?.focus(), 100);
  };

  const formatNarrationDate = (val) => {
    // Basic auto-formatting for dd/mm/yyyy as user types numbers
    const cleaned = val.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length > 4) {
      formatted = formatted.slice(0, 5) + '/' + cleaned.slice(4, 8);
    }
    return formatted.slice(0, 10);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.amount) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    const totalAllocated = Object.values(allocatedBills).reduce((sum, val) => sum + val, 0);
    if (parseFloat(formData.amount) > 0 && Object.keys(allocatedBills).length === 0) {
      Swal.fire({
        title: 'Warning',
        text: 'You have not allocated this amount to any bill. Save anyway?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, save it!'
      }).then((result) => {
        if (result.isConfirmed) {
          saveReceipt();
        }
      });
    } else {
      saveReceipt();
    }
  };

  const saveReceipt = () => {
    const newReceipt = {
      ...formData,
      id: Date.now(),
      allocations: allocatedBills
    };

    // Save Receipt
    const savedReceipts = JSON.parse(localStorage.getItem('receipts') || '[]');
    savedReceipts.push(newReceipt);
    localStorage.setItem('receipts', JSON.stringify(savedReceipts));

    // Update Bills
    const updatedBills = bills.map(bill => {
      if (allocatedBills[bill.id]) {
        return {
          ...bill,
          amountPaid: (parseFloat(bill.amountPaid || 0) + allocatedBills[bill.id]).toFixed(2)
        };
      }
      return bill;
    });
    localStorage.setItem('bills', JSON.stringify(updatedBills));
    setBills(updatedBills); // update local state

    setLastSavedReceipt(newReceipt);

    Swal.fire({
      title: 'Success',
      text: 'Receipt saved successfully! Do you want to print it?',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Yes, Print',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        setTimeout(handlePrint, 500); // Wait for state update to trigger render
      }
      
      // Reset Form
      const nextVoucher = savedReceipts.length.toString().padStart(3, '0');
      setFormData({
        voucherNo: nextVoucher,
        date: new Date().toISOString().split('T')[0],
        accountName: 'CASH',
        customerName: '',
        amount: '',
        shortage: '',
        narrationSno: '',
        narrationPg: '',
        narrationDate: ''
      });
      setAllocatedBills({});
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Receipt Voucher</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Create payment receipts and allocate amounts to unpaid bills.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e] rounded-t-lg flex justify-between items-center">
          <h2 className="text-base font-semibold text-primary-dark dark:text-slate-200 uppercase tracking-wide">RECEIPT DETAILS</h2>
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">Voucher No: {formData.voucherNo}</div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Voucher No & Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">A/C Name</label>
              <input 
                type="text" 
                value={formData.accountName}
                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>

            {/* Customer Name */}
            <div className="flex flex-col gap-1.5 relative md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Customer Name <span className="text-red-500">*</span></label>
              <input 
                type="text"
                ref={clientInputRef}
                value={formData.customerName}
                onChange={handleCustomerChange}
                onKeyDown={handleCustomerKeyDown}
                onFocus={() => { if(filteredClients.length > 0) setShowClientDropdown(true); }}
                onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                placeholder="Search Customer..."
                required
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
              {showClientDropdown && filteredClients.length > 0 && (
                <ul className="absolute z-10 w-full top-full mt-1 bg-white dark:bg-[#1E1E2D] border border-slate-200 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredClients.map((client, idx) => (
                    <li 
                      key={idx} 
                      onClick={() => selectCustomer(client)}
                      className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-200"
                    >
                      {client.ledgerName} {client.mobileNo && `(${client.mobileNo})`}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 text-blue-600 dark:text-blue-400">
                Amount <span className="text-xs text-slate-400 font-normal ml-2">(Press Enter to allocate)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                <input 
                  type="number" 
                  step="0.01"
                  ref={amountInputRef}
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  onKeyDown={handleAmountKeyDown}
                  placeholder="0.00"
                  required
                  className="w-full pl-8 pr-3 py-2 border-2 border-blue-200 dark:border-blue-800 rounded-md bg-blue-50/50 dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-bold text-lg"
                />
              </div>
            </div>

            {/* Shortage */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Shortage</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                <input 
                  type="text" 
                  value={formData.shortage}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortage: e.target.value }))}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-[#1a1a2e] text-slate-700 dark:text-slate-300 font-bold"
                />
              </div>
            </div>

            {/* Narration */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Narration (by sno ... pg ... dated ...)</label>
              <div className="grid grid-cols-3 gap-4">
                <input 
                  type="text" 
                  placeholder="S.No"
                  ref={narrationSnoRef}
                  value={formData.narrationSno}
                  onChange={(e) => setFormData(prev => ({ ...prev, narrationSno: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); narrationPgRef.current?.focus(); } }}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
                <input 
                  type="text" 
                  placeholder="Pg.No"
                  ref={narrationPgRef}
                  value={formData.narrationPg}
                  onChange={(e) => setFormData(prev => ({ ...prev, narrationPg: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); narrationDateRef.current?.focus(); } }}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
                <input 
                  type="text" 
                  placeholder="Date (DD/MM/YYYY)"
                  ref={narrationDateRef}
                  value={formData.narrationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, narrationDate: formatNarrationDate(e.target.value) }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('receiptSubmitBtn')?.click(); } }}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-4 bg-slate-50 dark:bg-[#1a1a2e] rounded-b-lg">
          <button 
            type="submit" 
            id="receiptSubmitBtn"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-md font-medium transition-colors cursor-pointer border-none shadow-md"
          >
            <Save size={18} />
            Save Receipt (Ctrl+S)
          </button>
        </div>
      </form>

      {/* Bill Allocation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#151521] w-[700px] max-h-[80vh] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e]">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase">Allocate Payment</h2>
                <div className="text-sm text-slate-500 font-semibold mt-1">Amount to Allocate: <span className="text-blue-600 dark:text-blue-400">₹{parseFloat(currentAmountToAllocate).toFixed(2)}</span></div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white dark:bg-[#151521] shadow-sm z-10">
                  <tr className="border-b-2 border-slate-200 dark:border-slate-800">
                    <th className="p-2 text-xs font-semibold text-slate-500 uppercase">Select (Y/N)</th>
                    <th className="p-2 text-xs font-semibold text-slate-500 uppercase">Bill No</th>
                    <th className="p-2 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="p-2 text-xs font-semibold text-slate-500 uppercase text-right">Bill Total</th>
                    <th className="p-2 text-xs font-semibold text-slate-500 uppercase text-right">Balance</th>
                    <th className="p-2 text-xs font-semibold text-slate-500 uppercase text-right">Allocated</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidBills.map((bill) => {
                    const isChecked = !!allocatedBills[bill.id];
                    return (
                      <tr key={bill.id} className={`border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isChecked ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                        <td className="p-2 text-center">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => handleAllocateAmount(bill.id, e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-2 text-sm font-medium text-slate-800 dark:text-slate-200">{bill.billInfo?.billNo}</td>
                        <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{bill.billInfo?.date}</td>
                        <td className="p-2 text-sm font-medium text-slate-700 dark:text-slate-300 text-right">₹{bill.total.toFixed(2)}</td>
                        <td className="p-2 text-sm font-bold text-red-600 dark:text-red-400 text-right">₹{bill.balance.toFixed(2)}</td>
                        <td className="p-2 text-sm font-bold text-green-600 dark:text-green-400 text-right">
                          {isChecked ? `₹${(allocatedBills[bill.id] || 0).toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e] flex justify-between items-center">
              <div className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Total Allocated: <span className="text-green-600 dark:text-green-400 ml-2">₹{Object.values(allocatedBills).reduce((sum, val) => sum + val, 0).toFixed(2)}</span>
              </div>
              <button 
                onClick={confirmAllocation}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors border-none cursor-pointer"
              >
                <Check size={18} /> Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Component */}
      <div className="hidden">
        {lastSavedReceipt && <PrintReceipt ref={printRef} receiptData={lastSavedReceipt} />}
      </div>
    </div>
  );
}
