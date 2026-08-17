import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Layout from './components/Layout/Layout';
import AddBook from './pages/Books/AddBook';
import AddCategory from './pages/Books/AddCategory';
import BooksDetails from './pages/Books/BooksDetails';
import AddClient from './pages/Clients/AddClient';
import ClientsDetails from './pages/Clients/ClientsDetails';
import CreateBill from './pages/Bill/CreateBill';

import Guidance from './pages/Guidance/Guidance';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard Routes wrapped in Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<div className="p-4 bg-white dark:bg-[#1E1E2D] dark:text-slate-300 dark:border-slate-800 rounded shadow">Dashboard Content</div>} />
          
          {/* Bill Routes */}
          <Route path="bill/all" element={<div className="p-4 bg-white dark:bg-[#1E1E2D] dark:text-slate-300 rounded shadow">All Bills</div>} />
          <Route path="bill/create" element={<CreateBill />} />
          
          {/* Books Routes */}
          <Route path="books/add" element={<AddBook />} />
          <Route path="books/edit/:id" element={<AddBook />} />
          <Route path="books/category" element={<AddCategory />} />
          <Route path="books/details" element={<BooksDetails />} />
          
          {/* Clients Routes */}
          <Route path="clients/add" element={<AddClient />} />
          <Route path="clients/edit/:id" element={<AddClient />} />
          <Route path="clients/details" element={<ClientsDetails />} />
          
          {/* Other Routes */}
          <Route path="reports" element={<div className="p-4 bg-white dark:bg-[#1E1E2D] dark:text-slate-300 rounded shadow">Reports</div>} />
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
