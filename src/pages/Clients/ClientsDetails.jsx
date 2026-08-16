import React, { useState } from 'react';
import { Pencil, Trash2, Search, Filter, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Dummy Clients Data
const dummyClients = [
  { id: 1, ledgerName: 'Siva Bookstore', group: 'Sundry Debtors', partyType: 'Customer', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', mobileNo: '9876543210', crLimit: '50000', badDebtor: false },
  { id: 2, ledgerName: 'National Publishers', group: 'Sundry Creditors', partyType: 'Supplier', city: 'Delhi', district: 'New Delhi', state: 'Delhi', mobileNo: '8877665544', crLimit: '0', badDebtor: false },
  { id: 3, ledgerName: 'Kumar Stationery', group: 'Sundry Debtors', partyType: 'Dealer', city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', mobileNo: '9988776655', crLimit: '25000', badDebtor: true },
  { id: 4, ledgerName: 'Ravi & Co', group: 'Sundry Creditors', partyType: 'Supplier', city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', mobileNo: '9123456780', crLimit: '0', badDebtor: false },
  { id: 5, ledgerName: 'A1 Books', group: 'Sundry Debtors', partyType: 'Customer', city: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', mobileNo: '9845123670', crLimit: '10000', badDebtor: false },
  { id: 6, ledgerName: 'Vijay Enterprises', group: 'Sundry Debtors', partyType: 'Dealer', city: 'Trichy', district: 'Trichy', state: 'Tamil Nadu', mobileNo: '7766554433', crLimit: '75000', badDebtor: false },
  { id: 7, ledgerName: 'Global Papers', group: 'Sundry Creditors', partyType: 'Supplier', city: 'Kochi', district: 'Ernakulam', state: 'Kerala', mobileNo: '8090706050', crLimit: '0', badDebtor: false },
  { id: 8, ledgerName: 'Murugan Stores', group: 'Sundry Debtors', partyType: 'Customer', city: 'Salem', district: 'Salem', state: 'Tamil Nadu', mobileNo: '9554433221', crLimit: '15000', badDebtor: true },
];

export default function ClientsDetails() {
  const navigate = useNavigate();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [partyTypeFilter, setPartyTypeFilter] = useState('');
  const [badDebtorFilter, setBadDebtorFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  // Filtered Data State
  const [filteredClients, setFilteredClients] = useState(dummyClients);

  const handleEdit = (id) => {
    navigate(`/clients/edit/${id}`);
  };

  const handleApplyFilters = () => {
    let result = dummyClients;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(client => 
        client.ledgerName.toLowerCase().includes(lowerSearch) || 
        client.mobileNo.includes(lowerSearch)
      );
    }

    if (groupFilter) {
      result = result.filter(client => client.group === groupFilter);
    }

    if (partyTypeFilter) {
      result = result.filter(client => client.partyType === partyTypeFilter);
    }

    if (badDebtorFilter) {
      if (badDebtorFilter === 'YES') {
        result = result.filter(client => client.badDebtor === true);
      } else if (badDebtorFilter === 'NO') {
        result = result.filter(client => client.badDebtor === false);
      }
    }

    if (stateFilter) {
      const lowerState = stateFilter.toLowerCase();
      result = result.filter(client => client.state.toLowerCase().includes(lowerState));
    }

    if (districtFilter) {
      const lowerDist = districtFilter.toLowerCase();
      result = result.filter(client => client.district.toLowerCase().includes(lowerDist) || client.city.toLowerCase().includes(lowerDist));
    }

    setFilteredClients(result);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setGroupFilter('');
    setPartyTypeFilter('');
    setBadDebtorFilter('');
    setStateFilter('');
    setDistrictFilter('');
    setFilteredClients(dummyClients);
  };

  return (
    <div className="max-w-full mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">CLIENTS / CUSTOMERS DETAILS</h1>
      </div>

      {/* FILTERS SECTION */}
      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 items-end">
          
          <div className="flex flex-col gap-1.5 xl:col-span-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Search</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search size={16} /></span>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by Name or Mobile..." 
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">State</label>
            <select 
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                // Also trigger filter application if needed, but they have Enter/Apply for search. For select, onChange is usually enough to apply, but we can stick to Apply button / Enter key flow.
              }}
              onKeyDown={handleKeyDown}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
            >
              <option value="">All States</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Kerala">Kerala</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">District / City</label>
            <select 
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              onKeyDown={handleKeyDown}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
            >
              <option value="">All Districts</option>
              <option value="Chennai">Chennai</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Madurai">Madurai</option>
              <option value="Trichy">Trichy</option>
              <option value="Salem">Salem</option>
              <option value="Ernakulam">Ernakulam</option>
              <option value="New Delhi">New Delhi</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Party Type</label>
            <select 
              value={partyTypeFilter}
              onChange={(e) => setPartyTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
            >
              <option value="">All</option>
              <option value="Customer">Customer</option>
              <option value="Supplier">Supplier</option>
              <option value="Dealer">Dealer</option>
            </select>
          </div>

          <div className="flex gap-2 xl:col-span-2">
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
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ledger Name</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Group</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Party Type</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">City</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mobile No</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Cr. Limit</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1E1E2D] transition-colors">
                  <td className="p-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                  <td className="p-4 text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                    {client.ledgerName}
                    {client.badDebtor && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase font-bold">Bad Debt</span>}
                  </td>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-300">{client.group}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      client.partyType === 'Customer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      client.partyType === 'Supplier' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {client.partyType}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-300">{client.city}</td>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-300">{client.mobileNo}</td>
                  <td className="p-4 text-sm font-medium text-slate-900 dark:text-slate-100 text-right">₹{client.crLimit}</td>
                  
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(client.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No clients found matching the filters.
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
