import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Login from './Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import AddBook from './pages/Books/AddBook';
import BooksDetails from './pages/Books/BooksDetails';
import AddClient from './pages/Clients/AddClient';
import ClientsDetails from './pages/Clients/ClientsDetails';
import BillReport from './pages/Bill/BillReport';
import PrintInvoice from './pages/Bill/PrintInvoice';
import CreateBill from './pages/Bill/CreateBill';
import AllBills from './pages/Bill/AllBills';
import LRDetails from './pages/Bill/LRDetails';
import CreateReturn from './pages/Returns/CreateReturn';
import AllReturns from './pages/Returns/AllReturns';

import StockEntry from './pages/Inventory/StockEntry';
import AllStocks from './pages/Inventory/AllStocks';
import StockReport from './pages/Reports/StockReport';
import PrintLedger from './pages/Reports/PrintLedger';
import PaymentPendingReport from './pages/Reports/PaymentPendingReport';
import ReceiptPage from './pages/Reports/ReceiptPage';
import AllReceipts from './pages/Reports/AllReceipts';
import LedgerReport from './pages/Reports/LedgerReport';
import LedgerGroupSummary from './pages/Reports/LedgerGroupSummary';
import DailyTransactionReport from './pages/Reports/DailyTransactionReport';
import OverallTransactionReport from './pages/Reports/OverallTransactionReport';
import ItemReport from './pages/Reports/ItemReport';
import SaleSummary from './pages/Reports/SaleSummary';
import ReportsDashboard from './pages/Reports/ReportsDashboard';
import CustomerReport from './pages/Reports/CustomerReport';
import CustomerWiseReport from './pages/Reports/CustomerWiseReport';
import EInvoiceSettings from './pages/Settings/EInvoiceSettings';
import BusinessSettings from './pages/Settings/BusinessSettings';
import RecycleBin from './pages/Settings/RecycleBin';
import Users from './pages/Settings/Users';
import Roles from './pages/Settings/Roles';

import Guidance from './pages/Guidance/Guidance';

import { booksList } from './seedBooks';

function App() {
  useEffect(() => {
    // LocalStorage initialization logic has been moved to database APIs and server migrations.
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard Routes wrapped in Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Bill Routes */}
          <Route path="bill/all" element={<AllBills />} />
          <Route path="bill/report" element={<BillReport />} />
          <Route path="bill/print/:id" element={<PrintInvoice />} />
          <Route path="bill/create" element={<CreateBill />} />
          <Route path="bill/edit/:id" element={<CreateBill />} />
          <Route path="bill/lr" element={<LRDetails />} />
          
          {/* Returns Routes */}
          <Route path="returns/all" element={<AllReturns />} />
          <Route path="returns/create" element={<CreateReturn />} />
          <Route path="returns/edit/:id" element={<CreateReturn />} />
          
          {/* Books Routes */}
          <Route path="books/add" element={<AddBook />} />
          <Route path="books/edit/:id" element={<AddBook />} />
          <Route path="books/details" element={<BooksDetails />} />
          
          {/* Clients Routes */}
          <Route path="clients/add" element={<AddClient />} />
          <Route path="clients/edit/:id" element={<AddClient />} />
          <Route path="clients/details" element={<ClientsDetails />} />
          
          {/* Stocks Routes */}
          <Route path="stocks/all" element={<AllStocks />} />
          <Route path="stocks/entry" element={<StockEntry />} />
          <Route path="reports" element={<ReportsDashboard />} />
          <Route path="reports/ledger" element={<LedgerReport />} />
          <Route path="reports/ledger-group" element={<LedgerGroupSummary />} />
          <Route path="reports/daily-transaction" element={<DailyTransactionReport />} />
          <Route path="reports/overall-transaction" element={<OverallTransactionReport />} />
          <Route path="stocks/edit/:id" element={<StockEntry />} />
          <Route path="stocks/report" element={<StockReport />} />
          <Route path="customer/list" element={<CustomerReport />} />
          <Route path="customer/wise-report" element={<CustomerWiseReport />} />
          <Route path="reports/receipts" element={<ReceiptPage />} />
          <Route path="reports/receipts/edit/:id" element={<ReceiptPage />} />
          <Route path="reports/all-receipts" element={<AllReceipts />} />
          <Route path="reports/ledger" element={<LedgerReport />} />
          <Route path="reports/item" element={<ItemReport />} />
          <Route path="reports/sales-summary" element={<SaleSummary />} />
          <Route path="reports/dashboard" element={<ReportsDashboard />} />
          <Route path="reports/payment-pending" element={<PaymentPendingReport />} />
          <Route path="print-ledger" element={<PrintLedger />} />
          <Route path="settings/business" element={<BusinessSettings />} />
          <Route path="settings/invoice" element={<div className="p-4 bg-white dark:bg-[#1E1E2D] dark:text-slate-300 rounded shadow">Invoice Settings</div>} />
          <Route path="settings/tax" element={<div className="p-4 bg-white dark:bg-[#1E1E2D] dark:text-slate-300 rounded shadow">Tax Settings</div>} />
          <Route path="settings/einvoice" element={<EInvoiceSettings />} />
          <Route path="settings/recyclebin" element={<RecycleBin />} />
          <Route path="settings/users" element={<Users />} />
          <Route path="settings/roles" element={<Roles />} />
          <Route path="guidance/guide" element={<Guidance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
