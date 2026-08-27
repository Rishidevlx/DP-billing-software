import { moveToRecycleBin } from '../../utils/recycleBin';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit, Trash2, FileText, Eye, X, Printer } from 'lucide-react';
import Swal from 'sweetalert2';
import { receiptsApi, clientsApi, billsApi } from '../../services/api';
import { useReactToPrint } from 'react-to-print';
import PrintReceipt from './PrintReceipt';

export default function AllReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const printRef = useRef();
  const navigate = useNavigate();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receipt_${selectedReceipt?.voucherNo || 'Doc'}`,
  });

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const [receiptsData, clientsData] = await Promise.all([
        receiptsApi.getAll(),
        clientsApi.getAll()
      ]);
      
      const mapped = receiptsData.map(r => {
         const customer = clientsData.find(c => c.id === r.customer_id);
         return {
           id: r.id,
           date: r.date,
           voucherNo: r.receipt_no,
           customerName: customer ? customer.name : '',
           amount: r.amount,
           // Additional fields not strictly in current minimal schema, mapping safely
           narrationSno: r.narration_sno || '', 
           narrationPg: r.narration_pg || '',
           narrationDate: r.narration_date || ''
         };
      });
      mapped.sort((a, b) => new Date(b.date) - new Date(a.date));
      setReceipts(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (receipt) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You are about to delete this receipt. This will revert the paid amounts on any allocated bills.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // First, get the full receipt to find allocations
          const allReceipts = await receiptsApi.getAll();
          const fullReceipt = allReceipts.find(r => r.id === receipt.id);
          
          // Reverse bill allocations if they exist
          if (fullReceipt && fullReceipt.allocations) {
            let allocations = fullReceipt.allocations;
            if (typeof allocations === 'string') {
              try { allocations = JSON.parse(allocations); } catch(e) { allocations = {}; }
            }
            
            for (const [billId, allocatedAmount] of Object.entries(allocations)) {
              if (allocatedAmount > 0) {
                // Reverse the allocation by paying negative amount
                await billsApi.pay(billId, -allocatedAmount);
              }
            }
          }
          
          // Move to recycle bin
          if (fullReceipt) {
            await moveToRecycleBin(fullReceipt, 'RECEIPT');
          }
          
          // Delete the receipt
          await receiptsApi.delete(receipt.id);
          loadReceipts();
          Swal.fire('Deleted!', 'Receipt has been deleted and bill allocations reversed.', 'success');
        } catch (e) {
          console.error(e);
          Swal.fire('Error', 'Failed to delete receipt: ' + e.message, 'error');
        }
      }
    });
  };

  const handleEdit = (receipt) => {
    navigate(`/reports/receipt/edit/${receipt.id}`);
  };

  const filteredReceipts = receipts.filter(r => 
    r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.voucherNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-end">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">All Receipts</h1>
            <p className="text-slate-500 text-sm">View, edit or delete all recorded receipts.</p>
          </div>
        </div>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search customer or voucher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-500"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Date</th>
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Vch No</th>
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Customer Name</th>
                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Narration</th>
                <th className="p-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">Amount (₹)</th>
                <th className="p-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.length > 0 ? (
                filteredReceipts.map((receipt) => (
                  <tr 
                    key={receipt.id} 
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1E1E2D]/50 transition-colors cursor-pointer"
                    onDoubleClick={() => handleEdit(receipt)}
                  >
                    <td className="p-3 text-sm text-slate-700 dark:text-slate-300">{new Date(receipt.date).toLocaleDateString('en-GB')}</td>
                    <td className="p-3 text-sm text-slate-700 dark:text-slate-300">{receipt.voucherNo}</td>
                    <td className="p-3 text-sm font-medium text-slate-900 dark:text-white uppercase">{receipt.customerName}</td>
                    <td className="p-3 text-xs text-slate-500 dark:text-slate-400 italic">
                        {receipt.narrationSno || receipt.narrationPg || receipt.narrationDate ? 
                            `sno ${receipt.narrationSno} pg ${receipt.narrationPg} dt ${receipt.narrationDate}` : '-'
                        }
                    </td>
                    <td className="p-3 text-sm text-right font-semibold text-green-600 dark:text-green-400">{parseFloat(receipt.amount).toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedReceipt(receipt); }}
                          className="text-emerald-500 hover:text-emerald-700 transition-colors"
                          title="View Receipt"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(receipt); }}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Edit Receipt"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(receipt); }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Receipt"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No receipts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* View Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-200 dark:bg-[#151521] w-full max-w-5xl max-h-[90vh] rounded-lg shadow-xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1a1a2e]">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">View Receipt - {selectedReceipt.voucherNo}</h2>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded font-medium flex items-center gap-2 transition-colors border-none cursor-pointer">
                  <Printer size={16} /> Print
                </button>
                <button onClick={() => setSelectedReceipt(null)} className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-4 py-1.5 rounded font-medium flex items-center gap-2 transition-colors border-none cursor-pointer">
                  <X size={16} /> Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-300 dark:bg-slate-800 flex justify-center">
              <div className="bg-white shadow-xl">
                 <PrintReceipt ref={printRef} receiptData={selectedReceipt} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
