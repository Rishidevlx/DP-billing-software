import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Printer, Trash2, RefreshCw } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PrintInvoice from './PrintInvoice';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import { generateEInvoice } from '../../utils/einvoiceApi';
import { billsApi, clientsApi, booksApi, transportsApi } from '../../services/api';

export default function CreateBill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  
  const printRef = useRef();
  
  const [dbClients, setDbClients] = useState([]);

  const [booksList, setBooksList] = useState([]);
  const [transportsList, setTransportsList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, booksData, billsData, transportsData] = await Promise.all([
          clientsApi.getAll(),
          booksApi.getAll(),
          billsApi.getAll(),
          transportsApi.getAll()
        ]);
        
        const mappedClients = clientsData.map(c => ({
          id: c.id,
          name: c.name || '',
          mobile: c.mobile || '',
          school: c.school || '',
          address1: c.address1 || '',
          address2: c.address2 || '',
          town: c.town || '',
          district: c.district || '',
          phone: '',
          party_type: c.party_type || 'School'
        }));
        setDbClients(mappedClients);

        const mappedBooks = booksData.map(b => ({
          id: b.id,
          itemCode: b.alias_name || '',
          hsnCode: '',
          itemName: b.book_name || '',
          mrp: b.mrp || b.price || '0.00',
          price: b.price || '0.00',
          stock: b.stock || 0,
          school_rate: b.school_rate || 0,
          agent_rate: b.agent_rate || 0,
          customer_rate: b.customer_rate || 0,
          splPrice1: b.agent_rate || 0,
          splPrice2: b.school_rate || 0,
          splPrice3: b.customer_rate || 0
        }));
        setBooksList(mappedBooks);

        // Load Transports from DB
        setTransportsList(transportsData || []);

        if (id) {
          // Edit mode
          const billToEdit = billsData.find(b => b.id.toString() === id);
          if (billToEdit) {
            setIsEditMode(true);
            setBillInfo({
               billNo: billToEdit.bill_no,
               date: billToEdit.date,
               transport: billToEdit.transport,
               destination: billToEdit.destination,
               bundles: billToEdit.bundles,
               lrDate: billToEdit.lr_date || '',
               lrNo: billToEdit.lr_no || '',
               isEbill: Boolean(billToEdit.is_ebill),
               irn: billToEdit.irn || '',
               ackNo: billToEdit.ack_no || '',
               ackDate: billToEdit.ack_date || '',
               qrCode: billToEdit.qr_code || '',
               eWayBillNo: billToEdit.eway_bill_no || ''
            });
            
            if (billToEdit.customer_id) {
               const cust = mappedClients.find(c => c.id === billToEdit.customer_id);
               if (cust) setCustomer(cust);
            }
            
            if (billToEdit.items && billToEdit.items.length > 0) {
              setItems(billToEdit.items.map((item, idx) => {
                const book = mappedBooks.find(b => b.id === item.book_id);
                return {
                  id: idx + 1,
                  book_id: item.book_id,
                  itemName: book ? book.itemName : '',
                  itemCode: book ? book.itemCode : '',
                  qty: item.qty,
                  rate: item.rate,
                  amount: item.amount,
                  teachersCopy: item.teachers_copy || 0
                };
              }));
            }
            
            setBillSettings(prev => ({
              ...prev,
              discountPercent: billToEdit.discount_percent ?? '',
              discountAmount: billToEdit.discount_amount ?? '',
              freight: billToEdit.freight ?? '',
              roundOff: billToEdit.round_off ?? ''
            }));
          }
        } else {
          // Create mode
          const billNos = billsData.map(b => parseInt(b.bill_no) || 0);
          const nextNoInt = billNos.length > 0 ? Math.max(...billNos) + 1 : 1;
          const nextNo = String(nextNoInt).padStart(3, '0');
          setBillInfo(prev => ({ ...prev, billNo: nextNo }));
        }
      } catch (err) {
        console.error(err);
        if (!id) setBillInfo(prev => ({ ...prev, billNo: '001' }));
      }
    };
    fetchData();
  }, [id]);

  const [billInfo, setBillInfo] = useState({
    billNo: '001',
    date: new Date().toLocaleDateString('en-GB'),
    transport: 'DIRECT SALES',
    destination: '',
    bundles: '0',
    lrDate: '',
    lrNo: '',
    eWayBillNo: '',
    isEbill: false,
    irn: '',
    ackNo: '',
    ackDate: '',
    qrCode: ''
  });

  const [customer, setCustomer] = useState({
    name: '',
    school: '',
    address1: '',
    address2: '',
    town: '',
    district: '',
    phone: '',
    mobile: ''
  });

  const [billSettings, setBillSettings] = useState(() => {
    const saved = localStorage.getItem('defaultBillSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch(e) {}
    }
    return {
      itemDiscount: '',
      cash: '',
      discountPercent: '',
      discountAmount: '',
      freight: '',
      roundOff: '',
      inclTax: false,
      sendWhatsapp: false,
      priceType: 'mrp'
    };
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
  }, [items, billInfo, customer, billSettings]);

  // Auto-save draft whenever inputs change
  useEffect(() => {
    if (!isEditMode) {
      const draft = {
        billInfo,
        customer,
        items,
        billSettings
      };
      localStorage.setItem('billDraft', JSON.stringify(draft));
    }
  }, [billInfo, customer, items, billSettings, isEditMode]);

  const handleRefresh = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will clear all currently entered data!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, clear it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const savedBills = localStorage.getItem('bills');
        const parsed = savedBills ? JSON.parse(savedBills) : [];
        const billNos = parsed.map(b => parseInt(b.billInfo?.billNo) || 0);
        const nextNoInt = billNos.length > 0 ? Math.max(...billNos) + 1 : 1;
        const nextNo = String(nextNoInt).padStart(3, '0');
        
        setBillInfo({
          billNo: nextNo,
          date: new Date().toLocaleDateString('en-GB'),
          transport: 'DIRECT SALES',
          destination: '',
          bundles: '0',
          lrDate: '',
          lrNo: '',
          eWayBillNo: '',
          isEbill: false,
          irn: '',
          ackNo: '',
          ackDate: '',
          qrCode: ''
        });

        setCustomer({
          name: '', school: '', address1: '', address2: '', district: '', phone: '', mobile: ''
        });

        setItems([
          { id: Date.now(), itemCode: '', hsnCode: '', itemName: '', rate: '', qty: '', teachersCopy: '0', amount: '' }
        ]);

        const savedSettings = localStorage.getItem('defaultBillSettings');
        if (savedSettings) {
          try {
            setBillSettings({ ...JSON.parse(savedSettings), cash: '' });
          } catch(e) {}
        } else {
          setBillSettings({
            itemDiscount: '', cash: '', discountPercent: '', discountAmount: '', freight: '', roundOff: '', inclTax: false, sendWhatsapp: false, priceType: 'mrp'
          });
        }
      }
    });
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${billInfo.billNo}`,
  });

  const handleSave = async () => {
    // Only save valid items
    const validItems = items.filter(i => i.itemName);
    if (validItems.length === 0) {
      Swal.fire('Error', 'Please add at least one item to save the bill.', 'error');
      return;
    }

    let updatedBillInfo = { ...billInfo };

    // Auto Generate E-Invoice details if enabled and not already generated
    if (updatedBillInfo.isEbill && !updatedBillInfo.irn) {
      Swal.fire({
        title: 'Generating E-Invoice...',
        text: 'Please wait while we fetch details from the portal.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      try {
        const response = await generateEInvoice({
          billInfo: updatedBillInfo,
          customer,
          items: validItems,
          totals,
          billSettings
        });
        
        if (response.success) {
          updatedBillInfo = {
            ...updatedBillInfo,
            irn: response.data.irn,
            ackNo: response.data.ackNo,
            ackDate: response.data.ackDate,
            qrCode: response.data.qrCode
          };
          setBillInfo(updatedBillInfo);
          Swal.close();
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to generate E-Invoice. Please check your settings.', 'error');
        return;
      }
    }

    const payload = {
      bill_no: updatedBillInfo.billNo,
      date: updatedBillInfo.date,
      customer_id: customer.id || null,
      transport: updatedBillInfo.transport,
      destination: updatedBillInfo.destination,
      lr_no: updatedBillInfo.lrNo,
      lr_date: updatedBillInfo.lrDate,
      bundles: updatedBillInfo.bundles,
      gross_amount: totals.grossAmount,
      discount_percent: billSettings.discountPercent || 0,
      discount_amount: billSettings.discountAmount || 0,
      freight: billSettings.freight || 0,
      round_off: billSettings.roundOff || 0,
      net_amount: totals.netAmount,
      created_by: JSON.parse(localStorage.getItem('currentUser') || '{}').name || 'Admin',
      is_ebill: updatedBillInfo.isEbill ? 1 : 0,
      irn: updatedBillInfo.irn || '',
      ack_no: updatedBillInfo.ackNo || '',
      ack_date: updatedBillInfo.ackDate || '',
      qr_code: updatedBillInfo.qrCode || '',
      eway_bill_no: updatedBillInfo.eWayBillNo || '',
      items: validItems.map(item => {
        const book = booksList.find(b => b.itemName === item.itemName && b.itemCode === item.itemCode);
        return {
          book_id: book ? book.id : null,
          qty: item.qty,
          rate: item.rate,
          amount: item.amount,
          teachers_copy: item.teachersCopy || 0
        };
      }).filter(item => item.book_id !== null)
    };

    try {
      if (isEditMode) {
        await billsApi.update(id, payload);
      } else {
        await billsApi.create(payload);
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Failed to save bill to database', 'error');
      return;
    }

    Swal.fire({
      title: isEditMode ? 'Bill Updated Successfully!' : 'Bill Saved Successfully!',
      text: 'Do you want to print the bill?',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Yes, Print',
      cancelButtonText: 'No',
      confirmButtonColor: '#2563eb'
    }).then(async (result) => {
      if (result.isConfirmed) {
        handlePrint();
      }
      if (isEditMode) {
        navigate('/bill/all');
      } else {
        // Clear draft after successful save
        localStorage.removeItem('billDraft');

        // Prepare next bill No
        const allBills = await billsApi.getAll();
        const billNos = allBills.map(b => parseInt(b.bill_no) || 0);
        const nextNoInt = billNos.length > 0 ? Math.max(...billNos) + 1 : 1;
        const nextNo = String(nextNoInt).padStart(3, '0');
        setBillInfo(prev => ({ ...prev, billNo: nextNo }));
        
        // Reset customer and items for new bill
        setCustomer({
          name: '', school: '', address1: '', address2: '', district: '', phone: '', mobile: ''
        });
        setItems([{ id: Date.now(), itemCode: '', hsnCode: '', itemName: '', rate: '', qty: '', teachersCopy: '0', amount: '' }]);
        
        // Save current settings as default for the next bills
        localStorage.setItem('defaultBillSettings', JSON.stringify({
          ...billSettings,
          cash: '' // reset cash as it's specific to each bill
        }));
        
        // Retain settings on UI but clear cash
        setBillSettings(prev => ({
          ...prev,
          cash: ''
        }));
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
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        document.getElementById('transport')?.focus();
        return;
      }
      if (field === 'itemName' && activeRowIndex === rowIndex) return; // handled above
      
      if (field === 'itemCode' && !items[rowIndex].itemCode && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('item-0-itemName')?.focus();
        return;
      }
      
      e.preventDefault();
      const fields = ['itemCode', 'itemName', 'rate', 'qty', 'teachersCopy', 'amount'];
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
       const fields = ['itemCode', 'itemName', 'rate', 'qty', 'teachersCopy', 'amount'];
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
    
    // Determine rate based on selected Price Type
    let rate = parseFloat(book.mrp) || parseFloat(book.price) || 0;
    const pt = billSettings.priceType;
    if (pt === 'agent' && (book.splPrice1 || book.agent_rate)) rate = parseFloat(book.splPrice1 || book.agent_rate);
    else if (pt === 'school' && (book.splPrice2 || book.school_rate)) rate = parseFloat(book.splPrice2 || book.school_rate);
    else if (pt === 'customer' && (book.splPrice3 || book.customer_rate)) rate = parseFloat(book.splPrice3 || book.customer_rate);
    // fallback to MRP if the selected spl price is 0 or empty, or if MRP is selected
    if (!rate && (parseFloat(book.mrp) || parseFloat(book.price))) rate = parseFloat(book.mrp) || parseFloat(book.price);

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

  const handleSettingChange = (field, value) => {
    const newSettings = { ...billSettings, [field]: value };
    
    // Auto calculate discount amount if percentage changes
    if (field === 'discountPercent') {
      const grossAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      const percent = parseFloat(value) || 0;
      if (percent > 0) {
        newSettings.discountAmount = ((grossAmount * percent) / 100).toFixed(2);
      } else {
        newSettings.discountAmount = '';
      }
    }
    // Auto calculate discount percent if amount changes manually? We'll leave it as is or recalculate
    
    setBillSettings(newSettings);
  };

  const grossAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0);
  
  const discountAmt = parseFloat(billSettings.discountAmount) || 0;
  const freightAmt = parseFloat(billSettings.freight) || 0;
  
  const netAmount = grossAmount - discountAmt + freightAmt;
  const balance = netAmount - (parseFloat(billSettings.cash) || 0);

  const totals = {
    qty: totalQty,
    amount: netAmount, // Keeping 'amount' for backwards compatibility, but it's netAmount now
    grossAmount: grossAmount,
    netAmount: netAmount,
    balance: balance
  };

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
    totals,
    billSettings
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
        else { setTimeout(() => { const el = document.getElementById('item-0-itemName'); if(el) el.focus(); }, 50); }
      } else {
        setActiveSearchField(null);
        if (type === 'mobile') document.getElementById('clientName').focus();
        else { setTimeout(() => { const el = document.getElementById('item-0-itemName'); if(el) el.focus(); }, 50); }
      }
    } else if (e.key === 'Escape') {
      setActiveSearchField(null);
    }
  };

  // Transport handlers
  const handleTransportChange = (e) => {
    const val = e.target.value;
    setBillInfo({ ...billInfo, transport: val });
    
    const filtered = transportsList.filter(t => {
      const tName = typeof t === 'string' ? t : t.name;
      return tName.toLowerCase().includes(val.toLowerCase());
    });
    setFilteredTransports(filtered);
    setShowTransportDropdown(true);
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
        document.getElementById('destination').focus();
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

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col gap-0 mb-4">
        
        {/* LEFT COLUMN - Customer Info */}
        <div className="p-4 bg-slate-50 dark:bg-[#1a1a2e]">
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
                              <div className="flex flex-col">
                                <span className="font-medium">{c.mobile} - {c.name}</span>
                                {c.address && <span className="text-xs text-slate-500 opacity-80 truncate">{c.address}{c.city ? `, ${c.city}` : ''}</span>}
                              </div>
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
                                setTimeout(() => { const el = document.getElementById('item-0-itemName'); if(el) el.focus(); }, 50);
                              }}
                              className={`px-3 py-2 cursor-pointer text-sm ${activeClientOptionIndex === i ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{c.name}</span>
                                {c.address && <span className="text-xs text-slate-500 opacity-80 truncate">{c.address}{c.city ? `, ${c.city}` : ''}</span>}
                              </div>
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
              {/* E-Bill Toggle */}
              <div className="col-span-2 mt-4 md:mt-0 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isEbill"
                  checked={billInfo.isEbill || false}
                  onChange={(e) => setBillInfo(prev => ({ ...prev, isEbill: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="isEbill" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  Enable E-Bill Details
                </label>
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

            <div className="mt-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Apply Price Type</label>
              <select 
                value={billSettings.priceType || 'mrp'}
                onChange={(e) => handleSettingChange('priceType', e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="mrp">MRP</option>
                <option value="agent">Agent Price</option>
                <option value="school">School Price</option>
                <option value="customer">Customer Price</option>
              </select>
            </div>
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
                <th className="p-2 w-28 text-xs font-semibold text-slate-600 dark:text-slate-400">Alias</th>
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
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-blue-500 font-semibold bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded">Stock: {book.currentStock || 0}</span>
                                      <span className="text-xs text-slate-400">₹{(parseFloat(book.mrp) || 0).toFixed(2)}</span>
                                    </div>
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
          </table>
        </div>
      </div>
      
      {/* BOTTOM PANEL (As per Image 2) */}
      <div className="mt-4 bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col md:flex-row p-3 gap-4">
        {/* Left Side: Bill Info & Summary */}
        <div className="md:w-[60%] flex flex-col gap-4">
          <div className="bg-slate-50 dark:bg-[#1a1a2e] p-3 rounded border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">BILL INFO</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Bill No</label>
                <input 
                  type="text" 
                  value={billInfo.billNo}
                  className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-xs font-bold cursor-not-allowed"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Date</label>
                <input 
                  type="text" 
                  value={billInfo.date}
                  onChange={(e) => setBillInfo({...billInfo, date: e.target.value})}
                  className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-xs"
                />
              </div>
              <div className="flex flex-col gap-1 relative">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Transport</label>
                <div onClick={(e) => e.stopPropagation()}>
                  <input 
                    id="transport"
                    type="text" 
                    autoComplete="off"
                    value={billInfo.transport}
                    onChange={handleTransportChange}
                    onKeyDown={handleTransportKeyDown}
                    onFocus={() => { setFilteredTransports(transportsList); setShowTransportDropdown(true); setActiveTransportIndex(0); }}
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-xs uppercase"
                  />
                  {showTransportDropdown && filteredTransports.length > 0 && (
                    <div className="absolute z-50 bottom-full left-0 w-full mb-1 bg-white dark:bg-[#1E1E2D] border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
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
                              className={`px-3 py-1 cursor-pointer text-xs ${activeTransportIndex === i ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{tName}</span>
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
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Destination</label>
                <input 
                  id="destination"
                  type="text" 
                  value={billInfo.destination}
                  onChange={(e) => setBillInfo({...billInfo, destination: e.target.value})}
                  onKeyDown={(e) => { if(e.key === 'Enter'){ e.preventDefault(); document.getElementById('bundles')?.focus(); }}}
                  className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-xs uppercase"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Bundles</label>
                <input 
                  id="bundles"
                  type="text" 
                  value={billInfo.bundles}
                  onChange={(e) => setBillInfo({...billInfo, bundles: e.target.value})}
                  onKeyDown={(e) => { if(e.key === 'Enter'){ e.preventDefault(); document.getElementById('discountPercent')?.focus(); }}}
                  className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">LR No</label>
                <input 
                  id="lrNo"
                  type="text" 
                  value={billInfo.lrNo}
                  onChange={(e) => setBillInfo({...billInfo, lrNo: e.target.value})}
                  className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-xs uppercase"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">LR Date</label>
                <input 
                  id="lrDate"
                  type="text" 
                  value={billInfo.lrDate}
                  onChange={(e) => setBillInfo({...billInfo, lrDate: e.target.value})}
                  className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-xs uppercase"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">E Way Bill No</label>
                <input 
                  id="eWayBillNo"
                  type="text" 
                  value={billInfo.eWayBillNo}
                  onChange={(e) => setBillInfo({...billInfo, eWayBillNo: e.target.value})}
                  className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-xs uppercase"
                />
              </div>
            </div>
          </div>

          {/* Left Side: Summary info */}
        <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <div>Items : <span className="text-red-500">{items.filter(i => i.itemName).length}</span></div>
          <div>Total Qty : <span className="text-red-500">{totals.qty}</span></div>
          <div>Taxable Value : <span className="text-red-500">{totals.grossAmount.toFixed(2)}</span></div>
          <div>GST : <span className="text-red-500">00.00</span></div>
        </div>

        
        </div>
        {/* Right Side: Totals and Discounts */}
        <div className="md:w-[40%] bg-slate-100 dark:bg-[#1a1a2e] p-2 rounded border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-2">
            
            {/* Column 1: Gross, Bill Discount, Freight */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Gross Amount</label>
                <input type="text" value={totals.grossAmount.toFixed(2)} readOnly className="w-28 px-2 py-1 text-right border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-xs font-bold" />
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Bill Discount</label>
                <div className="flex gap-1 w-28">
                  <input 
                    id="discountPercent"
                    type="number" 
                    value={billSettings.discountPercent} 
                    onChange={(e) => handleSettingChange('discountPercent', e.target.value)} 
                    onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); document.getElementById('freight').focus(); }}}
                    className="w-10 px-1 py-1 text-center border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-xs font-bold" 
                  />
                  <input 
                    type="number" 
                    value={billSettings.discountAmount} 
                    onChange={(e) => handleSettingChange('discountAmount', e.target.value)} 
                    className="w-16 px-1 py-1 text-right border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-xs font-bold" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Freight</label>
                <input 
                  id="freight"
                  type="number" 
                  value={billSettings.freight} 
                  onChange={(e) => handleSettingChange('freight', e.target.value)} 
                  onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); document.getElementById('cash').focus(); }}}
                  className="w-28 px-2 py-1 text-right border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-xs font-bold" 
                />
              </div>
            </div>

            {/* Column 2: Net Amount, Cash, Balance, Checkboxes */}
            <div className="flex flex-col gap-1">
              <div className="bg-blue-600 text-white p-2 rounded flex justify-between items-center h-[52px]">
                <span className="font-bold text-sm">Net Amount</span>
                <span className="font-bold text-xl">{totals.netAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Cash</label>
                <input 
                  id="cash"
                  type="number" 
                  value={billSettings.cash} 
                  onChange={(e) => handleSettingChange('cash', e.target.value)} 
                  className="w-28 px-2 py-1 text-right border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-xs font-bold" 
                />
              </div>

              <div className="flex items-center justify-between mt-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Balance</label>
                <input type="text" value={totals.balance.toFixed(2)} readOnly className="w-28 px-2 py-1 text-right border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-xs font-bold" />
              </div>

              <div className="flex items-center gap-2 mt-2 pl-1">
                <input type="checkbox" id="inclTax" checked={billSettings.inclTax} onChange={(e) => handleSettingChange('inclTax', e.target.checked)} className="cursor-pointer" />
                <label htmlFor="inclTax" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">Incl Tax</label>
              </div>

              <div className="flex items-center gap-2 mt-1 pl-1">
                <input type="checkbox" id="sendWhatsapp" checked={billSettings.sendWhatsapp} onChange={(e) => handleSettingChange('sendWhatsapp', e.target.checked)} className="cursor-pointer" />
                <label htmlFor="sendWhatsapp" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">Send Whatsapp</label>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Hidden Print Component */}
      <div className="hidden">
        <PrintInvoice ref={printRef} billData={printData} />
      </div>

    </div>
  );
}
