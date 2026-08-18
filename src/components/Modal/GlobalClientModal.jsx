import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Pencil, Search } from 'lucide-react';
import Swal from 'sweetalert2';

export default function GlobalClientModal({ isOpen, onClose }) {
  const initialData = {
    ledgerName: '',
    printName: '',
    group: 'Customer',
    partyType: 'School',
    billByBill: 'Yes',
    splPriceGroup: '',
    address: '',
    city: '',
    district: '',
    contactPerson: '',
    mobileNo: '',
    emailId: '',
    pinCode: '',
    phoneNo: '',
    gstNo: '',
    regnType: 'Unregistered',
    badDebtor: false
  };

  const [formData, setFormData] = useState(initialData);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load clients
  const loadClients = () => {
    const saved = localStorage.getItem('clients');
    if (saved) {
      setClients(JSON.parse(saved));
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadClients();
      handleClear();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (isOpen && e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        document.getElementById('modalClientSubmitBtn')?.click();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleClear = () => {
    setFormData(initialData);
    setIsEditMode(false);
    setEditId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
      const form = e.target.form;
      if (form) {
        const elements = Array.from(form.elements).filter(el => !el.disabled && el.tabIndex !== -1 && el.type !== 'hidden');
        const index = elements.indexOf(e.target);
        if (index > -1 && index < elements.length - 1) {
          elements[index + 1].focus();
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedClients = [...clients];
    
    if (isEditMode) {
      const index = updatedClients.findIndex(c => c.id === editId);
      if (index !== -1) {
        updatedClients[index] = { ...formData, id: editId };
      }
      Swal.fire({ title: 'Updated!', text: 'Client updated successfully.', icon: 'success', timer: 1500, showConfirmButton: false });
    } else {
      updatedClients.push({ ...formData, id: Date.now() });
      Swal.fire({ title: 'Created!', text: 'Client added successfully.', icon: 'success', timer: 1500, showConfirmButton: false });
    }
    
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    setClients(updatedClients);
    handleClear();
  };

  const handleEditClick = (client) => {
    setFormData(client);
    setIsEditMode(true);
    setEditId(client.id);
  };

  if (!isOpen) return null;

  const filteredClients = clients.filter(c => 
    c.ledgerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.mobileNo?.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#151521] w-[95vw] h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e]">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase">Client Manager (Ctrl + N)</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-red-500 transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        {/* Content Split */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: Form */}
          <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              {isEditMode ? 'Edit Client' : 'Add New Client'}
            </h3>
            
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {/* Basic Details */}
                <div className="col-span-2 border-b border-slate-100 dark:border-slate-800 pb-1 mt-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Basic Details</h4>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Ledger Name *</label>
                  <input type="text" name="ledgerName" value={formData.ledgerName} onChange={handleChange} required className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Print Name</label>
                  <input type="text" name="printName" value={formData.printName} onChange={handleChange} className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Group</label>
                  <select name="group" value={formData.group} onChange={handleChange} className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm"><option value="Customer">Customer</option></select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Party Type</label>
                  <select name="partyType" value={formData.partyType} onChange={handleChange} className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm"><option value="School">School</option><option value="Shop">Shop</option><option value="Agent">Agent</option></select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Bill by Bill</label>
                  <select name="billByBill" value={formData.billByBill} onChange={handleChange} className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm"><option value="Yes">Yes</option><option value="No">No</option></select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Spl. Price / Disc Group</label>
                  <input type="text" name="splPriceGroup" value={formData.splPriceGroup} onChange={handleChange} className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm" />
                </div>

                {/* Mailing Details */}
                <div className="col-span-2 border-b border-slate-100 dark:border-slate-800 pb-1 mt-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Mailing Details</h4>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm resize-none"></textarea>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">District</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange} className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Pin Code</label>
                  <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Contact Person</label>
                  <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Mobile No *</label>
                  <input type="text" name="mobileNo" value={formData.mobileNo} onChange={handleChange} required className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone No</label>
                  <input type="text" name="phoneNo" value={formData.phoneNo} onChange={handleChange} className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">E-Mail ID</label>
                  <input type="email" name="emailId" value={formData.emailId} onChange={handleChange} className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm" />
                </div>
                
                {/* Tax Details */}
                <div className="col-span-2 border-b border-slate-100 dark:border-slate-800 pb-1 mt-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Tax Details</h4>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Regn. Type</label>
                  <select name="regnType" value={formData.regnType} onChange={handleChange} className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm"><option value="Regular">Regular</option><option value="Composition">Composition</option><option value="Unregistered">Unregistered</option></select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">GST No</label>
                  <input type="text" name="gstNo" value={formData.gstNo} onChange={handleChange} className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm" />
                </div>
                <div className="flex flex-col gap-1 col-span-2 flex-row items-center mt-2 mb-4">
                  <input type="checkbox" id="badDebtor" name="badDebtor" checked={formData.badDebtor} onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="badDebtor" className="text-xs font-medium text-red-600 dark:text-red-400 cursor-pointer ml-2">Mark as Bad Debtor</label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={handleClear} className="flex items-center gap-2 px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium rounded transition-colors border-none cursor-pointer">
                  <RefreshCw size={16} /> Clear
                </button>
                <button type="submit" id="modalClientSubmitBtn" className="flex items-center gap-2 px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors border-none cursor-pointer">
                  <Save size={16} /> {isEditMode ? 'Update (Ctrl+S)' : 'Save (Ctrl+S)'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Right: List */}
          <div className="w-1/2 flex flex-col bg-slate-50 dark:bg-[#1a1a2e]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search clients..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#151521] border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-2">
                {filteredClients.map(client => (
                  <div key={client.id} className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex justify-between items-center shadow-sm hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{client.ledgerName}</h4>
                      <p className="text-xs text-slate-500 mt-1">{client.mobileNo} • {client.city || 'No City'}</p>
                    </div>
                    <button 
                      onClick={() => handleEditClick(client)}
                      className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded transition-colors cursor-pointer border-none bg-transparent"
                      title="Edit in modal"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                ))}
                {filteredClients.length === 0 && (
                  <div className="text-center p-8 text-slate-500 italic">
                    No clients found.
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
