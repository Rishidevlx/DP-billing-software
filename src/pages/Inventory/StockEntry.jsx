import React, { useState, useEffect, useRef } from 'react';
import { PackagePlus, Save, Plus, Trash2, Search, Calendar, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';

export default function StockEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalEntry, setOriginalEntry] = useState(null);
  const [items, setItems] = useState([
    { id: 1, itemCode: '', itemName: '', date: new Date().toISOString().split('T')[0], quantity: '' }
  ]);
  
  const [booksList, setBooksList] = useState([]);
  
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);

  useEffect(() => {
    const savedBooks = JSON.parse(localStorage.getItem('books') || '[]');
    setBooksList(savedBooks);

    if (id) {
      setIsEditMode(true);
      const stockEntries = JSON.parse(localStorage.getItem('stock_entries') || '[]');
      const entryToEdit = stockEntries.find(e => e.id === id);
      if (entryToEdit) {
        setOriginalEntry(entryToEdit);
        if (entryToEdit.items && entryToEdit.items.length > 0) {
          // Ensure each item has a unique local id for rendering
          const loadedItems = entryToEdit.items.map((item, index) => ({
            ...item,
            id: item.id || Date.now() + index
          }));
          setItems(loadedItems);
        }
      }
    }
  }, [id]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), itemCode: '', itemName: '', date: new Date().toISOString().split('T')[0], quantity: '' }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleItemSelection = (rowIndex, selectedBook) => {
    setItems(items.map((item, i) => {
      if (i === rowIndex) {
        return {
          ...item,
          itemCode: selectedBook.itemCode,
          itemName: selectedBook.itemName,
        };
      }
      return item;
    }));
  };

  const handleKeyDown = (e, rowIndex, field) => {
    if (field === 'itemName' && activeRowIndex === rowIndex) {
      const filteredBooks = booksList.filter(b => (b.itemName || '').toLowerCase().includes((items[rowIndex].itemName || '').toLowerCase()));
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveOptionIndex(prev => (prev < filteredBooks.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveOptionIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredBooks.length > 0) {
          handleItemSelection(rowIndex, filteredBooks[activeOptionIndex]);
          setActiveRowIndex(null);
          setTimeout(() => document.getElementById(`item-${rowIndex}-date`)?.focus(), 0);
        }
      } else if (e.key === 'Escape') {
        setActiveRowIndex(null);
      }
    }
  };

  const handleSave = () => {

    
    const validItems = items.filter(item => item.itemName && item.quantity > 0);
    if (validItems.length === 0) {
      Swal.fire('Error', 'Please add at least one valid item with a quantity greater than 0', 'error');
      return;
    }

    // Save Stock Entry
    const stockEntries = JSON.parse(localStorage.getItem('stock_entries') || '[]');
    
    if (isEditMode) {
      const entryIndex = stockEntries.findIndex(e => e.id === id);
      if (entryIndex !== -1) {
        stockEntries[entryIndex] = {
          ...stockEntries[entryIndex],
          items: validItems
        };
      }
    } else {
      const newEntries = validItems.map(item => ({
        id: Date.now().toString() + Math.random().toString().substring(2, 6),
        date: item.date,
        items: [item]
      }));
      stockEntries.push(...newEntries);
    }
    
    localStorage.setItem('stock_entries', JSON.stringify(stockEntries));

    // Update Books Stock
    const currentBooks = JSON.parse(localStorage.getItem('books') || '[]');
    
    // Reverse original entry quantities if in edit mode
    let booksAfterReversal = [...currentBooks];
    if (isEditMode && originalEntry && originalEntry.items) {
      booksAfterReversal = booksAfterReversal.map(book => {
        const itemInOrig = originalEntry.items.find(i => (i.itemName || '').toLowerCase() === (book.itemName || '').toLowerCase());
        if (itemInOrig) {
          return {
            ...book,
            currentStock: (parseFloat(book.currentStock) || 0) - (parseFloat(itemInOrig.quantity) || 0)
          };
        }
        return book;
      });
    }

    let updatedBooks = booksAfterReversal.map(book => {
      const itemInEntry = validItems.find(i => (i.itemName || '').toLowerCase() === (book.itemName || '').toLowerCase());
      if (itemInEntry) {
        return {
          ...book,
          currentStock: (parseFloat(book.currentStock) || 0) + parseFloat(itemInEntry.quantity)
        };
      }
      return book;
    });
    
    // Add any completely new books to the books list
    validItems.forEach(item => {
      const exists = currentBooks.find(b => (b.itemName || '').toLowerCase() === (item.itemName || '').toLowerCase());
      if (!exists) {
        updatedBooks.push({
          id: Date.now().toString() + Math.random().toString().substring(2, 6),
          itemCode: item.itemCode || '',
          itemName: item.itemName,
          currentStock: parseFloat(item.quantity) || 0,
          purchasePrice: 0,
          salesPrice: 0,
          category: 'General'
        });
      }
    });
    
    localStorage.setItem('books', JSON.stringify(updatedBooks));

    Swal.fire('Success', isEditMode ? 'Stock Entry updated successfully!' : 'Stock Entry saved successfully! Stock quantities updated.', 'success').then(() => {
      if (isEditMode) {
        navigate('/stocks/all');
      } else {
        // Reset Form
        setItems([{ id: 1, itemCode: '', itemName: '', date: new Date().toISOString().split('T')[0], quantity: '' }]);
        setBooksList(updatedBooks); // refresh local state
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PackagePlus className="text-blue-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">{isEditMode ? 'Edit Stock Entry' : 'Stock Entry'}</h1>
            <p className="text-slate-500 text-sm">{isEditMode ? 'Update your previous stock inwards.' : 'Add new stock inwards to update your inventory.'}</p>
          </div>
        </div>
        {isEditMode && (
          <button onClick={() => navigate('/stocks/all')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
            <ArrowLeft size={16} /> Back to All Stocks
          </button>
        )}
      </div>



      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm mb-6">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e] rounded-t-lg flex justify-between items-center">
          <h2 className="text-base font-semibold text-primary-dark dark:text-slate-200 uppercase tracking-wide">Stock Items</h2>
        </div>
        
        <div className="overflow-visible min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-16 text-center">S.No</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-32">Alias</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400">Item Name *</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-40 text-center">Date *</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-32 text-center">Quantity *</th>
                <th className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const filteredBooks = booksList.filter(b => (b.itemName || '').toLowerCase().includes((item.itemName || '').toLowerCase()));
                
                return (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1a1a2e]/50">
                    <td className="p-2 text-center text-sm font-medium text-slate-500">{index + 1}</td>
                    
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.itemCode}
                        onChange={(e) => handleItemChange(item.id, 'itemCode', e.target.value)}
                        placeholder="Code"
                        className="w-full px-2 py-1.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 rounded bg-transparent focus:bg-white dark:focus:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm outline-none transition-all uppercase"
                      />
                    </td>
                    
                    <td className="p-2 relative">
                      <input
                        id={`item-${index}-itemName`}
                        type="text"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                        onFocus={() => {
                          setActiveRowIndex(index);
                          setActiveOptionIndex(0);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, index, 'itemName')}
                        placeholder="Search books..."
                        className="w-full px-2 py-1.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 rounded bg-transparent focus:bg-white dark:focus:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm outline-none transition-all uppercase"
                      />
                      {activeRowIndex === index && (
                        <div className="absolute z-50 top-full left-0 w-[400px] mt-1 bg-white dark:bg-[#1E1E2D] border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {filteredBooks.length > 0 ? (
                            <ul className="py-1">
                              {filteredBooks.map((book, bIndex) => (
                                <li 
                                  key={book.id}
                                  onClick={() => {
                                    handleItemSelection(index, book);
                                    setActiveRowIndex(null);
                                    setTimeout(() => document.getElementById(`item-${index}-date`)?.focus(), 0);
                                  }}
                                  className={`px-3 py-2 cursor-pointer text-sm flex justify-between ${activeOptionIndex === bIndex ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                >
                                  <span className="font-semibold uppercase">{book.itemName}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="px-3 py-2 text-sm text-slate-500 italic">No books found</div>
                          )}
                        </div>
                      )}
                    </td>
                    
                    <td className="p-2">
                      <input
                        id={`item-${index}-date`}
                        type="date"
                        value={item.date}
                        onChange={(e) => handleItemChange(item.id, 'date', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            document.getElementById(`item-${index}-quantity`)?.focus();
                          }
                        }}
                        className="w-full px-2 py-1.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 rounded bg-transparent focus:bg-white dark:focus:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm outline-none transition-all text-center"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        id={`item-${index}-quantity`}
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (index === items.length - 1) {
                              handleAddItem();
                              setTimeout(() => {
                                document.getElementById(`item-${index + 1}-itemName`)?.focus();
                              }, 0);
                            } else {
                              document.getElementById(`item-${index + 1}-itemName`)?.focus();
                            }
                          }
                        }}
                        placeholder="Qty"
                        min="1"
                        className="w-full px-2 py-1.5 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 rounded bg-transparent focus:bg-white dark:focus:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm outline-none transition-all text-center font-bold"
                      />
                    </td>
                    
                    <td className="p-2 text-center">
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-30 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e]/50">
          <button 
            onClick={handleAddItem}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
          >
            <Plus size={16} />
            Add Another Item
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Save size={18} />
          {isEditMode ? 'Update Stock Entry' : 'Save Stock Entry'}
        </button>
      </div>

    </div>
  );
}
