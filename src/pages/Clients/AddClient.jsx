import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';

// Reusable Input Component
const InputField = ({ label, name, type = "text", placeholder = "", required = false, formData, onChange, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === "textarea" ? (
      <textarea 
        name={name}
        value={formData[name]}
        onChange={onChange}
        placeholder={placeholder}
        rows="3"
        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm resize-none"
      ></textarea>
    ) : (
      <input 
        type={type} 
        name={name}
        value={formData[name]}
        onChange={onChange}
        placeholder={placeholder}
        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
      />
    )}
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

export default function AddClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const initialData = {
    ledgerName: '',
    printName: '',
    group: 'Sundry Debtors',
    partyType: 'Customer',
    billByBill: 'No',
    creditDays: '',
    crLimit: '',
    splPriceGroup: '',
    
    address: '',
    city: '',
    district: '',
    contactPerson: '',
    mobileNo: '',
    emailId: '',
    pinCode: '',
    state: '',
    phoneNo: '',
    dlNo: '',
    
    bankName: '',
    branch: '',
    accountNo: '',
    
    gstNo: '',
    panNo: '',
    aadharNo: '',
    regnType: 'Regular',
    badDebtor: false
  };

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        ledgerName: `Siva Bookstore ${id}`,
        printName: 'Siva Bookstore',
        group: 'Sundry Debtors',
        partyType: 'Customer',
        billByBill: 'Yes',
        creditDays: '30',
        crLimit: '50000',
        splPriceGroup: 'Wholesale',
        
        address: 'No 45, Gandhi Road',
        city: 'Chennai',
        district: 'Chennai',
        contactPerson: 'Siva',
        mobileNo: '9876543210',
        emailId: 'contact@sivabooks.com',
        pinCode: '600001',
        state: 'Tamil Nadu',
        phoneNo: '044-2345678',
        dlNo: 'DLTN123456',
        
        bankName: 'HDFC Bank',
        branch: 'Anna Nagar',
        accountNo: '50100123456789',
        
        gstNo: '33AAAAA0000A1Z5',
        panNo: 'AAAAA0000A',
        aadharNo: '123456789012',
        regnType: 'Regular',
        badDebtor: false
      });
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleClear = () => {
    setFormData(initialData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Client Data Submitted:", formData);
    
    if (isEditMode) {
      Swal.fire({
        title: 'Updated!',
        text: 'Client/customer details have been successfully updated.',
        icon: 'success',
        confirmButtonColor: '#2563eb',
      }).then(() => {
        navigate('/clients/details');
      });
    } else {
      Swal.fire({
        title: 'Created!',
        text: 'New client/customer has been successfully added.',
        icon: 'success',
        confirmButtonColor: '#16a34a',
      }).then(() => {
        handleClear();
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {isEditMode ? 'Edit Client / Customer' : 'Add New Client / Customer'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {isEditMode ? 'Update the ledger details for this client.' : 'Fill in the ledger details to create a new client.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a1a2e] rounded-t-lg">
          <h2 className="text-base font-semibold text-primary-dark dark:text-slate-200 uppercase tracking-wide">LEDGER MASTER</h2>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Basic & Mailing Details */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Basic / Customer Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Basic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Ledger Name" name="ledgerName" formData={formData} onChange={handleChange} required />
                <InputField label="Print Name" name="printName" formData={formData} onChange={handleChange} />
                <SelectField label="Group" name="group" options={['Sundry Debtors', 'Sundry Creditors', 'Bank Accounts']} formData={formData} onChange={handleChange} />
                <SelectField label="Party Type" name="partyType" options={['Customer', 'Supplier', 'Dealer']} formData={formData} onChange={handleChange} />
                <SelectField label="Bill by Bill" name="billByBill" options={['Yes', 'No']} formData={formData} onChange={handleChange} />
                <InputField label="Credit Days" name="creditDays" type="number" formData={formData} onChange={handleChange} />
                <InputField label="Cr. Limit" name="crLimit" type="number" formData={formData} onChange={handleChange} />
                <InputField label="Spl. Price / Disc Group" name="splPriceGroup" formData={formData} onChange={handleChange} />
              </div>
            </div>

            {/* Mailing Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Mailing Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Address" name="address" type="textarea" className="md:col-span-2" formData={formData} onChange={handleChange} />
                
                <InputField label="City" name="city" formData={formData} onChange={handleChange} />
                <InputField label="District" name="district" formData={formData} onChange={handleChange} />
                <InputField label="State" name="state" formData={formData} onChange={handleChange} />
                <InputField label="Pin Code" name="pinCode" formData={formData} onChange={handleChange} />
                
                <InputField label="Contact Person" name="contactPerson" formData={formData} onChange={handleChange} />
                <InputField label="Mobile No" name="mobileNo" type="tel" formData={formData} onChange={handleChange} required />
                <InputField label="Phone No" name="phoneNo" type="tel" formData={formData} onChange={handleChange} />
                <InputField label="E-Mail ID" name="emailId" type="email" formData={formData} onChange={handleChange} />
                <InputField label="D.L. No" name="dlNo" formData={formData} onChange={handleChange} />
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN: Bank & Tax Details */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Bank Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Bank Details</h3>
              <div className="flex flex-col gap-4">
                <InputField label="Bank Name" name="bankName" formData={formData} onChange={handleChange} />
                <InputField label="Branch" name="branch" formData={formData} onChange={handleChange} />
                <InputField label="Account No" name="accountNo" formData={formData} onChange={handleChange} />
              </div>
            </div>

            {/* Tax Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Tax Details</h3>
              <div className="flex flex-col gap-4">
                <SelectField label="Regn. Type" name="regnType" options={['Regular', 'Composition', 'Unregistered']} formData={formData} onChange={handleChange} />
                <InputField label="GST No" name="gstNo" formData={formData} onChange={handleChange} />
                <InputField label="PAN No" name="panNo" formData={formData} onChange={handleChange} />
                <InputField label="Aadhar No" name="aadharNo" formData={formData} onChange={handleChange} />
                
                {/* Bad Debtor Checkbox */}
                <div className="mt-2 flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="badDebtor"
                    name="badDebtor" 
                    checked={formData.badDebtor}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="badDebtor" className="text-sm font-medium text-red-600 dark:text-red-400 cursor-pointer">
                    Mark as Bad Debtor
                  </label>
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
