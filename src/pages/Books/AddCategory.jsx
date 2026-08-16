import React, { useState } from 'react';
import { Pencil, Trash2, Save, RefreshCw } from 'lucide-react';

// Dummy Categories
const dummyCategories = [
  { id: 1, name: 'FICTION', code: 'FIC', desc: 'Fiction Books', status: 'Active' },
  { id: 2, name: 'ACADEMIC', code: 'ACD', desc: 'Academic Textbooks', status: 'Active' },
  { id: 3, name: 'GUIDES', code: 'GD', desc: 'Exam Guides & Notes', status: 'Active' },
  { id: 4, name: 'STATIONERY', code: 'STY', desc: 'Stationery Items', status: 'Inactive' },
];

export default function AddCategory() {
  const [formData, setFormData] = useState({
    categoryName: '',
    categoryCode: '',
    description: '',
    status: 'Active'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      categoryName: '',
      categoryCode: '',
      description: '',
      status: 'Active'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    // Add API logic here
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">ADD CATEGORY</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDE: FORM */}
        <div className="lg:col-span-4 bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e]">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Category Information</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            {/* Category Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                placeholder="Enter category name"
                className="px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
                required
              />
            </div>

            {/* Category Code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Category Code <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="categoryCode"
                value={formData.categoryCode}
                onChange={handleChange}
                placeholder="Enter category code"
                className="px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
                required
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                rows="3"
                className="px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm resize-none"
              ></textarea>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="button" 
                onClick={handleClear}
                className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-8 py-3 rounded-none font-medium transition-colors cursor-pointer border-none text-sm"
              >
                <RefreshCw size={16} />
                Clear
              </button>
              
              <button 
                type="submit" 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-none font-medium transition-colors cursor-pointer border-none text-sm"
              >
                <Save size={16} />
                Create
              </button>
            </div>
          </form>
        </div>


        {/* RIGHT SIDE: TABLE */}
        <div className="lg:col-span-8 bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e]">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Category List</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">S.No</th>
                  <th className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Category Code</th>
                  <th className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Category Name</th>
                  <th className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dummyCategories.map((cat, index) => (
                  <tr key={cat.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1E1E2D] transition-colors">
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{index + 1}</td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-300 font-medium">{cat.code}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 uppercase">{cat.name}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${cat.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-end gap-3">
                      <button className="text-blue-500 hover:text-blue-700 bg-transparent border-none cursor-pointer p-1 rounded transition-colors" title="Edit">
                        <Pencil size={18} />
                      </button>
                      <button className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer p-1 rounded transition-colors" title="Delete">
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
            <span>Showing 1 to {dummyCategories.length} of {dummyCategories.length} entries</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-[#1E1E2D] text-slate-600 dark:text-slate-300 cursor-not-allowed opacity-50">Prev</button>
              <button className="px-3 py-1 border border-blue-500 rounded bg-blue-500 text-white cursor-pointer">1</button>
              <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-[#1E1E2D] text-slate-600 dark:text-slate-300 cursor-not-allowed opacity-50">Next</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
