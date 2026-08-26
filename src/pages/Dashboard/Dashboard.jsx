import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Users, 
  BookOpen, 
  AlertTriangle,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { billsApi, clientsApi, booksApi } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBills: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalBooks: 0,
    lowStockItems: 0
  });

  const [salesData, setSalesData] = useState([]);
  const [recentBills, setRecentBills] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billsData, clientsData, booksData, receiptsData] = await Promise.all([
          billsApi.getAll(),
          clientsApi.getAll(),
          booksApi.getAll(),
          receiptsApi.getAll()
        ]);
        
        // Structure bills similar to previous localStorage
        const bills = billsData.map(b => ({
          id: b.id,
          billInfo: { billNo: b.bill_no, date: b.date },
          totals: { amount: b.net_amount },
          customer: clientsData.find(c => c.id === b.customer_id) || {}
        })).sort((a, b) => a.id - b.id);

        const clients = clientsData;
        const books = booksData;

        // Calculate basic stats
        const totalRevenue = bills.reduce((sum, bill) => sum + (parseFloat(bill.totals?.amount) || 0), 0);
        const totalCollections = receiptsData.reduce((sum, receipt) => sum + (parseFloat(receipt.amount) || 0), 0);
        const lowStockItems = books.filter(b => parseFloat(b.stock || 0) <= parseFloat(b.min_stock_alert || 0)).length;

        setStats({
          totalBills: bills.length,
          totalRevenue,
          totalCollections,
          totalCustomers: clients.length,
          totalBooks: books.length,
          lowStockItems
        });

        // Process recent bills
        setRecentBills(bills.slice(-5).reverse()); // Get last 5 bills

        // Process sales data for chart
        const salesMap = {};
        bills.forEach(bill => {
          const date = bill.billInfo?.date;
          if (date) {
            if (!salesMap[date]) salesMap[date] = 0;
            salesMap[date] += parseFloat(bill.totals?.amount) || 0;
          }
        });

        // Convert map to sorted array
        const parseDateString = (dateStr) => {
          const parts = dateStr.split('/');
          if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
          return new Date(0);
        };

        const chartData = Object.keys(salesMap)
          .sort((a, b) => parseDateString(a) - parseDateString(b))
          .slice(-14) // Last 14 active days
          .map(date => ({
            date: date.substring(0, 5), // Show DD/MM
            revenue: salesMap[date]
          }));

        setSalesData(chartData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back. Here is the latest summary of your business.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        
        {/* Total Bills */}
        <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Bills</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalBills}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center">
            <Receipt size={24} />
          </div>
        </div>

        {/* Total Collections */}
        <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Collections</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">₹{stats.totalCollections?.toFixed(0) || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center">
            <CreditCard size={24} />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Customers</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalCustomers}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        {/* Total Books */}
        <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Books</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalBooks}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full flex items-center justify-center">
            <BookOpen size={24} />
          </div>
        </div>

        {/* Inventory Alert */}
        <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.lowStockItems}</h3>
          </div>
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-primary-dark dark:text-blue-400" /> Revenue Trend
              </h2>
              <p className="text-xs text-slate-500 mt-1">Total revenue over the last active days</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total Revenue</p>
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400">₹{stats.totalRevenue.toFixed(2)}</h3>
            </div>
          </div>
          
          <div className="h-72 w-full">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                <p className="text-slate-500 text-sm">No sales data available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard size={20} className="text-primary-dark dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Bills</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {recentBills.length > 0 ? (
              recentBills.map((bill, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase">{bill.customer?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Bill No: {bill.billInfo?.billNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">₹{parseFloat(bill.totals?.amount || 0).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{bill.billInfo?.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-slate-500">No recent bills found.</p>
              </div>
            )}
          </div>
          
          {recentBills.length > 0 && (
            <button className="w-full mt-4 py-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline border-none bg-transparent cursor-pointer">
              View All Bills
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
