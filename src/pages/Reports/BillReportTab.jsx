import React, { useState, useRef, useEffect } from 'react';
import { FileText, Printer, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PrintInvoice from '../Bill/PrintInvoice';

export default function BillReportTab() {
  const [fromBill, setFromBill] = useState('');
  const [toBill, setToBill] = useState('');
  const [filteredBills, setFilteredBills] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isViewing, setIsViewing] = useState(false);
  
  const printRef = useRef();

  useEffect(() => {
    if (!isViewing) return;
    
    // Keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => {
          const next = prev < filteredBills.length - 1 ? prev + 1 : prev;
          document.getElementById(`bill-view-${next}`)?.scrollIntoView({ behavior: 'smooth' });
          return next;
        });
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => {
          const next = prev > 0 ? prev - 1 : prev;
          document.getElementById(`bill-view-${next}`)?.scrollIntoView({ behavior: 'smooth' });
          return next;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Intersection Observer for scrolling (Ctrl+F or manual scroll)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute('data-index'), 10);
            setCurrentIndex(idx);
          }
        });
      },
      { threshold: 0.5 }
    );
    
    filteredBills.forEach((_, idx) => {
      const el = document.getElementById(`bill-view-${idx}`);
      if (el) observer.observe(el);
    });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, [isViewing, filteredBills]);

  const handleShowReport = () => {
    if (!fromBill || !toBill) return;
    
    const allBills = JSON.parse(localStorage.getItem('bills') || '[]');
    
    const fromNum = parseInt(fromBill, 10);
    const toNum = parseInt(toBill, 10);
    
    const filtered = allBills.filter(bill => {
      const billNoStr = bill.billInfo?.billNo || '';
      const billNum = parseInt(billNoStr.replace(/\D/g, ''), 10);
      if (isNaN(billNum)) return false;
      return billNum >= fromNum && billNum <= toNum;
    });

    // Sort ascending by bill number
    filtered.sort((a, b) => {
      const aNum = parseInt((a.billInfo?.billNo || '').replace(/\D/g, ''), 10) || 0;
      const bNum = parseInt((b.billInfo?.billNo || '').replace(/\D/g, ''), 10) || 0;
      return aNum - bNum;
    });

    setFilteredBills(filtered);
    
    if (filtered.length > 0) {
      setCurrentIndex(0);
      setIsViewing(true);
    } else {
      alert("No bills found in this range.");
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${filteredBills[currentIndex]?.billInfo?.billNo || 'Print'}`,
  });

  const handleNext = () => {
    if (currentIndex < filteredBills.length - 1) {
      const nextIdx = currentIndex + 1;
      document.getElementById(`bill-view-${nextIdx}`)?.scrollIntoView({ behavior: 'smooth' });
      setCurrentIndex(nextIdx);
    }
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      document.getElementById(`bill-view-${prevIdx}`)?.scrollIntoView({ behavior: 'smooth' });
      setCurrentIndex(prevIdx);
    }
  };

  if (isViewing) {
    const currentBill = filteredBills[currentIndex];
    return (
      <div className="fixed inset-0 z-[100] bg-slate-200 dark:bg-[#0E0D3A] flex flex-col">
        {/* Toolbar */}
        <div className="bg-white dark:bg-[#151521] border-b border-slate-300 dark:border-slate-800 p-4 flex justify-between items-center shrink-0 shadow-md">
          <button 
            onClick={() => setIsViewing(false)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Filter
          </button>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md disabled:opacity-50 transition-colors border-none cursor-pointer text-slate-700 dark:text-slate-300"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Bill {currentIndex + 1} of {filteredBills.length}
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs">
                {currentBill?.billInfo?.billNo}
              </span>
            </span>
            <button 
              onClick={handleNext}
              disabled={currentIndex === filteredBills.length - 1}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md disabled:opacity-50 transition-colors border-none cursor-pointer text-slate-700 dark:text-slate-300"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center gap-2 transition-colors shadow-sm border-none cursor-pointer"
          >
            <Printer size={18} />
            Print Invoice
          </button>
        </div>
        
        {/* Viewer */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col items-center gap-12 scroll-smooth">
          {filteredBills.map((bill, index) => (
            <div 
              key={index} 
              id={`bill-view-${index}`} 
              data-index={index}
              className="shadow-2xl bg-white shrink-0 transition-transform duration-300" 
              style={{ width: '215.9mm', minHeight: '355mm' }}
            >
              <PrintInvoice billData={bill} />
            </div>
          ))}
        </div>
        
        {/* Hidden Print Container */}
        <div className="hidden">
          <PrintInvoice ref={printRef} billData={currentBill} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Bill Report Viewer</h1>
            <p className="text-slate-500 text-sm">Select a range of bills to view and print sequentially.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm mb-6 p-6">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">From Bill No</label>
            <input 
              type="number"
              value={fromBill}
              onChange={(e) => setFromBill(e.target.value)}
              placeholder="e.g. 1"
              className="w-48 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-base focus:border-blue-500 outline-none uppercase"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">To Bill No</label>
            <input 
              type="number"
              value={toBill}
              onChange={(e) => setToBill(e.target.value)}
              placeholder="e.g. 100"
              className="w-48 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-base focus:border-blue-500 outline-none uppercase"
            />
          </div>

          <button 
            onClick={handleShowReport}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold text-base transition-colors shadow-sm border-none cursor-pointer"
          >
            Show Report
          </button>
        </div>
      </div>
    </div>
  );
}
