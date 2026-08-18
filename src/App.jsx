import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import AddBook from './pages/Books/AddBook';
import BooksDetails from './pages/Books/BooksDetails';
import AddClient from './pages/Clients/AddClient';
import ClientsDetails from './pages/Clients/ClientsDetails';
import CreateBill from './pages/Bill/CreateBill';
import AllBills from './pages/Bill/AllBills';
import LRDetails from './pages/Bill/LRDetails';
import Inventory from './pages/Inventory/Inventory';
import ReceiptPage from './pages/Reports/ReceiptPage';
import LedgerReport from './pages/Reports/LedgerReport';
import Transports from './pages/Transport/Transports';

import Guidance from './pages/Guidance/Guidance';

function App() {
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
          <Route path="bill/create" element={<CreateBill />} />
          <Route path="bill/edit/:id" element={<CreateBill />} />
          <Route path="bill/lr" element={<LRDetails />} />
          
          {/* Books Routes */}
          <Route path="books/add" element={<AddBook />} />
          <Route path="books/edit/:id" element={<AddBook />} />
          <Route path="books/details" element={<BooksDetails />} />
          
          {/* Clients Routes */}
          <Route path="clients/add" element={<AddClient />} />
          <Route path="clients/edit/:id" element={<AddClient />} />
          <Route path="clients/details" element={<ClientsDetails />} />
          
          {/* Other Routes */}
          <Route path="inventory" element={<Inventory />} />
          <Route path="transport" element={<Transports />} />
          <Route path="reports/receipt" element={<ReceiptPage />} />
          <Route path="reports/ledger" element={<LedgerReport />} />
          <Route path="settings/business" element={<div className="p-4 bg-white dark:bg-[#1E1E2D] dark:text-slate-300 rounded shadow">Business Settings</div>} />
          <Route path="settings/invoice" element={<div className="p-4 bg-white dark:bg-[#1E1E2D] dark:text-slate-300 rounded shadow">Invoice Settings</div>} />
          <Route path="settings/tax" element={<div className="p-4 bg-white dark:bg-[#1E1E2D] dark:text-slate-300 rounded shadow">Tax Settings</div>} />
          <Route path="guidance/guide" element={<Guidance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
