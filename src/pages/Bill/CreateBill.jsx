import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Save, Printer, Plus, Trash2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PrintInvoice from './PrintInvoice';
import Swal from 'sweetalert2';

// Dummy Books for suggestions
const dummyBooks = [
  { id: 1, name: "10 அமுதாசுரபி தமிழ்", rate: 120.00 },
  { id: 2, name: "8 சமூக அறிவியல்", rate: 110.00 },
  { id: 3, name: "8 ச மூ வரைபட பயிற்சி", rate: 20.00 },
  { id: 4, name: "8 MAP DRAWING ENGLISH", rate: 20.00 },
  { id: 5, name: "9 ச மூ வரைபட பயிற்சி", rate: 25.00 },
];

const dummyClients = [
  { name: 'Siva Bookstore', mobile: '9876543210', school: 'THIYAGARAJA HR SEC SCHOOL', address1: 'N.G.G. O. COLONY', address2: 'Srivilliputtur Taluk - 626125', district: 'Virudhunagar District', phone: '9585549567' },
  { name: 'National Publishers', mobile: '8877665544', school: 'NATIONAL PUBLIC SCHOOL', address1: 'Main Road', address2: 'Delhi - 110001', district: 'New Delhi', phone: '011-2345678' },
  { name: 'Kumar Stationery', mobile: '9988776655', school: 'KUMAR MATRICULATION', address1: 'RS Puram', address2: 'Coimbatore - 641002', district: 'Coimbatore', phone: '0422-254567' },
];

