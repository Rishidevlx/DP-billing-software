import React, { useState, useEffect } from 'react';
import { Search, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function AllReturns() {
  const [returns, setReturns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  const handleRowAction = (returnNote) => {
    navigate(`/returns/edit/${returnNote.id}`);
  };

  useEffect(() => {
    const savedReturns = localStorage.getItem('returns');
    if (savedReturns) {
      setReturns(JSON.parse(savedReturns).reverse()); // newest first
    }
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! Stock will NOT be reversed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedReturns = returns.filter(b => b.id !== id);
        setReturns(updatedReturns);
        
        const rawSaved = JSON.parse(localStorage.getItem('returns') || '[]');
        const newRaw = rawSaved.filter(b => b.id !== id);
        localStorage.setItem('returns', JSON.stringify(newRaw));
        
        Swal.fire('Deleted!', 'Credit Note has been deleted.', 'success');
      }
    });
  };

  const filteredReturns = returns.filter(b => {
    const term = searchTerm.toLowerCase();
    return (
      b.returnInfo?.returnNo?.toLowerCase().includes(term) ||
      b.customer?.name?.toLowerCase().includes(term) ||
      b.customer?.mobile?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">All Credit Notes (Returns)</h1>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1a1a2e]">
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search by Note No, Name, Mobile..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white transition-colors"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Return No</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Date</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Customer Name</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Mobile</th>
                <th className="p-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Return Qty</th>
                <th className="p-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Amount</th>
                <th className="p-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.length > 0 ? (
                filteredReturns.map((note) => (
                  <tr 
                    key={note.id} 
                    onDoubleClick={() => handleRowAction(note)}
                    onKeyDown={(e) => { if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); handleRowAction(note); } }}
                    tabIndex={0}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer focus:bg-blue-50 dark:focus:bg-slate-800/50 outline-none"
                  >
                    <td className="p-3 text-sm font-medium text-slate-900 dark:text-white">{note.returnInfo?.returnNo}</td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{note.returnInfo?.date}</td>
                    <td className="p-3 text-sm font-medium text-blue-600 dark:text-blue-400">{note.customer?.name || '-'}</td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{note.customer?.mobile || '-'}</td>
                    <td className="p-3 text-sm font-bold text-slate-600 text-right">{note.totals?.qty || 0}</td>
                    <td className="p-3 text-sm font-bold text-slate-800 dark:text-white text-right">₹{parseFloat(note.totals?.amount || 0).toFixed(2)}</td>
                    <td className="p-3 text-center flex justify-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 p-1.5 rounded transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 italic">No credit notes found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
