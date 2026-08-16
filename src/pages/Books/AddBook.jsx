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
    printName: '',
    alias: '',
    group: '',
    brand: '',
    category: '',
    rateMethod: 'Qty',
    hsnCode: '',
    tax: '',
    taxSlab: '',
    unit: 'NOS',
    convQty: '',
    packingQty: '',
    minLevel: '',
    maxLevel: '',
    reorderLevel: '',
    rackNo: '',
    purchaseRate: '',
    sellingPriceOn: 'Main Unit',
    sellingPrice: '',
    splPrice1: '',
    splPrice2: '',
    mrp: ''
  });

  useEffect(() => {
    if (isEditMode) {
      // Simulate fetching data for edit mode
      setFormData({
        itemCode: `BK00${id}`,
        itemName: 'HARRY POTTER PART 1',
        printName: 'HARRY POTTER',
        alias: 'HP1',
        group: 'BOOK',
        brand: 'BLOOMSBURY',
        category: 'FICTION',
        rateMethod: 'Qty',
        hsnCode: '4901',
        tax: 'GST 5%',
        taxSlab: 'Standard',
        unit: 'NOS',
        convQty: '1',
        packingQty: '1',
        minLevel: '5',
        maxLevel: '100',
        reorderLevel: '10',
        rackNo: 'R-A1',
        purchaseRate: '350.00',
        sellingPriceOn: 'Main Unit',
        sellingPrice: '450.00',
        splPrice1: '420.00',
        splPrice2: '400.00',
        mrp: '500.00'
      });
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      itemCode: '',
      itemName: '',
      printName: '',
      alias: '',
      group: '',
      brand: '',
      category: '',
      rateMethod: 'Qty',
      hsnCode: '',
      tax: '',
      taxSlab: '',
      unit: 'NOS',
      convQty: '',
      packingQty: '',
      minLevel: '',
      maxLevel: '',
      reorderLevel: '',
      rackNo: '',
      purchaseRate: '',
      sellingPriceOn: 'Main Unit',
      sellingPrice: '',
      splPrice1: '',
      splPrice2: '',
      mrp: ''
    });
  };

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    if (isEditMode) {
      Swal.fire({
        title: 'Updated!',
        text: 'Book details have been successfully updated.',
        icon: 'success',
        confirmButtonColor: '#2563eb',
      }).then(() => {
        navigate('/books/details');
      });
    } else {
      Swal.fire({
        title: 'Created!',
        text: 'New book has been successfully created.',
        icon: 'success',
        confirmButtonColor: '#16a34a',
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

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
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
                <InputField label="Print Name" name="printName" formData={formData} onChange={handleChange} />
                <InputField label="Alias / Part No" name="alias" formData={formData} onChange={handleChange} />
                <SelectField label="Group" name="group" options={['BOOK', 'NOTEBOOK', 'STATIONERY']} formData={formData} onChange={handleChange} />
                <InputField label="Brand" name="brand" formData={formData} onChange={handleChange} />
                <SelectField label="Category" name="category" options={['FICTION', 'ACADEMIC', 'GUIDE']} formData={formData} onChange={handleChange} />
                <SelectField label="Rate Method" name="rateMethod" options={['Qty', 'Weight', 'Length']} formData={formData} onChange={handleChange} />
              </div>
            </div>

            {/* Tax Details & Unit (Grouped in 2 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Tax Details</h3>
                <div className="flex flex-col gap-4">
                  <InputField label="HSN Code" name="hsnCode" formData={formData} onChange={handleChange} />
                  <SelectField label="Tax" name="tax" options={['GST 5%', 'GST 12%', 'GST 18%', 'Exempt']} formData={formData} onChange={handleChange} />
                  <SelectField label="Tax Slab" name="taxSlab" options={['Standard', 'Reduced', 'Zero']} formData={formData} onChange={handleChange} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Unit</h3>
                <div className="flex flex-col gap-4">
                  <SelectField label="Unit" name="unit" options={['NOS', 'BOX', 'KG', 'SET']} formData={formData} onChange={handleChange} />
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
                <InputField label="Purchase Rate" name="purchaseRate" formData={formData} onChange={handleChange} required />
                
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

                <InputField label="Selling Price" name="sellingPrice" formData={formData} onChange={handleChange} required />
                <InputField label="Spl. Price 1" name="splPrice1" formData={formData} onChange={handleChange} />
                <InputField label="Spl. Price 2" name="splPrice2" formData={formData} onChange={handleChange} />
                <InputField label="MRP" name="mrp" formData={formData} onChange={handleChange} />
                
                <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">* Purchase Rate on Main Unit</p>
              </div>
            </div>

            {/* Stock Level */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Stock Level</h3>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Minimum Level" name="minLevel" formData={formData} onChange={handleChange} />
                  <InputField label="Max. Level" name="maxLevel" formData={formData} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Reorder Level" name="reorderLevel" formData={formData} onChange={handleChange} />
                  <InputField label="Rack No" name="rackNo" formData={formData} onChange={handleChange} />
                </div>
              </div>
            </div>

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
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-none font-medium transition-colors cursor-pointer border-none"
          >
            <Save size={18} />
            {isEditMode ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
