import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, RefreshCw, Search, X, Check, Printer } from 'lucide-react';
import Swal from 'sweetalert2';
import { useReactToPrint } from 'react-to-print';
import PrintReceipt from './PrintReceipt';
import { receiptsApi, clientsApi, billsApi, banksApi } from '../../services/api';

export default function ReceiptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [clients, setClients] = useState([]);
  const [bills, setBills] = useState([]);
  const [banks, setBanks] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalAllocations, setOriginalAllocations] = useState({});
  const [allReceipts, setAllReceipts] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    voucherNo: '',
    date: new Date().toISOString().split('T')[0],
    accountName: 'CASH', // default
    customerName: '',
    billNo: '',
    amount: '',
    shortage: '',
    narrationSno: '',
    narrationPg: '',
    narrationDate: ''
  });

  // Autocomplete State
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showBillDropdown, setShowBillDropdown] = useState(false);
  const [filteredBillsList, setFilteredBillsList] = useState([]);
  const clientInputRef = useRef(null);
  const billInputRef = useRef(null);
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
    const fetchData = async () => {
      try {
        const [clientsData, billsData, receiptsData, banksData] = await Promise.all([
          clientsApi.getAll(),
          billsApi.getAll(),
          receiptsApi.getAll(),
          banksApi.getAll()
        ]);

        const mappedClients = clientsData.map(c => ({
          id: c.id,
          ledgerName: c.name || '',
          mobileNo: c.mobile || ''
        }));
        setClients(mappedClients);

        const mappedBills = billsData.map(b => {
          const cust = clientsData.find(c => c.id === b.customer_id);
          return {
            id: b.id,
            billInfo: { billNo: b.bill_no, date: b.date },
            customer: { name: cust ? cust.name : '' },
            totals: { amount: b.net_amount },
            amountPaid: b.amount_paid || 0,
            customer_id: b.customer_id
          };
        });
        setBills(mappedBills);
        setBanks(banksData);
        setAllReceipts(receiptsData);

        if (id) {
          const existingReceipt = receiptsData.find(r => r.id.toString() === id);
          if (existingReceipt) {
            setIsEditMode(true);
            setFormData({
              voucherNo: existingReceipt.receipt_no || '',
              date: existingReceipt.date || new Date().toISOString().split('T')[0],
              accountName: existingReceipt.payment_mode || 'CASH',
              customerName: '', 
              billNo: '',
              amount: existingReceipt.amount || '',
              shortage: existingReceipt.shortage || '',
              narrationSno: existingReceipt.narration_sno || '',
              narrationPg: existingReceipt.narration_pg || '',
              narrationDate: existingReceipt.narration_date || ''
            });
            
            if (existingReceipt.customer_id) {
               const c = clientsData.find(cl => cl.id === existingReceipt.customer_id);
               if (c) setFormData(prev => ({...prev, customerName: c.name}));
            }
            
            let parsedAlloc = {};
            try {
              if (typeof existingReceipt.allocations === 'string') {
                parsedAlloc = JSON.parse(existingReceipt.allocations);
              } else if (existingReceipt.allocations) {
                parsedAlloc = existingReceipt.allocations;
              }
            } catch (e) {
              console.error('Failed to parse allocations', e);
            }
            setAllocatedBills(parsedAlloc);
            setOriginalAllocations(parsedAlloc);
          } else {
            Swal.fire('Error', 'Receipt not found', 'error');
            navigate('/reports/all-receipts');
          }
        } else {
          const maxVoucher = receiptsData.reduce((max, r) => {
            const num = parseInt(r.receipt_no, 10);
            return (!isNaN(num) && num > max) ? num : max;
          }, 0);
          const nextVoucher = (maxVoucher + 1).toString().padStart(3, '0');
          setFormData(prev => ({ ...prev, voucherNo: nextVoucher }));
        }
      } catch (err) {
        console.error(err);
        if (!id) setFormData(prev => ({ ...prev, voucherNo: '001' }));
      }
    };

    fetchData();
  }, [id, navigate]);

  // Calculate total pending amount for selected customer
  const totalPendingAmount = React.useMemo(() => {
    if (!formData.customerName) return 0;
    const customerBills = bills.filter(b => b.customer?.name === formData.customerName);
    
    let totalPending = 0;
    customerBills.forEach(b => {
      const total = parseFloat(b.totals?.amount || 0);
      const originalAlloc = originalAllocations[b.id] || 0;
      const actualPaidExcludingThisReceipt = parseFloat(b.amountPaid || 0) - originalAlloc;
      
      const balance = total - actualPaidExcludingThisReceipt;
      if (balance > 0) {
        totalPending += balance;
      }
    });
    return totalPending;
  }, [formData.customerName, bills, originalAllocations]);

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
    setTimeout(() => billInputRef.current?.focus(), 100);
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
        
        // If we are in edit mode, the 'amountPaid' currently includes our ORIGINAL allocation.
        // We should temporarily subtract the original allocation so the user can re-allocate the full pending amount.
        const originalAlloc = originalAllocations[b.id] || 0;
        const actualPaidExcludingThisReceipt = parseFloat(b.amountPaid || 0) - originalAlloc;
        
        const balance = total - actualPaidExcludingThisReceipt;
        return { ...b, balance, total, paid: actualPaidExcludingThisReceipt };
      }).filter(b => b.balance > 0 || allocatedBills[b.id]); // also include if currently allocated

      if (unpaid.length === 0) {
        Swal.fire('Info', 'No unpaid bills found for this customer.', 'info');
        return;
      }

      setUnpaidBills(unpaid);
      setCurrentAmountToAllocate(amount);
      // Removed setAllocatedBills({}) so it retains existing allocations when editing
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

  const saveReceipt = async () => {
    // Find customer ID
    const customer = clients.find(c => c.ledgerName === formData.customerName);
    
    const payload = {
      receipt_no: formData.voucherNo,
      date: formData.date,
      customer_id: customer ? customer.id : null,
      amount: formData.amount,
      payment_mode: formData.accountName,
      reference_no: '',
      remarks: '',
      created_by: 'Admin',
      shortage: formData.shortage ? parseFloat(formData.shortage) : 0,
      narration_sno: formData.narrationSno,
      narration_pg: formData.narrationPg,
      narration_date: formData.narrationDate,
      allocations: allocatedBills
    };

    try {
      if (isEditMode) {
        await receiptsApi.update(id, payload);
      } else {
        await receiptsApi.create(payload);
      }

      setLastSavedReceipt(formData);

      Swal.fire({
        title: 'Success',
        text: isEditMode ? 'Receipt updated successfully!' : 'Receipt saved successfully! Do you want to print it?',
        icon: 'success',
        showCancelButton: !isEditMode,
        confirmButtonText: isEditMode ? 'OK' : 'Yes, Print',
        cancelButtonText: 'No'
      }).then((result) => {
        if (!isEditMode && result.isConfirmed) {
          setTimeout(handlePrint, 500); 
        }
        if (isEditMode) {
          navigate('/reports/all-receipts');
        } else {
          // Reset Form
          const maxVoucher = allReceipts.reduce((max, r) => {
            const num = parseInt(r.receipt_no, 10);
            return (!isNaN(num) && num > max) ? num : max;
          }, 0);
          const nextVoucher = (Math.max(maxVoucher, parseInt(formData.voucherNo)) + 1).toString().padStart(3, '0');
          setFormData({
            voucherNo: nextVoucher,
            date: new Date().toISOString().split('T')[0],
            accountName: 'CASH',
            customerName: '',
            billNo: '',
            amount: '',
            shortage: '',
            narrationSno: '',
            narrationPg: '',
            narrationDate: ''
          });
          setAllocatedBills({});
          setTimeout(() => {
            if (clientInputRef.current) {
              clientInputRef.current.focus();
            }
          }, 50);
        }
      });
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Failed to save receipt: ' + (e.message || 'Unknown error'), 'error');
      return;
    }

  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">{isEditMode ? 'Edit Receipt' : 'Receipt Voucher'}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{isEditMode ? 'Modify existing payment receipt' : 'Create payment receipts and allocate amounts to unpaid bills.'}</p>
        </div>
        {isEditMode && (
          <button onClick={() => navigate('/reports/all-receipts')} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md font-semibold text-slate-700 dark:text-slate-200 transition-colors">
            Back to All
          </button>
        )}
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
              <select
                value={formData.accountName}
                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-bold"
              >
                {['CASH', ...banks.map(b => typeof b === 'string' ? b : (b?.name || '')).filter(b => b?.toUpperCase() !== 'CASH')].map((bName, i) => (
                  <option key={i} value={bName}>{bName}</option>
                ))}
              </select>
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
                      <div className="flex flex-col">
                        <span className="font-medium">{client.ledgerName} {client.mobileNo && `(${client.mobileNo})`}</span>
                        {client.address && <span className="text-xs text-slate-500 opacity-80 truncate">{client.address}{client.city ? `, ${client.city}` : ''}</span>}
                      </div>
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
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-[#1a1a2e] rounded-b-lg">
          <div>
            {formData.customerName && totalPendingAmount > 0 && (
              <div className="text-red-600 dark:text-red-400 font-bold text-lg animate-in fade-in slide-in-from-left-2">
                Total Pending: ₹{totalPendingAmount.toFixed(2)}
              </div>
            )}
          </div>
          <button 
            type="submit" 
            id="receiptSubmitBtn"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-md font-medium transition-colors cursor-pointer border-none shadow-md"
          >
            <Save size={18} />
            {isEditMode ? 'Update Receipt' : 'Save Receipt (Ctrl+S)'}
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
