import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Reusable Input Component
const InputField = ({ label, name, type = "text", placeholder = "", required = false, formData, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      type={type} 
      name={name}
      value={formData[name]}
      onChange={onChange}
      placeholder={placeholder}
      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
    />
  </div>
);

// Reusable Select Component
const SelectField = ({ label, name, options, required = false, formData, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select 
      name={name}
      value={formData[name]}
      onChange={onChange}
      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
    >
      <option value="" disabled>Select {label}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default function AddBook() {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: '',
    alias: '',
    group: 'BOOK',
    rateMethod: 'Qty',
    hsnCode: '',
    tax: 'Exempt',
    customTax: '',
    taxSlab: 'Zero',
    unit: 'NOS',
    convQty: '',
    packingQty: '',
    minLevel: '',
    maxLevel: '',
    reorderLevel: '',
    rackNo: '',
    sellingPriceOn: 'Main Unit',
    sellingPrice: '',
    splPrice1: '',
    splPrice2: '',
    splPrice3: '',
    mrp: '',
    currentStock: '',
    minStockAlert: ''
  });

  useEffect(() => {
    if (isEditMode) {
      const existingBooks = JSON.parse(localStorage.getItem('books') || '[]');
      const bookToEdit = existingBooks.find(b => b.id === parseInt(id));
      if (bookToEdit) {
        setFormData(bookToEdit);
      }
    }
  }, [id, isEditMode]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        document.getElementById('bookSubmitBtn')?.click();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      itemCode: '',
      itemName: '',
      alias: '',
      group: 'BOOK',
      rateMethod: 'Qty',
      hsnCode: '',
      tax: 'Exempt',
      customTax: '',
      taxSlab: 'Zero',
      unit: 'NOS',
      convQty: '',
      packingQty: '',
      minLevel: '',
      maxLevel: '',
      reorderLevel: '',
      rackNo: '',
      sellingPriceOn: 'Main Unit',
      sellingPrice: '',
      splPrice1: '',
      splPrice2: '',
      splPrice3: '',
      mrp: '',
      currentStock: '',
      minStockAlert: ''
    });
  };

  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
      const form = e.target.form;
      if (form) {
        const elements = Array.from(form.elements).filter(el => !el.disabled && el.tabIndex !== -1 && el.type !== 'hidden');
        const index = elements.indexOf(e.target);
        if (index > -1 && index < elements.length - 1) {
          elements[index + 1].focus();
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const existingBooks = JSON.parse(localStorage.getItem('books') || '[]');
    
    if (isEditMode) {
      const updatedBooks = existingBooks.map(b => b.id === parseInt(id) ? { ...formData, id: parseInt(id) } : b);
      localStorage.setItem('books', JSON.stringify(updatedBooks));
      Swal.fire({
        title: 'Updated!',
        text: 'Book details have been successfully updated.',
        icon: 'success',
        confirmButtonColor: '#2563eb',
      }).then(() => {
        navigate('/books/details');
      });
    } else {
      const newBook = { ...formData, id: Date.now() };
      localStorage.setItem('books', JSON.stringify([...existingBooks, newBook]));
      Swal.fire({
        title: 'Created!',
        text: 'New book has been successfully created.',
        icon: 'success',
        confirmButtonColor: '#16a34a',
      }).then(() => {
        navigate('/books/details');
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {isEditMode ? 'Edit Book' : 'Add New Book'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {isEditMode ? 'Update the item master details for this book.' : 'Fill in the item master details to create a new book.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e] rounded-t-lg">
          <h2 className="text-base font-semibold text-primary-dark dark:text-slate-200 uppercase tracking-wide">ITEM MASTER</h2>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Product & Tax Details */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Product Details Section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Product Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Item Code" name="itemCode" formData={formData} onChange={handleChange} required />
                <InputField label="Item Name" name="itemName" formData={formData} onChange={handleChange} required />
                <InputField label="Alias / Part No" name="alias" formData={formData} onChange={handleChange} />
                <SelectField label="Group" name="group" options={['BOOK']} formData={formData} onChange={handleChange} />
                <SelectField label="Rate Method" name="rateMethod" options={['Qty', 'Weight', 'Length']} formData={formData} onChange={handleChange} />
              </div>
            </div>

            {/* Tax Details & Unit (Grouped in 2 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Tax Details</h3>
                <div className="flex flex-col gap-4">
                  <InputField label="HSN Code" name="hsnCode" formData={formData} onChange={handleChange} />
                  <SelectField label="Tax" name="tax" options={['Exempt', 'Other']} formData={formData} onChange={handleChange} />
                  {formData.tax === 'Other' && (
                    <InputField label="Custom Tax" name="customTax" formData={formData} onChange={handleChange} />
                  )}
                  <SelectField label="Tax Slab" name="taxSlab" options={['Zero']} formData={formData} onChange={handleChange} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Unit</h3>
                <div className="flex flex-col gap-4">
                  <SelectField label="Unit" name="unit" options={['NOS']} formData={formData} onChange={handleChange} />
                  <InputField label="Conv. Qty" name="convQty" formData={formData} onChange={handleChange} />
                  <InputField label="Packing Qty" name="packingQty" formData={formData} onChange={handleChange} />
                </div>
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN: Price Details & Stock Level */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Price Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Price Details</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-6 py-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Selling Price On:</span>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
                    <input type="radio" name="sellingPriceOn" value="Main Unit" checked={formData.sellingPriceOn === 'Main Unit'} onChange={handleChange} className="accent-primary-dark" />
                    Main Unit
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
                    <input type="radio" name="sellingPriceOn" value="Alt Unit" checked={formData.sellingPriceOn === 'Alt Unit'} onChange={handleChange} className="accent-primary-dark" />
                    Alt Unit
                  </label>
                </div>

                <InputField label="Selling Price" name="sellingPrice" formData={formData} onChange={handleChange} />
                <InputField label="Spl. Price 1" name="splPrice1" formData={formData} onChange={handleChange} />
                <InputField label="Spl. Price 2" name="splPrice2" formData={formData} onChange={handleChange} />
                <InputField label="Spl. Price 3" name="splPrice3" formData={formData} onChange={handleChange} />
                <InputField label="MRP" name="mrp" formData={formData} onChange={handleChange} />
              </div>
            </div>

            {/* Stock Level Removed */}

          </div>

        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-4 bg-slate-50 dark:bg-[#1a1a2e] rounded-b-lg">
          <button 
            type="button" 
            onClick={handleClear}
            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-8 py-3 rounded-none font-medium transition-colors cursor-pointer border-none"
          >
            <RefreshCw size={18} />
            Clear
          </button>
          
          <button 
            type="submit" 
            id="bookSubmitBtn"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-none font-medium transition-colors cursor-pointer border-none"
          >
            <Save size={18} />
            {isEditMode ? 'Update (Ctrl+S)' : 'Create (Ctrl+S)'}
          </button>
        </div>
      </form>
    </div>
  );
}
