import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Search, Filter, RefreshCw, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { booksApi } from '../../services/api';

export default function BooksDetails() {
  const navigate = useNavigate();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');

  // Filtered Data State
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);

  const extractNumber = (name) => {
    if (!name) return Infinity;
    const match = name.match(/\d+/);
    return match ? parseInt(match[0], 10) : Infinity;
  };

  const sortBooks = (books) => {
    return [...books].sort((a, b) => extractNumber(a.book_name || a.itemName) - extractNumber(b.book_name || b.itemName));
  };

  const loadBooks = async () => {
    try {
      const data = await booksApi.getAll();
      const sortedBooks = sortBooks(data);
      setAllBooks(sortedBooks);
      setFilteredBooks(sortedBooks);
    } catch (err) {
      console.error('Failed to load books:', err);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleEdit = (id) => {
    navigate(`/books/edit/${id}`);
  };

  const handleApplyFilters = () => {
    let result = allBooks;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(book => 
        (book.itemName && book.itemName.toLowerCase().includes(lowerSearch)) || 
        (book.itemCode && book.itemCode.toLowerCase().includes(lowerSearch))
      );
    }

    if (groupFilter) {
      result = result.filter(book => book.group === groupFilter);
    }

    setFilteredBooks(sortBooks(result));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setGroupFilter('');
    setFilteredBooks(allBooks);
  };

  const handleDelete = (id) => {
    const updatedBooks = allBooks.filter(book => book.id !== id);
    localStorage.setItem('books', JSON.stringify(updatedBooks));
    setAllBooks(updatedBooks);
    setFilteredBooks(updatedBooks);
  };

  const handleDuplicate = (id) => {
    const bookToDuplicate = allBooks.find(b => b.id === id);
    if (bookToDuplicate) {
      const newBook = { ...bookToDuplicate, id: Date.now(), itemCode: bookToDuplicate.itemCode + '-COPY' };
      const updatedBooks = [...allBooks, newBook];
      localStorage.setItem('books', JSON.stringify(updatedBooks));
      setAllBooks(updatedBooks);
      handleApplyFilters(); // re-apply filters to show it if needed, or simply let it refresh
      setFilteredBooks(prev => [...prev, newBook]);
    }
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
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Group</label>
            <select 
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
            >
              <option value="">Select Group</option>
              <option value="BOOK">Book</option>
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
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Alias</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item Name</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Group</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">COV</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Unit</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Stocks</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Selling Price</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book, idx) => (
                <tr 
                  key={book.id || idx} 
                  onDoubleClick={() => handleEdit(book.id)}
                  onKeyDown={(e) => { if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); handleEdit(book.id); } }}
                  tabIndex={0}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1E1E2D] transition-colors cursor-pointer outline-none focus:bg-slate-50 dark:focus:bg-[#1E1E2D]"
                >
                  <td className="p-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                  <td className="p-4 text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">{book.alias_name || book.aliasName || "-"}</td>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-200">{book.book_name || book.itemName}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{book.subject || book.group || "BOOK"}</td>
                  <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-200 text-center">{book.cov || "-"}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400 text-center">{book.unit || "NOS"}</td>
                  <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-200 text-center">{book.stock || 0}</td>
                  <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-200 text-right">₹ {Number(book.price || book.sellingPrice).toFixed(2)}</td>
                  <td className="p-4 flex items-center justify-end gap-3">
                    <button 
                      onClick={() => handleEdit(book.id)}
                      className="text-blue-500 hover:text-blue-700 bg-transparent border-none cursor-pointer p-1 rounded transition-colors" 
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDuplicate(book.id)}
                      className="text-green-500 hover:text-green-700 bg-transparent border-none cursor-pointer p-1 rounded transition-colors" 
                      title="Duplicate"
                    >
                      <Copy size={18} />
                    </button>
                    <button 
                      onClick={async () => {
                         if(window.confirm('Are you sure you want to delete this book?')) {
                            try {
                               await booksApi.delete(book.id);
                               loadBooks();
                            } catch (e) {
                               console.error(e);
                               alert('Failed to delete book');
                            }
                         }
                      }}
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
          <span>Showing 1 to {filteredBooks.length} of {filteredBooks.length} entries</span>
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
