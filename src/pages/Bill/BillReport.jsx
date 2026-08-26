import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Printer, FileText, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { billsApi, clientsApi } from '../../services/api';

// The hidden print component for the label
const PrintLabel = React.forwardRef(({ bill, labelData }, ref) => {
  if (!bill) return null;

  const { transport, destination, bundles, isLocalTransport } = labelData;
  const clientName = bill.customer?.printName || bill.customer?.ledgerName || bill.customer?.name || '';
  
  // Format the TO address based on client details directly from customer object
  const toSchool = bill.customer?.school || '';
  const toAddress1 = bill.customer?.address1 || '';
  const toTown = bill.customer?.town || '';
  const toDistrict = bill.customer?.district || '';
  const toMobile = bill.customer?.mobileNo || bill.customer?.mobile || '';

  return (
    <div className="hidden print:block">
      <div ref={ref} className="bg-white text-black" style={{ fontFamily: 'Arial, sans-serif', width: '210mm', height: '148mm', boxSizing: 'border-box', position: 'relative' }}>
        <style type="text/css" media="print">
          {`
            @page { size: A4 portrait; margin: 0; }
            body { -webkit-print-color-adjust: exact; color-adjust: exact; margin: 0; }
            .handwritten-text { font-family: "Comic Sans MS", "Chalkboard SE", sans-serif; color: #1e3a8a; border-bottom: 1.5px dashed #64748b; display: inline-block; text-transform: uppercase; padding-bottom: 2px; }
          `}
        </style>

        {/* Content wrapper with padding to simulate margins, keeping strictly within 148mm height */}
        <div className="p-8 h-full flex flex-col justify-between">
          
          {/* Top Section */}
          <div className="flex justify-between items-start">
            
            {/* Left Side: Transport Details */}
            <div className="w-[45%] space-y-5">
              <div className="text-xl font-bold tracking-wide text-gray-800 border-b border-gray-300 pb-2 mb-4">
                <span className="mr-3 text-blue-900">BILL NO :</span> {bill.billInfo?.billNo}
              </div>
              <div className="flex items-end gap-3 text-gray-800 font-semibold text-lg">
                <span className="w-24 text-blue-900">Transport</span>
                <span className="handwritten-text flex-1">{transport}</span>
              </div>
              <div className="flex items-end gap-3 text-gray-800 font-semibold text-lg">
                <span className="w-24 text-blue-900">Des</span>
                <span className="handwritten-text flex-1">{destination}</span>
              </div>
              <div className="flex items-end gap-3 text-gray-800 font-semibold text-lg">
                <span className="w-24 text-blue-900">NO. of B</span>
                <span className="handwritten-text flex-1">{bundles}</span>
              </div>
            </div>

            {/* Right Side: TO Address */}
            <div className="w-[50%] pl-6 border-l-2 border-gray-200">
              <div className="space-y-1 uppercase tracking-wider text-gray-800 font-bold text-base leading-snug">
                <p className="text-xl font-black text-blue-900 mb-2 border-b border-gray-300 inline-block pb-1">
                  TO :
                </p>
                <p className="text-lg">{isLocalTransport ? (labelData.tamilName || clientName) : clientName}</p>
                {toSchool && <p>{isLocalTransport ? (labelData.tamilSchool || toSchool) : toSchool}</p>}
                {toAddress1 && <p>{isLocalTransport ? (labelData.tamilAddress1 || toAddress1) : toAddress1}</p>}
                {toTown && <p>{isLocalTransport ? (labelData.tamilTown || toTown) : toTown}</p>}
                {toDistrict && <p>{isLocalTransport ? (labelData.tamilDistrict || toDistrict) : toDistrict} {isLocalTransport ? 'மாவட்டம்' : 'District'}</p>}
                
                <p className="pt-2 flex gap-2 text-lg">
                  <span className="text-blue-900">{isLocalTransport ? 'செல் :' : 'Mobile No :'}</span> 
                  <span>{toMobile}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section: FROM Address */}
          <div className="mt-auto pt-4 border-t-2 border-gray-800">
            <div className="space-y-0.5 uppercase tracking-wider text-gray-800 font-bold text-sm leading-tight flex justify-between items-end">
              <div>
                <p className="text-base font-black text-blue-900 mb-1">
                  FROM :
                </p>
                {isLocalTransport ? (
                  <>
                    <p className="text-xl font-black text-blue-950 mb-1">டால்பின் பப்ளிகேஷன்ஸ்</p>
                    <p>239, கீழப்பட்டி தெரு, ஸ்ரீவில்லிபுத்தூர் - 626 125.</p>
                    <p>விருதுநகர் மாவட்டம்</p>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-black text-blue-950 mb-1">DOLPHIN PUBLICATIONS</p>
                    <p>239, Keelapatti Street, Srivilliputtur - 626 125.</p>
                    <p>Virudhunagar District</p>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="text-blue-900 mb-1 font-black">
                  {isLocalTransport ? 'அலைபேசி :' : 'Mobile :'}
                </p>
                <p className="text-base">98653-06197</p>
                <p className="text-base">89256-77710</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

// Main Page Component
export default function BillReport() {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [labelData, setLabelData] = useState({
    transport: '',
    destination: '',
    bundles: '',
    isLocalTransport: false,
    tamilName: '',
    tamilSchool: '',
    tamilAddress1: '',
    tamilTown: '',
    tamilDistrict: ''
  });

  const printRef = useRef();

  useEffect(() => {
    const loadBills = async () => {
      try {
        const [billsData, clientsData] = await Promise.all([
          billsApi.getAll(),
          clientsApi.getAll()
        ]);
        
        const joinedBills = billsData.map(b => {
          const customer = clientsData.find(c => c.id === b.customer_id);
          return {
            id: b.id,
            billInfo: {
              billNo: b.bill_no,
              date: b.date,
              transport: b.transport,
              destination: b.destination,
              lrNo: b.lr_no,
              lrDate: b.lr_date,
              bundles: b.bundles
            },
            customer: {
              id: customer?.id,
              name: customer?.name || '',
              school: customer?.school || '',
              mobile: customer?.mobile || '',
              address1: customer?.address1 || '',
              town: customer?.town || '',
              district: customer?.district || ''
            },
            items: b.items,
            totals: {
              grossAmount: b.gross_amount,
              netAmount: b.net_amount,
              amount: b.net_amount
            }
          };
        });
        
        // Sort by descending id (newest first)
        joinedBills.sort((a, b) => b.id - a.id);
        setBills(joinedBills);
      } catch (e) {
        console.error(e);
      }
    };
    
    loadBills();
  }, []);

  const tamilDictionary = {
    "north": "வடக்கு",
    "south": "தெற்கு",
    "east": "கிழக்கு",
    "west": "மேற்கு",
    "street": "தெரு",
    "st": "தெரு",
    "road": "சாலை",
    "nagar": "நகர்",
    "colony": "காலனி",
    "district": "மாவட்டம்",
    "dt": "மாவட்டம்",
    "tk": "தாலுகா",
    "taluk": "தாலுகா"
  };

  // Function to transliterate text to Tamil using Google Input Tools API
  const translateToTamil = async (text) => {
    if (!text) return '';
    const words = text.split(' ');
    const translatedWords = await Promise.all(words.map(async (word) => {
      // Don't translate words that contain digits (like 2/86, 12A)
      if (/\d/.test(word)) return word;
      
      // Check dictionary for common words
      const lowerWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (tamilDictionary[lowerWord]) {
        return tamilDictionary[lowerWord];
      }
      
      try {
        const response = await fetch(`https://inputtools.google.com/request?text=${word}&itc=ta-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`);
        const data = await response.json();
        if (data[0] === 'SUCCESS' && data[1][0][1][0]) {
          return data[1][0][1][0]; // First suggested Tamil transliteration
        }
      } catch (err) {
        console.error("Translation error:", err);
      }
      return word; // Fallback to original word
    }));
    return translatedWords.join(' ');
  };

  const handleLocalTransportToggle = async (e) => {
    const checked = e.target.checked;
    setLabelData(prev => ({ ...prev, isLocalTransport: checked }));

    if (checked && selectedBill) {
      // Translate address fields
      const clientName = selectedBill.customer?.printName || selectedBill.customer?.ledgerName || selectedBill.customer?.name || '';
      const toSchool = selectedBill.customer?.school || '';
      const toAddress1 = selectedBill.customer?.address1 || '';
      const toTown = selectedBill.customer?.town || '';
      const toDistrict = selectedBill.customer?.district || '';

      const [tName, tSchool, tAddress1, tTown, tDistrict] = await Promise.all([
        translateToTamil(clientName),
        translateToTamil(toSchool),
        translateToTamil(toAddress1),
        translateToTamil(toTown),
        translateToTamil(toDistrict)
      ]);

      setLabelData(prev => ({
        ...prev,
        tamilName: tName,
        tamilSchool: tSchool,
        tamilAddress1: tAddress1,
        tamilTown: tTown,
        tamilDistrict: tDistrict
      }));
    }
  };

  const handlePrintAction = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Label_${selectedBill?.billInfo?.billNo || 'Print'}`,
    onAfterPrint: () => {
      setIsModalOpen(false);
      setSelectedBill(null);
      setLabelData({ transport: '', destination: '', bundles: '', isLocalTransport: false });
    }
  });

  const openPrintModal = (bill) => {
    setSelectedBill(bill);
    // Auto-fill from bill details
    const dest = bill.billInfo?.destination || bill.customer?.town || bill.customer?.district || '';
    const trans = bill.billInfo?.transport || '';
    const bndls = bill.billInfo?.bundles || '';
    
    setLabelData({
      transport: trans,
      destination: dest,
      bundles: bndls,
      isLocalTransport: false
    });
    setIsModalOpen(true);
  };

  const handlePrintSubmit = (e) => {
    e.preventDefault();
    if (selectedBill) {
      handlePrintAction();
    }
  };

  const filteredBills = useMemo(() => {
    if (!searchTerm) return bills;
    const lower = searchTerm.toLowerCase();
    return bills.filter(b => 
      b.billInfo?.billNo?.toLowerCase().includes(lower) || 
      b.customer?.name?.toLowerCase().includes(lower) ||
      b.customer?.mobile?.includes(lower)
    );
  }, [bills, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase">Bill Print / Report</h1>
            <p className="text-slate-500 text-sm">View all generated bills and print shipping labels.</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm mb-6 p-4">
        <div className="flex-1 max-w-md relative">
          <div className="relative">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Bill No, Name, Mobile..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#1E1E2D] text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none uppercase"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Bill No</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Customer Name</th>
                <th className="px-6 py-4 font-semibold">Mobile</th>
                <th className="px-6 py-4 font-semibold text-right">Bill Amt (₹)</th>
                <th className="px-6 py-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#1a1a2e] transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{bill.billInfo?.billNo}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {bill.billInfo?.date ? bill.billInfo.date.split('-').reverse().join('-') : ''}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-300">
                      {bill.customer?.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {bill.customer?.mobile || '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-blue-600 dark:text-blue-400">
                      {parseFloat(bill.totals?.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openPrintModal(bill)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md font-medium text-xs transition-colors border-none cursor-pointer"
                      >
                        <Printer size={14} />
                        Print Label
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No bills found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden Print Content */}
      <div className="hidden">
        <PrintLabel ref={printRef} bill={selectedBill} labelData={labelData} />
      </div>

      {/* Label Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-[#151521]">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Printer size={18} className="text-blue-500" />
                Shipping Label Details
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-transparent border-none cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm border border-blue-100 dark:border-blue-800/50">
                Enter the transport details to be printed on the shipping label for Bill No: <strong>{selectedBill?.billInfo?.billNo}</strong>
              </div>

              <form onSubmit={handlePrintSubmit} className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Transport
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g., Local Transport"
                    className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase"
                    value={labelData.transport}
                    onChange={e => setLabelData({...labelData, transport: e.target.value.toUpperCase()})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Destination (Des)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Salem"
                    className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase"
                    value={labelData.destination}
                    onChange={e => setLabelData({...labelData, destination: e.target.value.toUpperCase()})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    No. of Bundles
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g., 5"
                    className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-[#151521] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={labelData.bundles}
                    onChange={e => setLabelData({...labelData, bundles: e.target.value})}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="localTransport"
                    checked={labelData.isLocalTransport}
                    onChange={handleLocalTransportToggle}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="localTransport" className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide cursor-pointer">
                    Local Transport (Tamil Labels)
                  </label>
                  {labelData.isLocalTransport && !labelData.tamilName && (
                    <span className="text-xs text-slate-500 animate-pulse ml-2">Translating...</span>
                  )}
                </div>

                <div className="pt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors bg-transparent border border-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors flex items-center gap-2 cursor-pointer border-none"
                  >
                    <Printer size={16} />
                    Confirm & Print
                  </button>
                </div>
              </form>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
