import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Printer, Trash2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PrintInvoice from './PrintInvoice';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';



export default function CreateBill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  
  const printRef = useRef();
  
  const [dbClients, setDbClients] = useState([]);

  const [booksList, setBooksList] = useState([]);
  const [transportsList, setTransportsList] = useState([]);

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
    const defaultBooks = [
      { id: 1, itemCode: 'BK001', hsnCode: '49011010', itemName: "10 அமுதாசுரபி தமிழ்", mrp: "120.00" },
      { id: 2, itemCode: 'BK002', hsnCode: '49011010', itemName: "8 சமூக அறிவியல்", mrp: "110.00" },
      { id: 3, itemCode: 'BK003', hsnCode: '49011010', itemName: "8 ச மூ வரைபட பயிற்சி", mrp: "20.00" },
      { id: 4, itemCode: 'BK004', hsnCode: '49011010', itemName: "8 MAP DRAWING ENGLISH", mrp: "20.00" },
      { id: 5, itemCode: 'BK005', hsnCode: '49011010', itemName: "9 ச மூ வரைபட பயிற்சி", mrp: "25.00" },
    ];
    let savedBooks = localStorage.getItem('books');
    let parsedBooks = savedBooks ? JSON.parse(savedBooks) : [];
    if (parsedBooks.length === 0) {
      localStorage.setItem('books', JSON.stringify(defaultBooks));
      parsedBooks = defaultBooks;
    }
    setBooksList(parsedBooks);
    
    // Load Transports
    const savedTransports = JSON.parse(localStorage.getItem('transports') || '[]');
    setTransportsList(savedTransports);
    
    // Determine next Bill No
    const savedBills = localStorage.getItem('bills');
    if (savedBills) {
      const parsed = JSON.parse(savedBills);
      
      if (id) {
        // Edit mode
        const billToEdit = parsed.find(b => b.id.toString() === id);
        if (billToEdit) {
          setIsEditMode(true);
          setBillInfo(billToEdit.billInfo);
          setCustomer(billToEdit.customer);
          setItems(billToEdit.items);
        }
      } else if (parsed.length > 0) {
        // Create mode
        const lastBillNo = parseInt(parsed[parsed.length - 1].billInfo.billNo) || 0;
        const nextNo = String(lastBillNo + 1).padStart(3, '0');
        setBillInfo(prev => ({ ...prev, billNo: nextNo }));
      }
    }
  }, [id]);

  const [billInfo, setBillInfo] = useState({
    billNo: '001',
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
    const found = dbClients.find(c => c.mobile === val);
    if (found) {
      setCustomer(found);
    } else {
      setCustomer(prev => ({ ...prev, mobile: val }));
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const found = dbClients.find(c => c.name === val);
    if (found) {
      setCustomer(found);
    } else {
      setCustomer(prev => ({ ...prev, name: val }));
    }
  };

  const [items, setItems] = useState([
    { id: 1, itemCode: '', hsnCode: '', itemName: '', rate: '', qty: '', teachersCopy: '0', amount: '' }
  ]);
  
  // States for Autocomplete Combo Box
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);

  // States for Customer Autocomplete
  const [activeSearchField, setActiveSearchField] = useState(null);
  const [activeClientOptionIndex, setActiveClientOptionIndex] = useState(0);
  
  // States for Transport Autocomplete
  const [showTransportDropdown, setShowTransportDropdown] = useState(false);
  const [filteredTransports, setFilteredTransports] = useState([]);
  const [activeTransportIndex, setActiveTransportIndex] = useState(0);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'F2' || (e.ctrlKey && e.key.toLowerCase() === 's')) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [items, billInfo, customer]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${billInfo.billNo}`,
  });

  const handleSave = () => {
    // Save to localStorage
    const savedBills = localStorage.getItem('bills');
    const parsedBills = savedBills ? JSON.parse(savedBills) : [];
    
    // Only save valid items
    const validItems = items.filter(i => i.itemName);
    if (validItems.length === 0) {
      Swal.fire('Error', 'Please add at least one item to save the bill.', 'error');
      return;
    }

    const newBill = {
      id: Date.now(),
      billInfo,
      customer,
      items: validItems,
      totals
    };
    
    if (isEditMode) {
      const updatedBills = parsedBills.map(b => b.id.toString() === id ? newBill : b);
      localStorage.setItem('bills', JSON.stringify(updatedBills));
    } else {
      parsedBills.push(newBill);
      localStorage.setItem('bills', JSON.stringify(parsedBills));
    }

    Swal.fire({
      title: isEditMode ? 'Bill Updated Successfully!' : 'Bill Saved Successfully!',
      text: 'Do you want to print the bill?',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Yes, Print',
      cancelButtonText: 'No',
      confirmButtonColor: '#2563eb'
    }).then((result) => {
      if (result.isConfirmed) {
        handlePrint();
      }
      if (isEditMode) {
        navigate('/bill/all');
      } else {
        // Prepare next bill No
        const nextNo = String(parseInt(billInfo.billNo) + 1).padStart(3, '0');
        setBillInfo(prev => ({ ...prev, billNo: nextNo }));
        
        // Reset customer and items for new bill
        setCustomer({
          name: '', school: '', address1: '', address2: '', district: '', phone: '', mobile: ''
        });
        setItems([{ id: Date.now(), itemCode: '', hsnCode: '', itemName: '', rate: '', qty: '', teachersCopy: '0', amount: '' }]);
      }
    });
  };

  const handleKeyDown = (e, rowIndex, field) => {
    // Autocomplete navigation logic
    if (field === 'itemName' && activeRowIndex === rowIndex) {
      const filteredBooks = booksList.filter(b => (b.itemName || '').toLowerCase().includes((items[rowIndex].itemName || '').toLowerCase()));
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveOptionIndex(prev => (prev < filteredBooks.length - 1 ? prev + 1 : prev));
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveOptionIndex(prev => (prev > 0 ? prev - 1 : 0));
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredBooks.length > 0) {
          const selectedBook = filteredBooks[activeOptionIndex];
          handleItemSelection(rowIndex, selectedBook);
          setActiveRowIndex(null);
          // Focus rate field
          setTimeout(() => {
            const nextInput = document.getElementById(`item-${rowIndex}-rate`);
            if (nextInput) nextInput.focus();
          }, 50);
        } else {
           setActiveRowIndex(null);
           setTimeout(() => {
            const nextInput = document.getElementById(`item-${rowIndex}-rate`);
            if (nextInput) nextInput.focus();
          }, 50);
        }
        return;
      } else if (e.key === 'Escape') {
        setActiveRowIndex(null);
        return;
      }
    }

    if (e.key === 'Enter' || e.key === 'ArrowRight') {
      if (field === 'itemName' && activeRowIndex === rowIndex) return; // handled above
      
      e.preventDefault();
      const fields = ['itemCode', 'hsnCode', 'itemName', 'rate', 'qty', 'teachersCopy', 'amount'];
      const currentIndex = fields.indexOf(field);
      
      if (currentIndex < fields.length - 1) {
        const nextField = fields[currentIndex + 1];
        const nextInput = document.getElementById(`item-${rowIndex}-${nextField}`);
        if (nextInput) nextInput.focus();
      } else if (field === 'amount') {
        if (rowIndex === items.length - 1) {
          addRow();
          setTimeout(() => {
            const nextInput = document.getElementById(`item-${rowIndex + 1}-itemName`);
            if (nextInput) nextInput.focus();
          }, 50);
        } else {
          const nextInput = document.getElementById(`item-${rowIndex + 1}-itemName`);
          if (nextInput) nextInput.focus();
        }
      }
    } else if (e.key === 'ArrowLeft') {
       e.preventDefault();
       const fields = ['itemCode', 'hsnCode', 'itemName', 'rate', 'qty', 'teachersCopy', 'amount'];
       const currentIndex = fields.indexOf(field);
       if (currentIndex > 0) {
         const prevField = fields[currentIndex - 1];
         const prevInput = document.getElementById(`item-${rowIndex}-${prevField}`);
         if (prevInput) prevInput.focus();
       }
    } else if (e.key === 'ArrowDown') {
      if (field !== 'itemName') {
        e.preventDefault();
        if (rowIndex < items.length - 1) {
          const downInput = document.getElementById(`item-${rowIndex + 1}-${field}`);
          if (downInput) downInput.focus();
        }
      }
    } else if (e.key === 'ArrowUp') {
      if (field !== 'itemName') {
        e.preventDefault();
        if (rowIndex > 0) {
          const upInput = document.getElementById(`item-${rowIndex - 1}-${field}`);
          if (upInput) upInput.focus();
        }
      }
    }
  };

  const addRow = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now(), itemCode: '', hsnCode: '', itemName: '', rate: '', qty: '', teachersCopy: '0', amount: '' }
    ]);
  };

  const removeRow = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

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
    
    if (field === 'itemName') {
      setActiveRowIndex(index);
      setActiveOptionIndex(0);
    }

    setItems(newItems);
  };

  const totals = items.reduce((acc, item) => {
    acc.qty += parseFloat(item.qty) || 0;
    acc.amount += parseFloat(item.amount) || 0;
    return acc;
  }, { qty: 0, amount: 0 });

  // Map to the format PrintInvoice expects
  const printData = {
    billInfo, 
    customer, 
    items: items.filter(i => i.itemName).map(i => ({
      particulars: i.itemName,
      rate: i.rate,
      qty: i.qty,
      teachersCopy: i.teachersCopy,
      amount: i.amount
    })), 
    totals
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveRowIndex(null);
      setActiveSearchField(null);
      setShowTransportDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredClientsByMobile = dbClients.filter(c => c.mobile && c.mobile.includes(customer.mobile));
  const filteredClientsByName = dbClients.filter(c => c.name && c.name.toLowerCase().includes((customer.name || '').toLowerCase()));

  const handleClientKeyDown = (e, type) => {
    const list = type === 'mobile' ? filteredClientsByMobile : filteredClientsByName;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveClientOptionIndex(prev => (prev < list.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveClientOptionIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (list.length > 0 && activeSearchField) {
        setCustomer(list[activeClientOptionIndex]);
        setActiveSearchField(null);
        if (type === 'mobile') document.getElementById('clientName').focus();
        else document.getElementById('transport').focus();
      } else {
        setActiveSearchField(null);
        if (type === 'mobile') document.getElementById('clientName').focus();
        else document.getElementById('transport').focus();
      }
    } else if (e.key === 'Escape') {
      setActiveSearchField(null);
    }
  };

  // Transport handlers
  const handleTransportChange = (e) => {
    const val = e.target.value;
    setBillInfo({ ...billInfo, transport: val });
    
    if (val.trim()) {
      const filtered = transportsList.filter(t => {
        const tName = typeof t === 'string' ? t : t.name;
        return tName.toLowerCase().includes(val.toLowerCase());
      });
      setFilteredTransports(filtered);
      setShowTransportDropdown(true);
    } else {
      setShowTransportDropdown(false);
    }
  };

  const handleTransportKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveTransportIndex(prev => (prev < filteredTransports.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveTransportIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (showTransportDropdown && filteredTransports.length > 0) {
        const selected = filteredTransports[activeTransportIndex];
        const tName = typeof selected === 'string' ? selected : selected.name;
        const tDest = typeof selected === 'string' ? '' : selected.destination;
        setBillInfo(prev => ({ ...prev, transport: tName.toUpperCase(), destination: tDest.toUpperCase() }));
        setShowTransportDropdown(false);
        document.getElementById('bundles').focus();
      } else {
        setShowTransportDropdown(false);
        document.getElementById('destination').focus();
      }
    } else if (e.key === 'Escape') {
      setShowTransportDropdown(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">{isEditMode ? 'Edit Bill' : 'Create Bill'}</h1>
          <p className="text-slate-500 text-sm">Press <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs">Enter</kbd> to move next. Press <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs">F2</kbd> or <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs">Ctrl+S</kbd> to {isEditMode ? 'Update' : 'Save'}.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded font-medium flex items-center gap-2 transition-colors border-none cursor-pointer">
            <Printer size={18} /> Print
          </button>
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2 transition-colors border-none cursor-pointer">
            <Save size={18} /> {isEditMode ? 'Update (Ctrl+S)' : 'Save (Ctrl+S)'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col xl:flex-row gap-0">
        
        {/* LEFT COLUMN - Customer Info */}
        <div className="xl:w-1/2 p-4 border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e]">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">BILL TO</h3>
          
          <div className="flex flex-col gap-3">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Mobile No</label>
                <div onClick={(e) => e.stopPropagation()}>
                  <input 
                    id="mobileNo"
                    type="text" 
                    autoComplete="off"
                    value={customer.mobile}
                    onChange={handleMobileChange}
                    onFocus={() => { setActiveSearchField('mobile'); setActiveClientOptionIndex(0); }}
                    onKeyDown={(e) => handleClientKeyDown(e, 'mobile')}
                    placeholder="Type mobile..."
                    className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm"
                  />
                  {activeSearchField === 'mobile' && customer.mobile && (
                    <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white dark:bg-[#1E1E2D] border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredClientsByMobile.length > 0 ? (
                        <ul className="py-1">
                          {filteredClientsByMobile.map((c, i) => (
                            <li 
                              key={i}
                              onClick={() => {
                                setCustomer(c);
                                setActiveSearchField(null);
                                document.getElementById('clientName').focus();
                              }}
                              className={`px-3 py-2 cursor-pointer text-sm ${activeClientOptionIndex === i ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                              {c.mobile} - {c.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-3 py-2 text-sm text-slate-500 italic">No matches</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-[2] relative">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Customer / Ledger Name</label>
                <div onClick={(e) => e.stopPropagation()}>
                  <input 
                    id="clientName"
                    type="text"
                    autoComplete="off"
                    value={customer.name}
                    onChange={handleNameChange}
                    onFocus={() => { setActiveSearchField('name'); setActiveClientOptionIndex(0); }}
                    onKeyDown={(e) => handleClientKeyDown(e, 'name')}
                    placeholder="Type name..."
                    className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm"
                  />
                  {activeSearchField === 'name' && customer.name && (
                    <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white dark:bg-[#1E1E2D] border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredClientsByName.length > 0 ? (
                        <ul className="py-1">
                          {filteredClientsByName.map((c, i) => (
                            <li 
                              key={i}
                              onClick={() => {
                                setCustomer(c);
                                setActiveSearchField(null);
                                document.getElementById('transport').focus();
                              }}
                              className={`px-3 py-2 cursor-pointer text-sm ${activeClientOptionIndex === i ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                              {c.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-3 py-2 text-sm text-slate-500 italic">No matches</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {customer.name && (
              <div className="mt-1 p-3 bg-slate-100 dark:bg-[#151521] rounded-md border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-inner">
                <p className="font-bold text-slate-900 dark:text-white text-base mb-1">{customer.name}</p>
                {customer.school && <p>{customer.school}</p>}
                {customer.address1 && <p>{customer.address1}, {customer.address2}</p>}
                <p>{customer.district}</p>
                {customer.phone && <p>Phone: {customer.phone}</p>}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - Bill Info */}
        <div className="xl:w-1/2 p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Bill No</label>
            <input 
              type="text" 
              value={billInfo.billNo}
              className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-[#1a1a2e] text-slate-900 dark:text-white text-sm font-bold cursor-not-allowed"
              readOnly
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Date</label>
            <input 
              type="text" 
              value={billInfo.date}
              onChange={(e) => setBillInfo({...billInfo, date: e.target.value})}
              onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); document.getElementById('transport').focus(); }}}
              className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div className="flex flex-col gap-1 relative">
            <label className="text-xs font-semibold text-slate-500">Transport</label>
            <div onClick={(e) => e.stopPropagation()}>
              <input 
                id="transport"
                type="text" 
                autoComplete="off"
                value={billInfo.transport}
                onChange={handleTransportChange}
                onKeyDown={handleTransportKeyDown}
                onFocus={() => { if(filteredTransports.length > 0) setShowTransportDropdown(true); setActiveTransportIndex(0); }}
                className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm uppercase"
              />
              {showTransportDropdown && filteredTransports.length > 0 && billInfo.transport && (
                <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white dark:bg-[#1E1E2D] border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  <ul className="py-1">
                    {filteredTransports.map((t, i) => {
                      const tName = typeof t === 'string' ? t : t.name;
                      const tDest = typeof t === 'string' ? '' : t.destination;
                      return (
                        <li 
                          key={i}
                          onClick={() => {
                            setBillInfo(prev => ({ ...prev, transport: tName.toUpperCase(), destination: tDest.toUpperCase() }));
                            setShowTransportDropdown(false);
                            document.getElementById('bundles').focus();
                          }}
                          className={`px-3 py-2 cursor-pointer text-sm ${activeTransportIndex === i ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{tName}</span>
                            {tDest && <span className="text-xs text-slate-500 dark:text-slate-400">{tDest}</span>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Destination</label>
            <input 
              id="destination"
              type="text" 
              value={billInfo.destination}
              onChange={(e) => setBillInfo({...billInfo, destination: e.target.value})}
              onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); document.getElementById('bundles').focus(); }}}
              className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm uppercase"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">No of Bundles</label>
            <input 
              id="bundles"
              type="text" 
              value={billInfo.bundles}
              onChange={(e) => setBillInfo({...billInfo, bundles: e.target.value})}
              onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); document.getElementById('lrNo').focus(); }}}
              className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">LR No</label>
            <input 
              id="lrNo"
              type="text" 
              value={billInfo.lrNo}
              onChange={(e) => setBillInfo({...billInfo, lrNo: e.target.value})}
              onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); document.getElementById('eWayBillNo').focus(); }}}
              className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm uppercase"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">E Way Bill No</label>
            <input 
              id="eWayBillNo"
              type="text" 
              value={billInfo.eWayBillNo}
              onChange={(e) => setBillInfo({...billInfo, eWayBillNo: e.target.value})}
              onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); document.getElementById('item-0-itemName').focus(); }}}
              className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm uppercase"
            />
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="mt-4 bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-visible">
        <div className="overflow-visible min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-700">
                <th className="p-2 w-12 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">S.No</th>
                <th className="p-2 w-28 text-xs font-semibold text-slate-600 dark:text-slate-400">Item Code</th>
                <th className="p-2 w-28 text-xs font-semibold text-slate-600 dark:text-slate-400">HSN Code</th>
                <th className="p-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Item Name</th>
                <th className="p-2 w-24 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">Rate</th>
                <th className="p-2 w-24 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">Qty</th>
                <th className="p-2 w-24 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 leading-tight">Teachers<br/>Copy</th>
                <th className="p-2 w-32 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">Amount</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const filteredBooks = booksList.filter(b => (b.itemName || '').toLowerCase().includes((item.itemName || '').toLowerCase()));
                
                return (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1a1a2e]/50">
                    <td className="p-2 text-center text-sm font-medium text-slate-500">{index + 1}</td>
                    <td className="p-1">
                      <input 
                        id={`item-${index}-itemCode`}
                        type="text" 
                        value={item.itemCode}
                        onChange={(e) => handleItemChange(index, 'itemCode', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'itemCode')}
                        className="w-full px-2 py-1.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 rounded bg-transparent focus:bg-white dark:focus:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm outline-none transition-all uppercase"
                      />
                    </td>
                    <td className="p-1">
                      <input 
                        id={`item-${index}-hsnCode`}
                        type="text" 
                        value={item.hsnCode}
                        onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'hsnCode')}
                        className="w-full px-2 py-1.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 rounded bg-transparent focus:bg-white dark:focus:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm outline-none transition-all"
                      />
                    </td>
                    <td className="p-1 relative">
                      <div onClick={(e) => e.stopPropagation()}>
                        <input 
                          id={`item-${index}-itemName`}
                          type="text" 
                          autoComplete="off"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index, 'itemName')}
                          onFocus={() => {
                            setActiveRowIndex(index);
                            setActiveOptionIndex(0);
                          }}
                          placeholder="Type to search books..."
                          className="w-full px-2 py-1.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 rounded bg-transparent focus:bg-white dark:focus:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm outline-none transition-all"
                        />
                        {activeRowIndex === index && (
                          <div className="absolute z-50 top-full left-0 w-[400px] mt-1 bg-white dark:bg-[#1E1E2D] border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {filteredBooks.length > 0 ? (
                              <ul className="py-1">
                                {filteredBooks.map((book, bIndex) => (
                                  <li 
                                    key={book.id}
                                    onClick={() => {
                                      handleItemSelection(index, book);
                                      setActiveRowIndex(null);
                                      document.getElementById(`item-${index}-rate`)?.focus();
                                    }}
                                    className={`px-3 py-2 cursor-pointer text-sm flex justify-between items-center ${activeOptionIndex === bIndex ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                  >
                                    <span>{book.itemName}</span>
                                    <span className="text-xs text-slate-400">₹{(parseFloat(book.mrp) || 0).toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="px-3 py-2 text-sm text-slate-500 italic">No books found</div>
                            )}
                          </div>
                        )}
                      </div>
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
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-[#1a1a2e] border-t border-slate-200 dark:border-slate-700">
                <td colSpan="4" className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">TOTAL:</td>
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
