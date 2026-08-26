import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Truck, Building2, PenTool, Upload, LayoutTemplate } from 'lucide-react';
import Swal from 'sweetalert2';
import { transportsApi, banksApi, settingsApi } from '../../services/api';

export default function BusinessSettings() {
  const [transports, setTransports] = useState([]);
  const [banks, setBanks] = useState([]);
  
  const [newTransport, setNewTransport] = useState({ name: '', destination: '' });
  const [newBank, setNewBank] = useState({ name: '' });
  const [digitalSignature, setDigitalSignature] = useState(null);
  const [invoiceTemplate, setInvoiceTemplate] = useState('classic');

  const fetchSettingsData = async () => {
    try {
      const [tData, bData, sData] = await Promise.all([
        transportsApi.getAll(),
        banksApi.getAll(),
        settingsApi.getAll()
      ]);
      setTransports(tData);
      setBanks(bData);
      
      const sigSet = sData.find(s => s.setting_key === 'digitalSignature');
      if (sigSet) setDigitalSignature(sigSet.setting_value);
      
      const tplSet = sData.find(s => s.setting_key === 'invoiceTemplate');
      if (tplSet) setInvoiceTemplate(tplSet.setting_value);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const handleAddTransport = async (e) => {
    e.preventDefault();
    if (!newTransport.name.trim()) return;

    try {
      await transportsApi.create({
        name: newTransport.name.trim(),
        destination: newTransport.destination.trim()
      });
      setNewTransport({ name: '', destination: '' });
      fetchSettingsData();
      Swal.fire({ title: 'Success', text: 'Transport added successfully!', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Error', err.message || 'Transport name already exists!', 'error');
    }
  };

  const handleDeleteTransport = (name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete transport ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await transportsApi.delete(name);
          fetchSettingsData();
          Swal.fire('Deleted!', 'Transport deleted.', 'success');
        } catch (err) {
          Swal.fire('Error', 'Failed to delete transport.', 'error');
        }
      }
    });
  };

  const handleAddBank = async (e) => {
    e.preventDefault();
    if (!newBank.name.trim()) return;

    try {
      await banksApi.create({ name: newBank.name.trim() });
      setNewBank({ name: '' });
      fetchSettingsData();
      Swal.fire({ title: 'Success', text: 'Bank added successfully!', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Error', err.message || 'Bank name already exists!', 'error');
    }
  };

  const handleDeleteBank = (name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete bank ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await banksApi.delete(name);
          fetchSettingsData();
          Swal.fire('Deleted!', 'Bank deleted.', 'success');
        } catch (err) {
          Swal.fire('Error', 'Failed to delete bank.', 'error');
        }
      }
    });
  };

  
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        try {
          await settingsApi.save('digitalSignature', base64String);
          setDigitalSignature(base64String);
          Swal.fire({ title: 'Success', text: 'Signature updated successfully!', icon: 'success', timer: 1500, showConfirmButton: false });
        } catch (err) {
          Swal.fire('Error', 'Failed to save signature', 'error');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  
  const handleTemplateSelect = async (templateId) => {
    try {
      await settingsApi.save('invoiceTemplate', templateId);
      setInvoiceTemplate(templateId);
      Swal.fire({ title: 'Success', text: 'Invoice template updated successfully!', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Error', 'Failed to update template', 'error');
    }
  };

  const handleRemoveSignature = async () => {
    try {
      await settingsApi.delete('digitalSignature');
      setDigitalSignature(null);
      Swal.fire({ title: 'Removed', text: 'Signature removed.', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Error', 'Failed to remove signature', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Business Settings</h1>
        <p className="text-slate-500 text-sm">Manage Master Data like Transports and Bank Details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TRANSPORT SECTION */}
        <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1a1a2e]">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Truck className="text-blue-500" size={20} />
              Manage Transports
            </h2>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-[#1E1E2D] border-b border-slate-200 dark:border-slate-800">
            <form onSubmit={handleAddTransport} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Transport Name *</label>
                <input type="text" value={newTransport.name} onChange={(e) => setNewTransport({...newTransport, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="e.g. VRL Logistics" required />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Destination (Optional)</label>
                <input type="text" value={newTransport.destination} onChange={(e) => setNewTransport({...newTransport, destination: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Chennai" />
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 font-medium transition-colors">
                <Plus size={18} /> Add
              </button>
            </form>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0">
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm">Transport Name</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm">Destination</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transports.length > 0 ? transports.map((t, i) => {
                  const name = typeof t === 'string' ? t : t.name;
                  const dest = typeof t === 'string' ? '-' : (t.destination || '-');
                  return (
                    <tr key={i} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1a1a2e]">
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200 text-sm">{name}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 text-sm">{dest}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleDeleteTransport(name)} className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                }) : <tr><td colSpan="3" className="p-4 text-center text-slate-500 text-sm">No Transports found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* BANK SECTION */}
        <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1a1a2e]">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Building2 className="text-green-500" size={20} />
              Manage Banks
            </h2>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-[#1E1E2D] border-b border-slate-200 dark:border-slate-800">
            <form onSubmit={handleAddBank} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Bank Name *</label>
                <input type="text" value={newBank.name} onChange={(e) => setNewBank({...newBank, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="e.g. State Bank of India" required />
              </div>
              <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-2 font-medium transition-colors">
                <Plus size={18} /> Add
              </button>
            </form>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0">
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm">Bank Name</th>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banks.length > 0 ? banks.map((b, i) => {
                  const name = typeof b === 'string' ? b : b.name;
                  return (
                    <tr key={i} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1a1a2e]">
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200 text-sm">{name}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleDeleteBank(name)} className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                }) : <tr><td colSpan="2" className="p-4 text-center text-slate-500 text-sm">No Banks found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      
        
        {/* TEMPLATE SECTION */}
        <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col lg:col-span-2">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1a1a2e]">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <LayoutTemplate className="text-orange-500" size={20} />
              Manage Invoice Template
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { id: 'classic', name: 'Classic', desc: 'The perfectly tuned traditional format with tear-off slip.' },
                { id: 'modern', name: 'Modern Professional', desc: 'Clean, contemporary, sans-serif design.' },
                { id: 'elegant', name: 'Elegant Serif', desc: 'Traditional print aesthetics with elegant borders.' },
                { id: 'minimalist', name: 'Minimalist Edge', desc: 'Maximum whitespace, borderless table format.' },
                { id: 'vibrant', name: 'Vibrant Coral', desc: 'Colorful, attractive modern design with vibrant headers.' }
              ].map(tpl => (
                <div 
                  key={tpl.id}
                  onClick={() => handleTemplateSelect(tpl.id)}
                  className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col gap-2 transition-all ${invoiceTemplate === tpl.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
                >
                  <div className={`w-full h-32 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 overflow-hidden ${invoiceTemplate === tpl.id ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#151521]' : ''}`}>
                    <LayoutTemplate size={48} className={invoiceTemplate === tpl.id ? 'text-blue-500' : 'text-slate-400'} />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-center">{tpl.name}</h3>
                  <p className="text-xs text-slate-500 text-center">{tpl.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIGNATURE SECTION */}
        <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col lg:col-span-2">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1a1a2e]">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <PenTool className="text-purple-500" size={20} />
              Manage Digital Signature
            </h2>
          </div>
          <div className="p-6 flex flex-col items-center justify-center gap-4">
            {digitalSignature ? (
              <div className="flex flex-col items-center gap-4">
                <div className="border border-slate-200 dark:border-slate-700 p-4 rounded bg-slate-50 dark:bg-[#1a1a2e]">
                  <img src={digitalSignature} alt="Digital Signature" className="max-h-[100px] object-contain" />
                </div>
                <button onClick={handleRemoveSignature} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                  <Trash2 size={16} /> Remove Signature
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <label className="cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 px-6 py-4 rounded-lg border border-blue-200 dark:border-blue-800 border-dashed flex flex-col items-center gap-2 transition-colors">
                  <Upload size={24} />
                  <span className="font-medium">Click to upload signature (PNG/JPG)</span>
                  <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                </label>
                <p className="text-xs text-slate-500">This will be displayed above 'Authorized Signatory' on the invoice.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
