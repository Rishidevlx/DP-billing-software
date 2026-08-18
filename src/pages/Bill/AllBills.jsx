import React, { useState, useEffect, useRef } from 'react';
import { Eye, Printer, Trash2, Search, Edit, Download, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import PrintInvoice from './PrintInvoice';

export default function AllBills() {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedBill, setSelectedBill] = useState(null);
  const navigate = useNavigate();

  const handleRowAction = (bill) => {
    navigate(`/bill/edit/${bill.id}`);
  };

  useEffect(() => {
    const savedBills = localStorage.getItem('bills');
    if (savedBills) {
      setBills(JSON.parse(savedBills).reverse()); // newest first
    }
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedBills = bills.filter(b => b.id !== id);
        setBills(updatedBills);
        localStorage.setItem('bills', JSON.stringify(updatedBills.slice().reverse())); // save back in chronological order if needed, but easier to just save what's there? Wait, the state is reversed. Let's just filter localStorage.
        
        const rawSaved = JSON.parse(localStorage.getItem('bills') || '[]');
        const newRaw = rawSaved.filter(b => b.id !== id);
        localStorage.setItem('bills', JSON.stringify(newRaw));
        
        Swal.fire('Deleted!', 'Bill has been deleted.', 'success');
      }
    });
  };

  const filteredBills = bills.filter(b => {
    const term = searchTerm.toLowerCase();
    return (
      b.billInfo?.billNo?.toLowerCase().includes(term) ||
      b.customer?.name?.toLowerCase().includes(term) ||
      b.customer?.mobile?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">All Bills</h1>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1a1a2e]">
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search by Bill No, Name, Mobile..." 
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
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Bill No</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Date</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Customer Name</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Mobile</th>
                <th className="p-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Total Items</th>
                <th className="p-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Amount</th>
                <th className="p-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr 
                    key={bill.id} 
                    onDoubleClick={() => handleRowAction(bill)}
                    onKeyDown={(e) => { if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); handleRowAction(bill); } }}
                    tabIndex={0}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer focus:bg-blue-50 dark:focus:bg-slate-800/50 outline-none"
                  >
                    <td className="p-3 text-sm font-medium text-slate-900 dark:text-white">{bill.billInfo?.billNo}</td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{bill.billInfo?.date}</td>
                    <td className="p-3 text-sm font-medium text-blue-600 dark:text-blue-400">{bill.customer?.name || '-'}</td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{bill.customer?.mobile || '-'}</td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-400 text-right">{bill.items?.length || 0}</td>
                    <td className="p-3 text-sm font-bold text-slate-800 dark:text-white text-right">₹{parseFloat(bill.totals?.amount || 0).toFixed(2)}</td>
                    <td className="p-3 text-center flex justify-center gap-2">
                      <button 
                        onClick={() => handleDelete(bill.id)}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 p-1.5 rounded transition-colors"
                        title="Delete Bill"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 italic">No bills found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
