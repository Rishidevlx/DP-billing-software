import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Search, RefreshCw, AlertCircle, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { clientsApi, billsApi, receiptsApi, returnsApi, booksApi } from '../../services/api';

export default function ClientsDetails() {
  const navigate = useNavigate();

  // Tab state: 'all' | 'pending' | 'active'
  const [activeTab, setActiveTab] = useState('all');

  // Core data
  const [clients, setClients] = useState([]);
  const [bills, setBills] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [returns, setReturns] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [partyTypeFilter, setPartyTypeFilter] = useState('');

  // Filtered Data
  const [filteredClients, setFilteredClients] = useState([]);

  const loadClients = async () => {
    try {
      const data = await clientsApi.getAll();
      const mappedClients = data.map(c => ({
        ...c,
        ledgerName: c.name || '',
        mobileNo: c.mobile || '',
        city: c.town || '',
        group: 'Customer',
        partyType: c.party_type || 'School',
        badDebtor: false
      }));
      setClients(mappedClients);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [billsData, receiptsData, returnsData, booksData] = await Promise.all([
        billsApi.getAll(),
        receiptsApi.getAll(),
        returnsApi.getAll(),
        booksApi.getAll()
      ]);
      setBills(billsData);
      setReceipts(receiptsData);
      setReturns(returnsData);
      setBooks(booksData);
    } catch (e) {
      console.error('Failed to load data:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
    loadAllData();
  }, []);

  // --- PENDING CALCULATION ---
  const getPendingClients = () => {
    return clients.map(client => {
      // Sum all bills for this client
      const clientBills = bills.filter(b => b.customer_id === client.id);
      const totalBilled = clientBills.reduce((sum, b) => sum + (parseFloat(b.net_amount) || 0), 0);
      const totalBillPaid = clientBills.reduce((sum, b) => sum + (parseFloat(b.amount_paid) || 0), 0);

      // Sum all receipts for this client
      const clientReceipts = receipts.filter(r => r.customer_id === client.id);
      const totalReceipts = clientReceipts.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

      // Sum all returns for this client
      const clientReturns = returns.filter(r => r.customer_id === client.id);
      const totalReturns = clientReturns.reduce((sum, r) => sum + (parseFloat(r.net_amount) || 0), 0);

      const totalPaid = Math.max(totalBillPaid, totalReceipts);
      const pending = totalBilled - totalPaid - totalReturns;

      return {
        ...client,
        totalBilled,
        totalPaid,
        totalReturns,
        pending: Math.max(0, pending)
      };
    }).filter(c => c.pending > 0);
  };

  // --- ACTIVE LIST (This Year) ---
  const getActiveClients = () => {
    const currentYear = new Date().getFullYear();

    // Filter bills for current year
    const thisYearBills = bills.filter(b => {
      if (!b.date) return false;
      const billYear = new Date(b.date).getFullYear();
      return billYear === currentYear;
    });

    // Group by client
    const clientBillMap = {};
    for (const bill of thisYearBills) {
      if (!bill.customer_id) continue;
      if (!clientBillMap[bill.customer_id]) {
        clientBillMap[bill.customer_id] = { bills: [], bookIds: new Set() };
      }
      clientBillMap[bill.customer_id].bills.push(bill);
      if (bill.items) {
        for (const item of bill.items) {
          if (item.book_id) clientBillMap[bill.customer_id].bookIds.add(item.book_id);
        }
      }
    }

    // Build books lookup
    const booksMap = {};
    for (const book of books) {
      booksMap[book.id] = book;
    }

    return clients
      .filter(c => clientBillMap[c.id])
      .map(client => {
        const data = clientBillMap[client.id];
        const bookAliases = [...data.bookIds]
          .map(id => {
            const book = booksMap[id];
            return book ? (book.alias_name || book.book_name) : '';
          })
          .filter(Boolean);

        const totalAmount = data.bills.reduce((sum, b) => sum + (parseFloat(b.net_amount) || 0), 0);

        return {
          ...client,
          bookAliases,
          totalAmount,
          billCount: data.bills.length
        };
      });
  };

  // Live filter effect
  useEffect(() => {
    let result = clients;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(client =>
        (client.ledgerName || '').toLowerCase().includes(lowerSearch) ||
        (client.mobileNo || '').includes(lowerSearch) ||
        (client.school || '').toLowerCase().includes(lowerSearch)
      );
    }

    if (cityFilter) {
      const lowerCity = cityFilter.toLowerCase();
      result = result.filter(client => (client.city || '').toLowerCase().includes(lowerCity));
    }

    if (partyTypeFilter) {
      result = result.filter(client => client.partyType === partyTypeFilter);
    }

    setFilteredClients(result);
  }, [clients, searchTerm, cityFilter, partyTypeFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCityFilter('');
    setPartyTypeFilter('');
    setFilteredClients(clients);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await clientsApi.delete(id);
          loadClients();
          Swal.fire('Deleted!', 'Client has been deleted.', 'success');
        } catch(e) {
          console.error(e);
          Swal.fire('Error', 'Failed to delete client', 'error');
        }
      }
    });
  };

  const handleEdit = (id) => {
    navigate(`/clients/edit/${id}`);
  };

  const uniqueCities = [...new Set(clients.map(c => c.city).filter(Boolean))].sort();
  const uniquePartyTypes = [...new Set(clients.map(c => c.partyType).filter(Boolean))].sort();

  // --- Computed data for tabs ---
  const pendingClients = activeTab === 'pending' ? getPendingClients() : [];
  const activeClients = activeTab === 'active' ? getActiveClients() : [];

  // Apply search filter to pending/active tabs too
  const filteredPending = pendingClients.filter(c => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (c.ledgerName || '').toLowerCase().includes(s) ||
           (c.mobileNo || '').includes(s) ||
           (c.school || '').toLowerCase().includes(s);
  });

  const filteredActive = activeClients.filter(c => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (c.ledgerName || '').toLowerCase().includes(s) ||
           (c.mobileNo || '').includes(s) ||
           (c.school || '').toLowerCase().includes(s);
  });

  return (
    <div className="max-w-full mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">CLIENTS / CUSTOMERS DETAILS</h1>
      </div>

      {/* TAB BUTTONS */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-[#1a1a2e] p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer border-none ${
            activeTab === 'all'
              ? 'bg-white dark:bg-[#151521] text-blue-600 dark:text-blue-400 shadow-sm'
              : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Users size={16} />
          All Clients
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer border-none ${
            activeTab === 'pending'
              ? 'bg-white dark:bg-[#151521] text-red-600 dark:text-red-400 shadow-sm'
              : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <AlertCircle size={16} />
          Payment Pending
          {pendingClients.length > 0 || activeTab !== 'pending' ? null : null}
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer border-none ${
            activeTab === 'active'
              ? 'bg-white dark:bg-[#151521] text-green-600 dark:text-green-400 shadow-sm'
              : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Clock size={16} />
          Active List ({new Date().getFullYear()})
        </button>
      </div>

      {/* SEARCH BAR - common for all tabs */}
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
                placeholder="Search by Name, School or Mobile..." 
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
              />
            </div>
          </div>

          {activeTab === 'all' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">City</label>
                <select 
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
                >
                  <option value="">All Cities</option>
                  {uniqueCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Party Type</label>
                <select 
                  value={partyTypeFilter}
                  onChange={(e) => setPartyTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E0D3A]/20 dark:focus:ring-slate-700 transition-colors text-sm"
                >
                  <option value="">All Party Types</option>
                  {uniquePartyTypes.map(pt => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex gap-2 xl:col-span-2">
            <button onClick={handleResetFilters} className="w-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E1E2D] px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer bg-transparent flex items-center justify-center gap-2">
              <RefreshCw size={16} /> Reset Filters
            </button>
          </div>

        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Loading data...
        </div>
      )}

      {/* ===================== TAB: ALL CLIENTS ===================== */}
      {activeTab === 'all' && (
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
                        client.partyType === 'School' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        client.partyType === 'Shop' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {client.partyType}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-300">{client.city}</td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-300">{client.mobileNo}</td>
                    
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
                          onClick={() => handleDelete(client.id)}
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
      )}

      {/* ===================== TAB: PAYMENT PENDING ===================== */}
      {activeTab === 'pending' && (
        <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
          {/* Summary Bar */}
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle size={18} />
              <span className="font-semibold text-sm">{filteredPending.length} Clients with Pending Payments</span>
            </div>
            <div className="text-red-700 dark:text-red-400 font-bold text-lg">
              Total Pending: ₹ {filteredPending.reduce((sum, c) => sum + c.pending, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">S.No</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client Name</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">School</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Address</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mobile</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Total Billed</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Paid</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Returns</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Pending</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map((client, idx) => (
                  <tr key={client.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1E1E2D] transition-colors">
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{idx + 1}</td>
                    <td className="p-4 text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={() => handleEdit(client.id)}>
                      {client.ledgerName}
                    </td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-300">{client.school || '-'}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 max-w-[250px] truncate" title={[client.address1, client.address2, client.city, client.district].filter(Boolean).join(', ')}>
                      {[client.address1, client.address2, client.city, client.district].filter(Boolean).join(', ') || '-'}
                    </td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-300">{client.mobileNo || '-'}</td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-200 text-right font-medium">
                      ₹ {client.totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-sm text-green-600 dark:text-green-400 text-right font-medium">
                      ₹ {client.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-sm text-orange-600 dark:text-orange-400 text-right font-medium">
                      ₹ {client.totalReturns.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-sm text-right font-bold text-red-600 dark:text-red-400">
                      ₹ {client.pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                
                {filteredPending.length === 0 && !loading && (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-slate-500 dark:text-slate-400">
                      🎉 No pending payments! All clients have cleared their dues.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB: ACTIVE LIST ===================== */}
      {activeTab === 'active' && (
        <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
          {/* Summary Bar */}
          <div className="p-4 bg-green-50 dark:bg-green-900/10 border-b border-green-100 dark:border-green-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Users size={18} />
              <span className="font-semibold text-sm">{filteredActive.length} Active Clients in {new Date().getFullYear()}</span>
            </div>
            <div className="text-green-700 dark:text-green-400 font-bold text-lg">
              Total Sales: ₹ {filteredActive.reduce((sum, c) => sum + c.totalAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">S.No</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Client Name</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">School</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Address</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Mobile</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap text-center">Bills</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap text-right">Amount</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Books Purchased (Alias)</th>
                </tr>
              </thead>
              <tbody>
                {filteredActive.map((client, idx) => (
                  <tr key={client.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1E1E2D] transition-colors align-top">
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{idx + 1}</td>
                    <td className="p-4 text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline whitespace-nowrap" onClick={() => handleEdit(client.id)}>
                      {client.ledgerName}
                    </td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{client.school || '-'}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 max-w-[200px] whitespace-nowrap truncate" title={[client.address1, client.address2, client.city, client.district].filter(Boolean).join(', ')}>
                      {[client.address1, client.address2, client.city, client.district].filter(Boolean).join(', ') || '-'}
                    </td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{client.mobileNo || '-'}</td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-200 text-center font-medium whitespace-nowrap">{client.billCount}</td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-200 text-right font-medium whitespace-nowrap">
                      ₹ {client.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[400px]">
                        {client.bookAliases.map((alias, i) => (
                          <span key={i} className="inline-block text-[11px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium border border-blue-100 dark:border-blue-800">
                            {alias}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredActive.length === 0 && !loading && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No active clients found for {new Date().getFullYear()}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
