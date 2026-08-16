import React, { useState } from 'react';
import { Pencil, Trash2, Search, Filter, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 8 Dummy Books Data
const dummyBooks = [
  { id: 1, code: 'BK001', name: '10 ENGLISH MAIN BOOK', group: 'BOOK', category: 'ACADEMIC', price: '288.00', stock: 150 },
  { id: 2, code: 'BK002', name: '10 MATHS GUIDE', group: 'GUIDE', category: 'ACADEMIC', price: '150.00', stock: 45 },
  { id: 3, code: 'BK003', name: 'HARRY POTTER PART 1', group: 'BOOK', category: 'FICTION', price: '450.00', stock: 12 },
  { id: 4, code: 'BK004', name: 'A4 RULED NOTEBOOK', group: 'NOTEBOOK', category: 'STATIONERY', price: '60.00', stock: 500 },
  { id: 5, code: 'BK005', name: 'PHYSICS TEXTBOOK 12', group: 'BOOK', category: 'ACADEMIC', price: '320.00', stock: 80 },
  { id: 6, code: 'BK006', name: 'LORD OF THE RINGS', group: 'BOOK', category: 'FICTION', price: '550.00', stock: 5 },
  { id: 7, code: 'BK007', name: 'BLUE INK PEN BOX', group: 'STATIONERY', category: 'STATIONERY', price: '120.00', stock: 200 },
  { id: 8, code: 'BK008', name: 'CHEMISTRY GUIDE 11', group: 'GUIDE', category: 'ACADEMIC', price: '180.00', stock: 0 },
];

export default function BooksDetails() {
  const navigate = useNavigate();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  // Filtered Data State
  const [filteredBooks, setFilteredBooks] = useState(dummyBooks);

  const handleEdit = (id) => {
    navigate(`/books/edit/${id}`);
  };

  const handleApplyFilters = () => {
    let result = dummyBooks;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(book => 
        book.name.toLowerCase().includes(lowerSearch) || 
        book.code.toLowerCase().includes(lowerSearch)
      );
    }

    if (categoryFilter) {
      result = result.filter(book => book.category === categoryFilter);
    }

    if (groupFilter) {
      result = result.filter(book => book.group === groupFilter);
    }

    if (stockFilter) {
      if (stockFilter === 'IN_STOCK') {
        result = result.filter(book => book.stock > 50);
      } else if (stockFilter === 'LOW_STOCK') {
        result = result.filter(book => book.stock > 0 && book.stock <= 50);
      } else if (stockFilter === 'OUT_OF_STOCK') {
        result = result.filter(book => book.stock === 0);
      }
    }

    setFilteredBooks(result);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setGroupFilter('');
    setStockFilter('');
    setFilteredBooks(dummyBooks);
  };

  return (
    <div className="max-w-full mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">BOOKS DETAILS REPORTS</h1>
      </div>

      {/* FILTERS SECTION */}
      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Search</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search size={16} /></span>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or code..." 
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Category</label>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
            >
              <option value="">Select Category</option>
              <option value="ACADEMIC">Academic</option>
              <option value="FICTION">Fiction</option>
              <option value="STATIONERY">Stationery</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Group</label>
            <select 
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
            >
              <option value="">Select Group</option>
              <option value="BOOK">Book</option>
              <option value="GUIDE">Guide</option>
              <option value="NOTEBOOK">Notebook</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Stock Status</label>
            <select 
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
            >
              <option value="">All</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={handleApplyFilters} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer border-none flex items-center justify-center gap-2">
              <Filter size={16} /> Apply
            </button>
            <button onClick={handleResetFilters} className="flex-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E1E2D] px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer bg-transparent flex items-center justify-center gap-2">
              <RefreshCw size={16} /> Reset
            </button>
          </div>

        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 w-12"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item Code</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item Name</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Group</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Selling Price</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Stock</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1E1E2D] transition-colors">
                  <td className="p-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                  <td className="p-4 text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">{book.code}</td>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-200">{book.name}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{book.group}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{book.category}</td>
                  <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-200 text-right">₹ {book.price}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      book.stock > 50 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                      book.stock > 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {book.stock}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-3">
                    <button 
                      onClick={() => handleEdit(book.id)}
                      className="text-blue-500 hover:text-blue-700 bg-transparent border-none cursor-pointer p-1 rounded transition-colors" 
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer p-1 rounded transition-colors" 
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center bg-slate-50 dark:bg-[#151521]">
          <span>Showing 1 to {dummyBooks.length} of {dummyBooks.length} entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-[#1E1E2D] text-slate-600 dark:text-slate-300 cursor-not-allowed opacity-50">Prev</button>
            <button className="px-3 py-1 border border-blue-500 rounded bg-blue-500 text-white cursor-pointer">1</button>
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-[#1E1E2D] text-slate-600 dark:text-slate-300 cursor-not-allowed opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
