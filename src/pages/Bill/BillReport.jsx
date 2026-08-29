import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Printer, FileText, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { billsApi, clientsApi } from '../../services/api';

// The hidden print component for the label
const PrintLabel = React.forwardRef(({ bill, labelData }, ref) => {
  if (!bill) return null;

  const { transport, destination, bundles, isLocalTransport } = labelData;
  
  // Format the TO address based on client details directly from customer object
  // 'school' field acts as the Print Name
  const printName = bill.customer?.school || '';
  const toAddress1 = bill.customer?.address1 || '';
  const toTown = bill.customer?.town || '';
  const toDistrict = bill.customer?.district || '';
  const toMobile = bill.customer?.mobileNo || bill.customer?.mobile || '';

  return (
    <div className="flex justify-center bg-transparent print-wrapper">
      <div ref={ref} className="bg-white text-black" style={{ fontFamily: 'Arial, sans-serif', width: '210mm', height: '148mm', boxSizing: 'border-box', position: 'relative' }}>
        <style type="text/css" media="print">
          {`
            @page { size: A4 portrait; margin: 0; }
            body { -webkit-print-color-adjust: exact; color-adjust: exact; margin: 0; }
            .handwritten-text { font-family: "Comic Sans MS", "Chalkboard SE", sans-serif; color: #1e3a8a; border-bottom: 1.5px dashed #64748b; display: inline-block; text-transform: uppercase; padding-bottom: 2px; }
          `}
        </style>

        {/* Content wrapper with padding to simulate margins, keeping strictly within 148mm height */}
        <div className="p-2 h-full flex flex-col justify-between">
          
          <div className="border-[3px] border-[#1e3a8a] rounded-2xl h-full flex flex-col p-3 bg-white relative overflow-hidden">
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
              <img src="/DP-logo.png" alt="" className="w-[350px]" />
            </div>

            {/* Top Section */}
            <div className="flex justify-between items-stretch flex-1 gap-6 mb-4 relative z-10">
              
              {/* Left Side: Transport Details */}
              <div className="w-[48%] space-y-5 flex flex-col">
                <div className="bg-[#1e3a8a] text-white px-4 py-2 rounded-xl shadow-sm w-fit mb-2 flex items-center">
                  <span className="font-semibold text-blue-200 text-lg mr-2">BILL NO :</span> 
                  <span className="text-2xl font-black">{bill.billInfo?.billNo}</span>
                </div>

                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 flex-1 flex flex-col justify-center space-y-5 shadow-sm">
                  <div className="flex items-end gap-3 border-b border-slate-200 pb-2">
                    <span className="w-36 text-slate-500 font-bold text-lg uppercase tracking-wider">Transport</span>
                    <span className="handwritten-text flex-1 text-[26px] font-bold text-[#1e3a8a]">{transport}</span>
                  </div>
                  <div className="flex items-end gap-3 border-b border-slate-200 pb-2">
                    <span className="w-36 text-slate-500 font-bold text-lg uppercase tracking-wider">Destination</span>
                    <span className="handwritten-text flex-1 text-[26px] font-bold text-[#1e3a8a]">{destination}</span>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="w-36 text-slate-500 font-bold text-lg uppercase tracking-wider">Bundles</span>
                    <span className="handwritten-text flex-1 text-[32px] font-black text-[#1e3a8a] text-center">{bundles}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: TO Address */}
              <div className="w-[52%] bg-blue-50/50 border border-blue-200 rounded-xl p-5 pl-6 relative shadow-sm flex flex-col">
                <div className="flex justify-start mb-1">
                  <div className="bg-[#1e3a8a] text-white px-4 py-1 rounded-md font-bold tracking-widest uppercase text-sm shadow-sm">
                    DELIVERY ADDRESS
                  </div>
                </div>
                <div className="space-y-1.5 text-gray-800 font-bold text-xl leading-snug pt-3 flex-1 flex flex-col">
                  {printName && (
                    <p className="text-[28px] font-black text-[#1e3a8a] mb-2 uppercase tracking-wider leading-tight">
                      {isLocalTransport ? (labelData.tamilSchool || printName) : printName}
                    </p>
                  )}
                  {toAddress1 && <p className="text-[20px] text-gray-700 mt-1">{isLocalTransport ? (labelData.tamilAddress1 || toAddress1) : toAddress1}</p>}
                  {toTown && <p className="text-[20px] text-gray-700">{isLocalTransport ? (labelData.tamilTown || toTown) : toTown}</p>}
                  {toDistrict && <p className="text-[20px] text-gray-700">{isLocalTransport ? (labelData.tamilDistrict || toDistrict) : toDistrict} {isLocalTransport ? 'மாவட்டம்' : 'District'}</p>}
                  
                  <div className="mt-auto pt-3 flex gap-2 text-[22px] font-black border-t-2 border-blue-200 border-dashed">
                    <span className="text-[#1e3a8a]">{isLocalTransport ? 'செல் :' : 'Mobile :'}</span> 
                    <span>{toMobile}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: FROM Address */}
            <div className="bg-slate-50 rounded-xl p-2 px-4 border border-slate-200 shadow-sm flex items-center justify-between relative z-10 flex-shrink-0">
              <div className="w-[28%] flex flex-col justify-center border-r-2 border-slate-200 pr-4 items-center relative overflow-hidden rounded-l-xl">
                <div className="absolute top-0 left-0 bg-[#1e3a8a] text-white px-4 py-1 rounded-br-lg font-bold tracking-widest uppercase text-xs shadow-sm z-20">
                  FROM
                </div>
                <img src="/DP-logo.png" alt="Dolphin Publications" className="w-full max-w-[180px] object-contain drop-shadow-md mt-3" />
              </div>
              
              <div className="w-[72%] flex flex-col items-center text-center pl-4 justify-center py-1">
                <h2 className="text-[26px] font-black text-[#1e3a8a] mb-1 tracking-wider uppercase">
                  DOLPHIN PUBLICATIONS
                </h2>
                <p className="font-bold text-gray-800 text-[14px] leading-tight">239, Keelapatti Street, Srivilliputtur - 626 125. Virudhunagar District</p>
                <p className="font-bold text-gray-800 text-[14px] leading-tight">Tamil Nadu (Code : 33) &nbsp;|&nbsp; GSTIN : 33CAEPK4827P1ZC</p>
                <div className="w-full h-px bg-slate-300 my-1.5"></div>
                <p className="font-bold text-gray-900 text-[14.5px]">Mobile : 98653-06197, 89256-77710</p>
                <p className="font-bold text-[#1e3a8a] text-[13.5px] mt-0.5">E-Mail : dolphin.pub2005@gmail.com &nbsp;&nbsp;|&nbsp;&nbsp; Website : www.kalvidolphin.com</p>
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
              bundles: b.bundles,
              isEbill: Boolean(b.is_ebill),
              irn: b.irn || '',
              ackNo: b.ack_no || '',
              ackDate: b.ack_date || '',
              qrCode: b.qr_code || '',
              eWayBillNo: b.eway_bill_no || ''
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
              qty: b.items ? b.items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0) : 0,
              grossAmount: b.gross_amount,
              netAmount: b.net_amount,
              amount: b.net_amount
            },
            billSettings: {
              discountPercent: b.discount_percent,
              discountAmount: b.discount_amount,
              freight: b.freight,
              roundOff: b.round_off
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

  const translateToTamil = async (text) => {
    if (!text) return '';
    
    // First try Gemini API if key exists
    const geminiKey = localStorage.getItem('geminiApiKey');
    if (geminiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Translate the following English text to Tamil. Output ONLY the translated Tamil text. Do not add any explanation or quotes. Text: ${text}` }] }]
          })
        });
        const data = await response.json();
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
          return data.candidates[0].content.parts[0].text.trim();
        }
      } catch (err) {
        console.error("Gemini translation error:", err);
      }
    }

    // Fallback to Google Translate API
    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      if (data && data[0]) {
        return data[0].map(item => item[0]).join('');
      }
    } catch (err) {
      console.error("Translation error:", err);
    }
    return text; // Fallback to original word
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

      {/* Label Details and Preview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-[#151521]">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Printer size={18} className="text-blue-500" />
                Shipping Label Preview
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handlePrintAction(); }}
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors flex items-center gap-2 cursor-pointer border-none"
                >
                  <Printer size={16} />
                  Print Label
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors border-none cursor-pointer flex items-center gap-2"
                >
                  <X size={16} /> Close
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
              {/* Form Section */}
              <div className="w-full md:w-1/3 p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm border border-blue-100 dark:border-blue-800/50">
                  Enter the transport details to be printed on the shipping label for Bill No: <strong>{selectedBill?.billInfo?.billNo}</strong>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handlePrintAction(); }} className="space-y-4 mt-6">
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
                  <button type="submit" className="hidden"></button>
                </form>
              </div>

              {/* Preview Section */}
              <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-slate-300 dark:bg-slate-800 flex justify-center items-start">
                <div className="shadow-2xl border border-slate-200" style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                  <PrintLabel ref={printRef} bill={selectedBill} labelData={labelData} />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
