import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Truck } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Transports() {
  const [transports, setTransports] = useState([]);
  const [newTransport, setNewTransport] = useState({ name: '', destination: '' });

  useEffect(() => {
    const savedTransports = JSON.parse(localStorage.getItem('transports') || '[]');
    setTransports(savedTransports);
  }, []);

  const handleAddTransport = (e) => {
    e.preventDefault();
    if (!newTransport.name.trim()) return;

    const exists = transports.some(t => {
      const tName = typeof t === 'string' ? t : t.name;
      return tName.toLowerCase() === newTransport.name.trim().toLowerCase();
    });

    if (exists) {
      Swal.fire('Error', 'Transport name already exists!', 'error');
      return;
    }

    const updated = [...transports, { name: newTransport.name.trim(), destination: newTransport.destination.trim() }];
    setTransports(updated);
    localStorage.setItem('transports', JSON.stringify(updated));
    setNewTransport({ name: '', destination: '' });
    
    Swal.fire({
      title: 'Success',
      text: 'Transport added successfully!',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleDelete = (name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = transports.filter(t => {
          const tName = typeof t === 'string' ? t : t.name;
          return tName !== name;
        });
        setTransports(updated);
        localStorage.setItem('transports', JSON.stringify(updated));
        Swal.fire('Deleted!', 'Transport has been deleted.', 'success');
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="mb-6 flex items-center gap-3">
        <Truck className="text-blue-500 w-8 h-8" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Transports</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Add or remove transport companies used for billing.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm mb-8">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e] rounded-t-lg">
          <h2 className="text-base font-semibold text-primary-dark dark:text-slate-200 uppercase tracking-wide">ADD NEW TRANSPORT</h2>
        </div>
        
        <form onSubmit={handleAddTransport} className="p-6 flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Transport Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={newTransport.name}
              onChange={(e) => setNewTransport(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. SRS Travels"
              required
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Destination</label>
            <input 
              type="text" 
              value={newTransport.destination}
              onChange={(e) => setNewTransport(prev => ({ ...prev, destination: e.target.value }))}
              placeholder="e.g. Chennai"
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button 
            type="submit" 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors h-[42px] w-full sm:w-auto"
          >
            <Plus size={18} /> Add
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e] rounded-t-lg">
          <h2 className="text-base font-semibold text-primary-dark dark:text-slate-200 uppercase tracking-wide">SAVED TRANSPORTS ({transports.length})</h2>
        </div>
        
        {transports.length > 0 ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {transports.map((t, idx) => {
              const name = typeof t === 'string' ? t : t.name;
              const destination = typeof t === 'string' ? '' : t.destination;
              return (
                <li key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#1E1E2D] transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{name}</span>
                    {destination && <span className="text-sm text-slate-500 dark:text-slate-400">{destination}</span>}
                  </div>
                  <button 
                    onClick={() => handleDelete(name)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">
            No transports added yet.
          </div>
        )}
      </div>
    </div>
  );
}
