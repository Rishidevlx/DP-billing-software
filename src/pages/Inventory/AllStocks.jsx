import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Trash2, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { stocksApi, booksApi } from '../../services/api';

export default function AllStocks() {
  const [stockEntries, setStockEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const [entriesData, booksData] = await Promise.all([
        stocksApi.getAll(),
        booksApi.getAll()
      ]);
      
      const mapped = entriesData.map(e => {
         const book = booksData.find(b => b.id === e.book_id);
         return {
           id: e.id.toString(),
           date: e.date,
           items: [{
             itemName: book ? book.book_name : 'Unknown',
             quantity: e.qty
           }]
         };
      });
      mapped.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      setStockEntries(mapped);
    } catch(err) {
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! The stock quantities of the books in this entry will be reversed in your inventory.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          alert('Delete API for stocks not implemented yet.');
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  const filteredEntries = stockEntries.filter(entry => {
    const entryId = entry.id.toLowerCase();
    const date = entry.date || '';
    const itemNames = entry.items?.map(i => i.itemName.toLowerCase()).join(' ') || '';
    const searchLower = searchTerm.toLowerCase();
    
    return entryId.includes(searchLower) || date.includes(searchLower) || itemNames.includes(searchLower);
  });

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">All Stock Entries</h1>
            <p className="text-slate-500 text-sm">Manage and view your past stock inwards</p>
          </div>
        </div>
        
        <Link 
          to="/stocks/entry"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Stock Entry
        </Link>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a2e]/50 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, Date, or Book Name..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 text-center">S.No</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Date</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">Entry ID</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Books Included</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32 text-center">Total Qty</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry, index) => {
                  const dateStr = entry.date ? entry.date.split('-').reverse().join('/') : '';
                  const shortId = entry.id ? entry.id.substring(0, 8).toUpperCase() : '';
                  
                  // Extract book names
                  const bookNames = entry.items?.map(i => i.itemName).filter(Boolean);
                  let displayBooks = '';
                  if (bookNames?.length > 0) {
                    displayBooks = bookNames.slice(0, 2).join(', ');
                    if (bookNames.length > 2) {
                      displayBooks += ` + ${bookNames.length - 2} more`;
                    }
                  } else {
                    displayBooks = 'No items';
                  }

                  const totalQty = entry.items?.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0), 0) || 0;

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-[#1a1a2e]/30 transition-colors">
                      <td className="p-4 text-center text-sm text-slate-500">{index + 1}</td>
                      <td className="p-4 text-sm font-medium text-slate-900 dark:text-slate-200">{dateStr}</td>
                      <td className="p-4 text-sm text-slate-500 font-mono">{shortId}</td>
                      <td className="p-4 text-sm text-slate-700 dark:text-slate-300 font-medium uppercase">{displayBooks}</td>
                      <td className="p-4 text-center text-sm font-bold text-indigo-600 dark:text-indigo-400">{totalQty}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => navigate(`/stocks/edit/${entry.id}`)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Package size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No stock entries found</p>
                      <p className="text-sm mt-1">Try adjusting your search or create a new entry.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e] text-xs text-slate-500 flex justify-between">
          <span>Showing {filteredEntries.length} entries</span>
          <span>Total Quantities Added: {filteredEntries.reduce((sum, e) => sum + (e.items?.reduce((s, i) => s + (parseFloat(i.quantity) || 0), 0) || 0), 0)}</span>
        </div>
      </div>
    </div>
  );
}
