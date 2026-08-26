import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { getRecycleBinItems, removeFromRecycleBin, clearRecycleBin } from '../../utils/recycleBin';
import { API_URL } from '../../services/api';
export default function RecycleBin() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');


  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await getRecycleBinItems();
    setItems(data.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt)));
  };

  const handleRestore = (item) => {
    Swal.fire({
      title: 'Restore Item?',
      text: "This will put the item back into active records and apply any stock adjustments.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Restore'
    }).then(async (result) => {
      if (result.isConfirmed) {
        
        if (item.recycleType === 'BILL') {
          try {
            await fetch(`${API_URL}/bills`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            });
            // We'll let backend handle stock adjustments theoretically, but for now we'll just restore the bill
          } catch(e) { console.error(e); }
        } 
        else if (item.recycleType === 'RETURN_BILL') {
          try {
            await fetch(`${API_URL}/returns`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            });
          } catch(e) { console.error(e); }
        }
        else if (item.recycleType === 'RECEIPT') {
          try {
            await fetch(`${API_URL}/receipts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            });
          } catch(e) { console.error(e); }
        }

        await removeFromRecycleBin(item.id);
        await loadItems();
        Swal.fire('Restored!', 'Item has been successfully restored.', 'success');
      }
    });
  };

  const handlePermanentDelete = (item) => {
    Swal.fire({
      title: 'Permanently Delete?',
      text: "You won't be able to recover this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it forever'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await removeFromRecycleBin(item.id);
        await loadItems();
        Swal.fire('Deleted!', 'Item has been permanently deleted.', 'success');
      }
    });
  };

  const handleClearAll = () => {
    Swal.fire({
      title: 'Empty Recycle Bin?',
      text: "All items in the recycle bin will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, empty it'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await clearRecycleBin();
        await loadItems();
        Swal.fire('Emptied!', 'Recycle Bin is now empty.', 'success');
      }
    });
  };

  const getDisplayName = (item) => {
    if (item.recycleType === 'RECEIPT') {
      return `Receipt No: ${item.receiptNo || '-'} for ${item.customerName || 'Unknown'}`;
    } else {
      return `Bill No: ${item.billInfo?.billNo || '-'} for ${item.customer?.name || 'Unknown'}`;
    }
  };

  
  const filteredItems = items.filter(item => {
    const matchesFilter = filterType === 'ALL' || item.recycleType === filterType;
    const nameMatch = getDisplayName(item).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && nameMatch;
  });

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Trash2 className="text-red-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Recycle Bin</h1>
            <p className="text-slate-500 text-sm">Manage deleted bills, returns, and receipts.</p>
          </div>
        </div>
        <button 
          onClick={handleClearAll}
          disabled={items.length === 0}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-md font-semibold transition-colors shadow-sm flex items-center gap-2"
        >
          <AlertTriangle size={18} /> Empty Recycle Bin
        </button>
      </div>

      
      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col mb-6">
        <div className="p-4 flex flex-col md:flex-row justify-between items-center bg-slate-50 dark:bg-[#1a1a2e] gap-4">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Search deleted items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white transition-colors"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm outline-none bg-white dark:bg-[#1E1E2D]"
          >
            <option value="ALL">All Types</option>
            <option value="BILL">Sales Bills</option>
            <option value="RETURN_BILL">Return Bills</option>
            <option value="RECEIPT">Receipts</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <Trash2 size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Recycle Bin is empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <th className="p-4 border-b border-slate-200 dark:border-slate-700">Type</th>
                  <th className="p-4 border-b border-slate-200 dark:border-slate-700">Details</th>
                  <th className="p-4 border-b border-slate-200 dark:border-slate-700">Deleted At</th>
                  <th className="p-4 border-b border-slate-200 dark:border-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={index} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1a1a2e] transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {item.recycleType === 'BILL' && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md">Sales Bill</span>}
                      {item.recycleType === 'RETURN_BILL' && <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md">Return Bill</span>}
                      {item.recycleType === 'RECEIPT' && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md">Receipt</span>}
                    </td>
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                      {getDisplayName(item)}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {new Date(item.deletedAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleRestore(item)}
                        className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
                        title="Restore"
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button 
                        onClick={() => handlePermanentDelete(item)}
                        className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
                        title="Permanently Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
