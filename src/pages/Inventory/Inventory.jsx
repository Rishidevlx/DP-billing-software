import React, { useState, useEffect } from 'react';
import { Package, Search, Save, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Inventory() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadedBooks = JSON.parse(localStorage.getItem('books') || '[]');
    // Ensure all books have stock fields initialized
    const initializedBooks = loadedBooks.map(b => ({
      ...b,
      currentStock: b.currentStock || 0,
      minStockAlert: b.minStockAlert || 0
    }));
    setBooks(initializedBooks);
  }, []);

  const handleStockChange = (id, field, value) => {
    setBooks(prev => prev.map(book => {
      if (book.id === id) {
        return { ...book, [field]: value };
      }
      return book;
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('books', JSON.stringify(books));
    setHasChanges(false);
    Swal.fire({
      title: 'Saved!',
      text: 'Inventory stocks have been updated.',
      icon: 'success',
      confirmButtonColor: '#2563eb',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const filteredBooks = books.filter(b => 
    (b.itemName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.itemCode || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Package className="text-blue-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Inventory Management</h1>
            <p className="text-slate-500 text-sm">Manage stock levels and alerts for all items.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by code or name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 text-sm"
            />
          </div>
          <button 
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-6 py-2 rounded font-medium transition-colors border-none cursor-pointer ${hasChanges ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400 w-16">S.No</th>
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400 w-32">Item Code</th>
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Item Name</th>
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400 w-40 text-center">Current Stock</th>
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400 w-40 text-center">Min Alert Level</th>
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400 w-32 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book, index) => {
                  const stock = parseFloat(book.currentStock || 0);
                  const alertLevel = parseFloat(book.minStockAlert || 0);
                  const isLowStock = stock <= alertLevel;

                  return (
                    <tr key={book.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1E1E2D]/50 transition-colors">
                      <td className="p-3 text-sm text-slate-500">{index + 1}</td>
                      <td className="p-3 text-sm font-medium text-slate-900 dark:text-white uppercase">{book.itemCode}</td>
                      <td className="p-3 text-sm text-slate-700 dark:text-slate-300 uppercase">{book.itemName}</td>
                      
                      <td className="p-3 text-center">
                        <input 
                          type="number"
                          value={book.currentStock}
                          onChange={(e) => handleStockChange(book.id, 'currentStock', e.target.value)}
                          className={`w-24 px-2 py-1 text-center text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#1a1a2e] ${isLowStock ? 'border-red-400 text-red-600 font-bold' : 'border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100'}`}
                        />
                      </td>

                      <td className="p-3 text-center">
                        <input 
                          type="number"
                          value={book.minStockAlert}
                          onChange={(e) => handleStockChange(book.id, 'minStockAlert', e.target.value)}
                          className="w-24 px-2 py-1 text-center text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#1a1a2e] text-slate-900 dark:text-slate-100"
                        />
                      </td>

                      <td className="p-3 text-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            <AlertTriangle size={12} /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No items found matching the search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