export default function CreateBill() {
  const printRef = useRef();

  const [billInfo, setBillInfo] = useState({
    billNo: '8200',
    date: new Date().toLocaleDateString('en-GB'),
    transport: 'DIRECT SALES',
    destination: '',
    bundles: '0',
    lrDate: new Date().toLocaleDateString('en-GB'),
    lrNo: '',
    eWayBillNo: ''
  });

  const [customer, setCustomer] = useState({
    name: '',
    school: '',
    address1: '',
    address2: '',
    district: '',
    phone: '',
    mobile: ''
  });

  const handleMobileChange = (e) => {
    const val = e.target.value;
    const found = dummyClients.find(c => c.mobile === val);
    if (found) {
      setCustomer(found);
    } else {
      setCustomer({ name: '', mobile: val, school: '', address1: '', address2: '', district: '', phone: '' });
    }
  };

  const handleClientChange = (e) => {
    const val = e.target.value;
    const found = dummyClients.find(c => c.name === val);
    if (found) {
      setCustomer(found);
    } else {
      setCustomer({ name: val, mobile: '', school: '', address1: '', address2: '', district: '', phone: '' });
    }
  };

  const [items, setItems] = useState([
    { id: 1, particulars: '', rate: '', qty: '', teachersCopy: '0', amount: '' }
  ]);

  // Handle global F2 shortcut for save
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [items, billInfo, customer]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice_${billInfo.billNo}`,
  });

  const handleSave = () => {
    Swal.fire({
      title: 'Bill Saved!',
      text: 'Do you want to print the invoice now?',
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
  };

  // Keyboard navigation helper
  const handleKeyDown = (e, rowIndex, field) => {
    if (e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      // Move to next field
      const fields = ['particulars', 'rate', 'qty', 'teachersCopy', 'amount'];
      const currentIndex = fields.indexOf(field);
      
      if (currentIndex < fields.length - 1) {
        const nextField = fields[currentIndex + 1];
        const nextInput = document.getElementById(`item-${rowIndex}-${nextField}`);
        if (nextInput) nextInput.focus();
      } else if (field === 'amount') {
        // Last field of row, add new row and focus its particulars
        if (rowIndex === items.length - 1) {
          addRow();
          setTimeout(() => {
            const nextInput = document.getElementById(`item-${rowIndex + 1}-particulars`);
            if (nextInput) nextInput.focus();
          }, 50);
        } else {
          // Focus next row particulars
          const nextInput = document.getElementById(`item-${rowIndex + 1}-particulars`);
          if (nextInput) nextInput.focus();
        }
      }
    } else if (e.key === 'ArrowLeft') {
       e.preventDefault();
       const fields = ['particulars', 'rate', 'qty', 'teachersCopy', 'amount'];
       const currentIndex = fields.indexOf(field);
       if (currentIndex > 0) {
         const prevField = fields[currentIndex - 1];
         const prevInput = document.getElementById(`item-${rowIndex}-${prevField}`);
         if (prevInput) prevInput.focus();
       }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIndex < items.length - 1) {
        const downInput = document.getElementById(`item-${rowIndex + 1}-${field}`);
        if (downInput) downInput.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) {
        const upInput = document.getElementById(`item-${rowIndex - 1}-${field}`);
        if (upInput) upInput.focus();
      }
    }
  };

  const addRow = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now(), particulars: '', rate: '', qty: '', teachersCopy: '0', amount: '' }
    ]);
  };

  const removeRow = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Auto calculate amount
    if (field === 'qty' || field === 'rate') {
      const rate = parseFloat(newItems[index].rate) || 0;
      const qty = parseFloat(newItems[index].qty) || 0;
      if (rate && qty) {
        newItems[index].amount = (rate * qty).toFixed(2);
      } else {
        newItems[index].amount = '';
      }
    }
    
    // Auto suggest book if particulars matches exactly (simple simulation)
    if (field === 'particulars') {
       const book = dummyBooks.find(b => b.name.toLowerCase().startsWith(value.toLowerCase()));
       if (book && value.length > 2) {
         // Optionally you could show a dropdown, but for quick entry we just log or fill.
         // Real app would use a combo box.
       }
    }

    setItems(newItems);
  };

  const totals = items.reduce((acc, item) => {
    acc.qty += parseFloat(item.qty) || 0;
    acc.amount += parseFloat(item.amount) || 0;
    return acc;
  }, { qty: 0, amount: 0 });

  const printData = {
    billInfo, customer, items: items.filter(i => i.particulars), totals
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Create Bill</h1>
          <p className="text-slate-500 text-sm">Press <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs">Enter</kbd> to move next. Press <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs">F2</kbd> to Save.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded font-medium flex items-center gap-2 transition-colors border-none cursor-pointer">
            <Printer size={18} /> Print
          </button>
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2 transition-colors border-none cursor-pointer">
            <Save size={18} /> Save (F2)
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col xl:flex-row gap-0">
        
        {/* LEFT COLUMN - Customer Info */}
        <div className="xl:w-1/3 p-4 border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e]">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">BILL TO</h3>
          
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Mobile No</label>
              <input 
                id="mobileNo"
                type="text" 
                value={customer.mobile}
                onChange={handleMobileChange}
                onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); document.getElementById('clientSelect').focus(); }}}
                placeholder="Type mobile to auto-fill..."
                className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Customer / Ledger Name</label>
              <select 
                id="clientSelect"
                value={customer.name}
                onChange={handleClientChange}
                onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); document.getElementById('transport').focus(); }}}
                className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm"
              >
                <option value="">Select a Client</option>
                {dummyClients.map(c => (
                  <option key={c.mobile} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            
            {customer.name && (
              <div className="mt-2 p-2 bg-slate-100 dark:bg-[#151521] rounded border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <p className="font-semibold text-slate-800 dark:text-slate-200">{customer.name}</p>
                {customer.school && <p>{customer.school}</p>}
                {customer.address1 && <p>{customer.address1}</p>}
                <p>{customer.district}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - Bill Info */}
        <div className="xl:w-2/3 p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Bill No</label>
            <input 
              type="text" 
              value={billInfo.billNo}
              onChange={(e) => setBillInfo({...billInfo, billNo: e.target.value})}
              className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-[#1a1a2e] text-slate-900 dark:text-white text-sm font-bold"
              readOnly
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Date</label>
            <input 
              type="text" 
              value={billInfo.date}
              onChange={(e) => setBillInfo({...billInfo, date: e.target.value})}
              className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Transport</label>
            <input 
              id="transport"
              type="text" 
              value={billInfo.transport}
              onChange={(e) => setBillInfo({...billInfo, transport: e.target.value})}
              onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); document.getElementById('item-0-particulars').focus(); }}}
              className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm uppercase"
            />
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="mt-4 bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-700">
                <th className="p-2 w-12 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">S.No</th>
                <th className="p-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Particulars (Book)</th>
                <th className="p-2 w-24 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">Rate</th>
                <th className="p-2 w-24 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">Qty</th>
                <th className="p-2 w-24 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 leading-tight">Teachers<br/>Copy</th>
                <th className="p-2 w-32 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">Amount</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1a1a2e]/50">
                  <td className="p-2 text-center text-sm font-medium text-slate-500">{index + 1}</td>
                  <td className="p-1">
                    <input 
                      id={`item-${index}-particulars`}
                      type="text" 
                      value={item.particulars}
                      onChange={(e) => handleItemChange(index, 'particulars', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'particulars')}
                      placeholder="Type book name..."
                      className="w-full px-2 py-1.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 rounded bg-transparent focus:bg-white dark:focus:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm outline-none transition-all"
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      id={`item-${index}-rate`}
                      type="number" 
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'rate')}
                      className="w-full px-2 py-1.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 rounded bg-transparent focus:bg-white dark:focus:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm outline-none transition-all text-right"
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      id={`item-${index}-qty`}
                      type="number" 
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'qty')}
                      className="w-full px-2 py-1.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 rounded bg-transparent focus:bg-white dark:focus:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm outline-none transition-all text-center"
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      id={`item-${index}-teachersCopy`}
                      type="number" 
                      value={item.teachersCopy}
                      onChange={(e) => handleItemChange(index, 'teachersCopy', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'teachersCopy')}
                      className="w-full px-2 py-1.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 rounded bg-transparent focus:bg-white dark:focus:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm outline-none transition-all text-center text-red-500 font-semibold"
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      id={`item-${index}-amount`}
                      type="number" 
                      value={item.amount}
                      onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'amount')}
                      readOnly
                      className="w-full px-2 py-1.5 border-transparent rounded bg-transparent text-slate-900 dark:text-white text-sm outline-none font-bold text-right cursor-default"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeRow(item.id)} className="text-red-400 hover:text-red-600 transition-colors" tabIndex="-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-[#1a1a2e] border-t border-slate-200 dark:border-slate-700">
                <td colSpan="2" className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">TOTAL:</td>
                <td></td>
                <td className="p-3 text-center font-bold text-slate-900 dark:text-white">{totals.qty}</td>
                <td></td>
                <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400 text-lg">₹{totals.amount.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Hidden Print Component */}
      <div className="hidden">
        <PrintInvoice ref={printRef} billData={printData} />
      </div>

    </div>
  );
}
