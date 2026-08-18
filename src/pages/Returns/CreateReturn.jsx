import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Printer, ArrowLeft } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PrintReturn from './PrintReturn';
import Swal from 'sweetalert2';

export default function CreateReturn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  
  const printRef = useRef();
  
  const [dbClients, setDbClients] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [allBills, setAllBills] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('clients');
    if (saved) {
      const parsed = JSON.parse(saved);
      const mapped = parsed.map(c => ({
        name: c.ledgerName || '',
        mobile: c.mobileNo || '',
        school: c.printName || '',
        address1: c.address || '',
        address2: c.city || '',
        district: c.district || '',
        phone: c.phoneNo || ''
      }));
      setDbClients(mapped);
    }

    // Load books
    const savedBooks = localStorage.getItem('books');
    const parsedBooks = savedBooks ? JSON.parse(savedBooks) : [];
    setBooksList(parsedBooks);
    
    // Load bills for connecting returns
    const savedBills = localStorage.getItem('bills');
    const parsedBills = savedBills ? JSON.parse(savedBills) : [];
    setAllBills(parsedBills);

    // Determine next Return No
    const savedReturns = localStorage.getItem('returns');
    if (savedReturns) {
      const parsed = JSON.parse(savedReturns);
      
      if (id) {
        // Edit mode
        const returnToEdit = parsed.find(b => b.id.toString() === id);
        if (returnToEdit) {
          setIsEditMode(true);
          setReturnInfo(returnToEdit.returnInfo);
          setCustomer(returnToEdit.customer);
          setItems(returnToEdit.items);
        }
      } else if (parsed.length > 0) {
        // Create mode
        const lastReturnNo = parseInt(parsed[parsed.length - 1].returnInfo.returnNo) || 0;
        const nextNo = String(lastReturnNo + 1).padStart(3, '0');
        setReturnInfo(prev => ({ ...prev, returnNo: nextNo }));
      }
    }
  }, [id]);

  const [returnInfo, setReturnInfo] = useState({
    returnNo: '001',
    date: new Date().toLocaleDateString('en-GB'),
    originalBillNo: '',
    transport: 'RETURNED BY HAND',
    reason: 'STOCK RETURN'
  });

  const [customer, setCustomer] = useState({
    name: '', school: '', address1: '', address2: '', district: '', phone: '', mobile: ''
  });

  const handleMobileChange = (e) => {
    const val = e.target.value;
    const found = dbClients.find(c => c.mobile === val);
    if (found) setCustomer(found);
    else setCustomer(prev => ({ ...prev, mobile: val }));
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const found = dbClients.find(c => c.name === val);
    if (found) setCustomer(found);
    else setCustomer(prev => ({ ...prev, name: val }));
  };

  const [items, setItems] = useState([
    { id: 1, itemCode: '', hsnCode: '', itemName: '', rate: '', qty: '', amount: '' }
  ]);
  
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);

  const [activeSearchField, setActiveSearchField] = useState(null);
  const [activeClientOptionIndex, setActiveClientOptionIndex] = useState(0);
  const [activeBillOptionIndex, setActiveBillOptionIndex] = useState(0);
  
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'F2' || (e.ctrlKey && e.key.toLowerCase() === 's')) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [items, returnInfo, customer]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Return_Invoice_${returnInfo.returnNo}`,
  });

  const handleSave = () => {
    const savedReturns = localStorage.getItem('returns');
    const parsedReturns = savedReturns ? JSON.parse(savedReturns) : [];
    
    const validItems = items.filter(i => i.itemName);
    if (validItems.length === 0) {
      Swal.fire('Error', 'Please add at least one item to save the return note.', 'error');
      return;
    }

    const newReturn = {
      id: isEditMode ? parseInt(id) : Date.now(),
      returnInfo,
      customer,
      items: validItems,
      totals
    };
    
    // Process Inventory Updates (only on create for now)
    if (!isEditMode) {
      const currentBooks = JSON.parse(localStorage.getItem('books') || '[]');
      const updatedBooks = currentBooks.map(book => {
        const returnedItem = validItems.find(i => i.itemName.toLowerCase() === book.itemName.toLowerCase());
        if (returnedItem && returnedItem.qty) {
          const addedStock = parseFloat(returnedItem.qty);
          const oldStock = parseFloat(book.currentStock || 0);
          return { ...book, currentStock: oldStock + addedStock };
        }
        return book;
      });
      localStorage.setItem('books', JSON.stringify(updatedBooks));

      // Mute Original Bill amounts if linked
      if (returnInfo.originalBillNo) {
        const currentBills = JSON.parse(localStorage.getItem('bills') || '[]');
        const billIndex = currentBills.findIndex(b => b.billInfo.billNo === returnInfo.originalBillNo);
        if (billIndex !== -1) {
          const originalBill = currentBills[billIndex];
          // Subtract returned items from original bill items
          const updatedBillItems = originalBill.items.map(origItem => {
            const returnedEquivalent = validItems.find(vi => vi.itemName.toLowerCase() === origItem.itemName.toLowerCase());
            if (returnedEquivalent) {
              const newQty = Math.max(0, parseFloat(origItem.qty) - parseFloat(returnedEquivalent.qty));
              const newAmount = newQty * parseFloat(origItem.rate);
              return { ...origItem, qty: newQty.toString(), amount: newAmount.toString() };
            }
            return origItem;
          });
          // Recalculate original bill totals
          const updatedTotals = updatedBillItems.reduce((acc, item) => {
            acc.qty += parseFloat(item.qty) || 0;
            acc.amount += parseFloat(item.amount) || 0;
            return acc;
          }, { qty: 0, amount: 0 });

          originalBill.items = updatedBillItems;
          originalBill.totals = updatedTotals;
          currentBills[billIndex] = originalBill;
          localStorage.setItem('bills', JSON.stringify(currentBills));
        }
      }
    }

    if (isEditMode) {
      const updatedReturns = parsedReturns.map(b => b.id.toString() === id ? newReturn : b);
      localStorage.setItem('returns', JSON.stringify(updatedReturns));
    } else {
      parsedReturns.push(newReturn);
      localStorage.setItem('returns', JSON.stringify(parsedReturns));
    }

    Swal.fire({
      title: isEditMode ? 'Return Note Updated!' : 'Return Note Saved!',
      text: 'Original bill has been deducted and inventory updated. Do you want to print?',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Yes, Print',
      cancelButtonText: 'No',
      confirmButtonColor: '#2563eb'
    }).then((result) => {
      if (result.isConfirmed) handlePrint();
      if (isEditMode) {
        navigate('/returns/all');
      } else {
        const nextNo = String(parseInt(returnInfo.returnNo) + 1).padStart(3, '0');
        setReturnInfo(prev => ({ ...prev, returnNo: nextNo, originalBillNo: '' }));
        setCustomer({ name: '', school: '', address1: '', address2: '', district: '', phone: '', mobile: '' });
        setItems([{ id: Date.now(), itemCode: '', hsnCode: '', itemName: '', rate: '', qty: '', amount: '' }]);
      }
    });
  };

  const handleKeyDown = (e, rowIndex, field) => {
    if (field === 'itemName' && activeRowIndex === rowIndex) {
      const filteredBooks = booksList.filter(b => (b.itemName || '').toLowerCase().includes((items[rowIndex].itemName || '').toLowerCase()));
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveOptionIndex(p => (p < filteredBooks.length - 1 ? p + 1 : p)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveOptionIndex(p => (p > 0 ? p - 1 : 0)); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredBooks.length > 0) {
          handleItemSelection(rowIndex, filteredBooks[activeOptionIndex]);
          setActiveRowIndex(null);
          setTimeout(() => document.getElementById(`item-${rowIndex}-rate`)?.focus(), 50);
        } else {
          setActiveRowIndex(null);
          setTimeout(() => document.getElementById(`item-${rowIndex}-rate`)?.focus(), 50);
        }
        return;
      }
      if (e.key === 'Escape') { setActiveRowIndex(null); return; }
    }

    if (e.key === 'Enter' || e.key === 'ArrowRight') {
      if (field === 'itemName' && activeRowIndex === rowIndex) return;
      e.preventDefault();
      const fields = ['itemCode', 'hsnCode', 'itemName', 'rate', 'qty', 'amount'];
      const currentIndex = fields.indexOf(field);
      
      if (currentIndex < fields.length - 1) {
        const nextInput = document.getElementById(`item-${rowIndex}-${fields[currentIndex + 1]}`);
        if (nextInput) nextInput.focus();
      } else if (field === 'amount') {
        if (rowIndex === items.length - 1) {
          addRow();
          setTimeout(() => document.getElementById(`item-${rowIndex + 1}-itemName`)?.focus(), 50);
        } else {
          document.getElementById(`item-${rowIndex + 1}-itemName`)?.focus();
        }
      }
    } else if (e.key === 'ArrowLeft') {
       e.preventDefault();
       const fields = ['itemCode', 'hsnCode', 'itemName', 'rate', 'qty', 'amount'];
       const currentIndex = fields.indexOf(field);
       if (currentIndex > 0) document.getElementById(`item-${rowIndex}-${fields[currentIndex - 1]}`)?.focus();
    } else if (e.key === 'ArrowDown' && field !== 'itemName') {
      e.preventDefault();
      if (rowIndex < items.length - 1) document.getElementById(`item-${rowIndex + 1}-${field}`)?.focus();
    } else if (e.key === 'ArrowUp' && field !== 'itemName') {
      e.preventDefault();
      if (rowIndex > 0) document.getElementById(`item-${rowIndex - 1}-${field}`)?.focus();
    }
  };

  const addRow = () => setItems(prev => [...prev, { id: Date.now(), itemCode: '', hsnCode: '', itemName: '', rate: '', qty: '', amount: '' }]);

  const handleItemSelection = (index, book) => {
    const newItems = [...items];
    newItems[index].itemName = book.itemName || '';
    newItems[index].itemCode = book.itemCode || '';
    newItems[index].hsnCode = book.hsnCode || '';
    const rate = parseFloat(book.mrp) || parseFloat(book.splPrice1) || 0;
    newItems[index].rate = rate.toFixed(2);
    const qty = parseFloat(newItems[index].qty) || 0;
    if (qty) newItems[index].amount = (rate * qty).toFixed(2);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'qty' || field === 'rate') {
      const rate = parseFloat(newItems[index].rate) || 0;
      const qty = parseFloat(newItems[index].qty) || 0;
      if (rate && qty) newItems[index].amount = (rate * qty).toFixed(2);
      else newItems[index].amount = '';
    }
    
    if (field === 'itemName') { setActiveRowIndex(index); setActiveOptionIndex(0); }
    setItems(newItems);
  };

  const totals = items.reduce((acc, item) => {
    acc.qty += parseFloat(item.qty) || 0;
    acc.amount += parseFloat(item.amount) || 0;
    return acc;
  }, { qty: 0, amount: 0 });

  const printData = { returnInfo, customer, items: items.filter(i => i.itemName), totals };

  useEffect(() => {
    const handleClickOutside = () => { setActiveRowIndex(null); setActiveSearchField(null); };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredClientsByMobile = dbClients.filter(c => c.mobile && c.mobile.includes(customer.mobile));
  const filteredClientsByName = dbClients.filter(c => c.name && c.name.toLowerCase().includes((customer.name || '').toLowerCase()));
  const filteredBills = allBills.filter(b => b.billInfo.billNo && b.billInfo.billNo.includes(returnInfo.originalBillNo));

  const handleClientKeyDown = (e, type) => {
    const list = type === 'mobile' ? filteredClientsByMobile : filteredClientsByName;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveClientOptionIndex(p => (p < list.length - 1 ? p + 1 : p)); } 
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveClientOptionIndex(p => (p > 0 ? p - 1 : 0)); } 
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (list.length > 0 && activeSearchField) {
        setCustomer(list[activeClientOptionIndex]);
        setActiveSearchField(null);
      } else { setActiveSearchField(null); }
      if (type === 'mobile') document.getElementById('clientName').focus();
      else document.getElementById('originalBillNo').focus();
    } 
    else if (e.key === 'Escape') setActiveSearchField(null);
  };

  const handleBillKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveBillOptionIndex(p => (p < filteredBills.length - 1 ? p + 1 : p)); } 
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveBillOptionIndex(p => (p > 0 ? p - 1 : 0)); } 
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredBills.length > 0 && activeSearchField === 'bill') {
        const selectedBill = filteredBills[activeBillOptionIndex];
        setReturnInfo(prev => ({...prev, originalBillNo: selectedBill.billInfo.billNo}));
        if(selectedBill.customer) setCustomer(selectedBill.customer);
        if(selectedBill.items) {
          const prefilledItems = selectedBill.items.map((it, idx) => ({
            ...it,
            id: Date.now() + idx,
            qty: '', // clear qty for return
            amount: ''
          }));
          setItems(prefilledItems);
        }
        setActiveSearchField(null);
      } else { setActiveSearchField(null); }
      document.getElementById('transport').focus();
    } 
    else if (e.key === 'Escape') setActiveSearchField(null);
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">{isEditMode ? 'Edit Return Invoice' : 'Create Return Invoice'}</h1>
          <p className="text-slate-500 text-sm">Process sales returns. Original bill amount will be reduced.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/returns/all')} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded font-medium flex items-center gap-2 transition-colors border-none cursor-pointer">
            <ArrowLeft size={18} /> Back
          </button>
          <button onClick={handlePrint} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded font-medium flex items-center gap-2 transition-colors border-none cursor-pointer">
            <Printer size={18} /> Print
          </button>
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2 transition-colors border-none cursor-pointer">
            <Save size={18} /> {isEditMode ? 'Update Invoice' : 'Save Invoice'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col xl:flex-row gap-0 border-t-4 border-t-blue-500">
        
        {/* LEFT COLUMN - Customer Info */}
        <div className="xl:w-1/2 p-4 border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e]">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">RETURN FROM (CUSTOMER)</h3>
          
          <div className="flex flex-col gap-3">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Mobile No</label>
                <div onClick={(e) => e.stopPropagation()}>
                  <input 
                    id="mobileNo" type="text" autoComplete="off" value={customer.mobile}
                    onChange={handleMobileChange} onFocus={() => { setActiveSearchField('mobile'); setActiveClientOptionIndex(0); }}
                    onKeyDown={(e) => handleClientKeyDown(e, 'mobile')} placeholder="Type mobile..."
                    className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-sm"
                  />
                  {activeSearchField === 'mobile' && customer.mobile && (
                    <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white dark:bg-[#1E1E2D] border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredClientsByMobile.map((c, i) => (
                        <li key={i} onClick={() => { setCustomer(c); setActiveSearchField(null); document.getElementById('clientName').focus(); }}
                            className={`px-3 py-2 cursor-pointer text-sm ${activeClientOptionIndex === i ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}>
                          {c.mobile} - {c.name}
                        </li>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-[2] relative">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Customer / Ledger Name</label>
                <div onClick={(e) => e.stopPropagation()}>
                  <input 
                    id="clientName" type="text" autoComplete="off" value={customer.name}
                    onChange={handleNameChange} onFocus={() => { setActiveSearchField('name'); setActiveClientOptionIndex(0); }}
                    onKeyDown={(e) => handleClientKeyDown(e, 'name')} placeholder="Type name..."
                    className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-sm"
                  />
                  {activeSearchField === 'name' && customer.name && (
                    <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white dark:bg-[#1E1E2D] border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredClientsByName.map((c, i) => (
                        <li key={i} onClick={() => { setCustomer(c); setActiveSearchField(null); document.getElementById('originalBillNo').focus(); }}
                            className={`px-3 py-2 cursor-pointer text-sm ${activeClientOptionIndex === i ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}>
                          {c.name}
                        </li>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {customer.name && (
              <div className="mt-1 p-3 bg-white dark:bg-[#151521] rounded-md border text-sm leading-relaxed shadow-sm">
                <p className="font-bold text-base mb-1">{customer.name}</p>
                <p>{customer.district}</p>
                {customer.phone && <p>Phone: {customer.phone}</p>}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - Return Info */}
        <div className="xl:w-1/2 p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Return Invoice No</label>
            <input type="text" value={returnInfo.returnNo} className="w-full px-2 py-1.5 border rounded bg-slate-100 text-sm font-bold cursor-not-allowed text-blue-600" readOnly />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Date</label>
            <input type="text" value={returnInfo.date} onChange={(e) => setReturnInfo({...returnInfo, date: e.target.value})} onKeyDown={(e) => { if(e.key==='Enter') document.getElementById('originalBillNo').focus(); }} className="w-full px-2 py-1.5 border rounded text-sm" />
          </div>
          <div className="flex flex-col gap-1 relative">
            <label className="text-xs font-semibold text-slate-500">Original Bill No (Link Bill)</label>
            <div onClick={(e) => e.stopPropagation()}>
              <input id="originalBillNo" type="text" value={returnInfo.originalBillNo} autoComplete="off" 
                onChange={(e) => setReturnInfo({...returnInfo, originalBillNo: e.target.value})} 
                onFocus={() => { setActiveSearchField('bill'); setActiveBillOptionIndex(0); }}
                onKeyDown={handleBillKeyDown}
                className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-sm uppercase font-semibold text-blue-700" 
                placeholder="Search Bill No to auto-fill..."
              />
              {activeSearchField === 'bill' && returnInfo.originalBillNo && (
                <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white dark:bg-[#1E1E2D] border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredBills.map((b, i) => (
                    <li key={i} onClick={() => { 
                          setReturnInfo(prev => ({...prev, originalBillNo: b.billInfo.billNo})); 
                          if(b.customer) setCustomer(b.customer); 
                          if(b.items) {
                            const prefilledItems = b.items.map((it, idx) => ({ ...it, id: Date.now() + idx, qty: '', amount: '' }));
                            setItems(prefilledItems);
                          }
                          setActiveSearchField(null); 
                          document.getElementById('transport').focus(); 
                        }}
                        className={`px-3 py-2 cursor-pointer text-sm ${activeBillOptionIndex === i ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}>
                      Bill: {b.billInfo.billNo} - {b.customer?.name}
                    </li>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Transport / Received By</label>
            <input id="transport" type="text" value={returnInfo.transport} onChange={(e) => setReturnInfo({...returnInfo, transport: e.target.value})} onKeyDown={(e) => { if(e.key==='Enter') document.getElementById('reason').focus(); }} className="w-full px-2 py-1.5 border rounded text-sm uppercase" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Reason</label>
            <input id="reason" type="text" value={returnInfo.reason} onChange={(e) => setReturnInfo({...returnInfo, reason: e.target.value})} onKeyDown={(e) => { if(e.key==='Enter') document.getElementById('item-0-itemName').focus(); }} className="w-full px-2 py-1.5 border rounded text-sm uppercase" />
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="mt-4 bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-visible">
        <div className="overflow-visible min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="p-2 w-12 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">S.No</th>
                <th className="p-2 w-28 text-xs font-semibold text-slate-600 dark:text-slate-400">Item Code</th>
                <th className="p-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Returned Item Name</th>
                <th className="p-2 w-24 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">Rate</th>
                <th className="p-2 w-24 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">Return Qty</th>
                <th className="p-2 w-32 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">Return Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const filteredBooks = booksList.filter(b => (b.itemName || '').toLowerCase().includes((item.itemName || '').toLowerCase()));
                return (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-2 text-center text-sm font-medium text-slate-500">{index + 1}</td>
                    <td className="p-1"><input id={`item-${index}-itemCode`} type="text" value={item.itemCode} onChange={(e) => handleItemChange(index, 'itemCode', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'itemCode')} className="w-full px-2 py-1.5 border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent text-sm uppercase" /></td>
                    <td className="p-1 relative">
                      <div onClick={(e) => e.stopPropagation()}>
                        <input id={`item-${index}-itemName`} type="text" autoComplete="off" value={item.itemName} onChange={(e) => handleItemChange(index, 'itemName', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'itemName')} onFocus={() => { setActiveRowIndex(index); setActiveOptionIndex(0); }} placeholder="Type to search books..." className="w-full px-2 py-1.5 border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent text-sm font-medium text-slate-900" />
                        {activeRowIndex === index && (
                          <div className="absolute z-50 top-full left-0 w-[400px] mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {filteredBooks.map((book, bIndex) => (
                              <li key={book.id} onClick={() => { handleItemSelection(index, book); setActiveRowIndex(null); document.getElementById(`item-${index}-rate`)?.focus(); }} className={`px-3 py-2 cursor-pointer text-sm flex justify-between ${activeOptionIndex === bIndex ? 'bg-blue-50' : 'hover:bg-slate-50'}`}><span>{book.itemName}</span></li>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-1"><input id={`item-${index}-rate`} type="number" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'rate')} className="w-full px-2 py-1.5 border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent text-sm text-right" /></td>
                    <td className="p-1"><input id={`item-${index}-qty`} type="number" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'qty')} className="w-full px-2 py-1.5 border-slate-300 bg-slate-50 hover:border-slate-400 focus:border-blue-500 rounded text-sm text-center font-bold text-slate-900" placeholder="0" /></td>
                    <td className="p-1"><input id={`item-${index}-amount`} type="number" value={item.amount} readOnly className="w-full px-2 py-1.5 border-transparent rounded bg-transparent text-sm font-bold text-right text-slate-800" /></td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan="4" className="p-3 text-right font-bold text-slate-700">TOTAL RETURNS:</td>
                <td className="p-3 text-center font-bold text-slate-800 text-base">{totals.qty}</td>
                <td className="p-3 text-right font-bold text-blue-600 text-lg">₹{totals.amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      <div className="hidden"><PrintReturn ref={printRef} returnData={printData} /></div>
    </div>
  );
}
