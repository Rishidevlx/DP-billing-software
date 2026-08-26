import React, { forwardRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const VibrantTemplate = forwardRef(({ billData }, ref) => {
  if (!billData) return null;
  const { customer, billInfo, items, totals } = billData;
  const digitalSignature = localStorage.getItem('digitalSignature');
  const creatorName = billData?.billInfo?.created_by || JSON.parse(localStorage.getItem('currentUser') || '{}').name || 'Admin';
  const formattedTime = billData?.billInfo?.created_at 
    ? new Date(billData.billInfo.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const numberToWords = (num) => {
    if (!num) return "ZERO";
    const a = ['', 'ONE ', 'TWO ', 'THREE ', 'FOUR ', 'FIVE ', 'SIX ', 'SEVEN ', 'EIGHT ', 'NINE ', 'TEN ', 'ELEVEN ', 'TWELVE ', 'THIRTEEN ', 'FOURTEEN ', 'FIFTEEN ', 'SIXTEEN ', 'SEVENTEEN ', 'EIGHTEEN ', 'NINETEEN '];
    const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    const inWords = (n) => {
      if ((n = n.toString()).length > 9) return 'overflow';
      let nString = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!nString) return '';
      let str = '';
      str += (nString[1] != 0) ? (a[Number(nString[1])] || b[nString[1][0]] + ' ' + a[nString[1][1]]) + 'CRORE ' : '';
      str += (nString[2] != 0) ? (a[Number(nString[2])] || b[nString[2][0]] + ' ' + a[nString[2][1]]) + 'LAKH ' : '';
      str += (nString[3] != 0) ? (a[Number(nString[3])] || b[nString[3][0]] + ' ' + a[nString[3][1]]) + 'THOUSAND ' : '';
      str += (nString[4] != 0) ? (a[Number(nString[4])] || b[nString[4][0]] + ' ' + a[nString[4][1]]) + 'HUNDRED ' : '';
      str += (nString[5] != 0) ? ((str != '') ? 'AND ' : '') + (a[Number(nString[5])] || b[nString[5][0]] + ' ' + a[nString[5][1]]) : '';
      return str;
    };
    return inWords(num) + 'ONLY';
  };

  const padItems = (itemsArray, minLength) => {
    const arr = itemsArray || [];
    if (arr.length >= minLength) return arr;
    const padding = new Array(minLength - arr.length).fill({
      id: '', itemDetails: '', rate: '', qty: '', amount: ''
    });
    return [...arr, ...padding];
  };
  const paddedItems = padItems(items, 15);

  return (
    <div className="bg-white p-4 print-container" ref={ref}>
      <div className="w-[210mm] min-h-[297mm] mx-auto bg-white print-page relative">
        
        <div className="flex flex-col h-[230mm] font-sans text-slate-800">
          {/* Header - Bold Geometric Split */}
          <div className="bg-gradient-to-br from-red-600 via-rose-500 to-orange-500 h-[180px] p-8 text-white flex justify-between items-start rounded-t-2xl relative overflow-hidden">
             {/* Geometric decorative elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/4"></div>
             <div className="absolute bottom-0 left-10 w-32 h-32 bg-orange-300 opacity-20 rounded-full translate-y-1/2"></div>
             
             <div className="relative z-10">
                <h1 className="text-4xl font-black uppercase tracking-tight mb-1">Invoice</h1>
                <p className="text-rose-100 font-medium">Original for Recipient</p>
             </div>
             <div className="relative z-10 text-right">
                <h2 className="text-2xl font-bold mb-1 tracking-wide">DOLPHIN PUBLICATIONS</h2>
                <p className="text-sm text-rose-50">GSTIN: 33CAEPK4827P1ZC</p>
                <p className="text-sm text-rose-50">Srivilliputtur - 626 125</p>
             </div>
          </div>

          {/* Floating Info Cards */}
          <div className="px-8 flex gap-6 -mt-12 relative z-20 mb-8">
             <div className="flex-1 bg-white p-5 rounded-xl shadow-lg border border-slate-100 border-t-4 border-t-rose-500">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</p>
                <p className="font-bold text-slate-800 text-lg">{customer?.name || "Customer Name"}</p>
                <p className="text-sm text-slate-600">{customer?.town} - {customer?.district}</p>
                {customer?.mobile && <p className="text-sm text-slate-600 mt-1">Mob: {customer.mobile}</p>}
             </div>
             <div className="w-[220px] shrink-0 bg-white p-5 rounded-xl shadow-lg border border-slate-100 border-t-4 border-t-orange-400 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-2">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice No</p>
                   <p className="font-bold text-rose-600 text-lg">#{billInfo?.billNo}</p>
                </div>
                <div className="flex justify-between items-center">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</p>
                   <p className="font-medium text-slate-700 text-sm">{billInfo?.date}</p>
                </div>
             </div>
          </div>

          {/* Table */}
          <div className="px-8 flex-1">
            <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-rose-500 to-orange-400 text-white text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 text-center w-12 font-medium">SL</th>
                    <th className="py-3 px-4 text-left font-medium">Item Description</th>
                    <th className="py-3 px-4 text-right w-24 font-medium">Qty</th>
                    <th className="py-3 px-4 text-right w-28 font-medium">Price</th>
                    <th className="py-3 px-4 text-right w-32 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paddedItems.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-rose-50/30"}>
                      <td className="py-2 px-4 text-center text-slate-400 text-xs font-medium">{idx + 1}</td>
                      <td className="py-2 px-4 text-slate-700 font-medium">{item?.itemDetails || ""}</td>
                      <td className="py-2 px-4 text-right text-slate-600">{item?.qty || ""}</td>
                      <td className="py-2 px-4 text-right text-slate-600">{item?.rate || ""}</td>
                      <td className="py-2 px-4 text-right font-bold text-slate-800">{item?.amount ? Number(item.amount).toFixed(2) : ""}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 border-t border-rose-200">
                    <td colSpan="4" className="py-4 px-4 text-right font-bold text-slate-600 uppercase tracking-wider text-xs">Total Amount</td>
                    <td className="py-4 px-4 text-right font-black text-rose-600 text-lg">{Number(totals?.netAmount || 0).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Info */}
          <div className="px-8 mt-4 pb-4 flex justify-between items-end">
            <div>
              <p className="text-xs text-rose-400 font-bold mb-1 uppercase tracking-wider">Note:</p>
              <p className="text-xs font-semibold text-slate-600 uppercase w-[300px] leading-relaxed border-b border-slate-200 pb-1">{numberToWords(Math.round(totals?.netAmount || 0))}</p>
            </div>
            <div className="flex flex-col items-center relative">
              {digitalSignature && <img src={digitalSignature} alt="Sig" className="absolute bottom-5 max-h-[60px] object-contain opacity-90" />}
              <span className="font-bold text-xs uppercase tracking-wider mt-6 text-slate-700 border-t-2 border-rose-200 pt-2 px-4">Authorised Signature</span>
            </div>
          </div>
          <div className="text-left text-[10px] text-gray-400 mt-2 italic px-8">
            Prepared By: {creatorName} | Date & Time: {formattedTime}
          </div>
        </div>

        {/* CUT LINE */}
        <div className="relative flex items-center justify-center opacity-40 my-2">
          <div className="absolute w-full border-t-2 border-dashed border-rose-300"></div>
          <span className="bg-white px-2 text-rose-500 text-xl relative z-10" style={{ transform: 'rotate(180deg)' }}>✂️</span>
        </div>

        {/* TEAR-OFF SLIP */}
        <div className="h-[53mm] mx-4 mb-4 rounded-xl flex font-sans overflow-hidden shadow-lg border border-slate-100">
          <div className="w-[30%] bg-gradient-to-b from-rose-500 to-red-600 text-white p-4 flex flex-col justify-between relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
             <div>
                <p className="text-xs font-bold uppercase tracking-widest text-rose-200 mb-1">Get in Touch</p>
                <h3 className="font-bold text-lg leading-tight mb-1">{customer?.name}</h3>
                <p className="text-xs text-rose-100">{customer?.town} - {customer?.district}</p>
             </div>
             {billInfo?.isEbill && billInfo?.qrCode && (
                <div className="bg-white p-1 rounded-lg w-max"><QRCodeCanvas value={billInfo.qrCode} size={50} level={"M"} /></div>
             )}
          </div>
          <div className="w-[70%] bg-white p-4 flex flex-col justify-between">
             <div className="flex justify-between items-start mb-2">
                <p className="font-black text-rose-600 text-lg uppercase">Invoice #{billInfo?.billNo}</p>
                <p className="text-sm font-bold text-slate-400">{billInfo?.date}</p>
             </div>
             <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p><span className="text-slate-400 font-medium block text-xs uppercase">Transport</span> <span className="font-bold text-slate-700">{billInfo?.transport}</span></p>
                <p><span className="text-slate-400 font-medium block text-xs uppercase">Destination</span> <span className="font-bold text-slate-700">{billInfo?.destination}</span></p>
                <p><span className="text-slate-400 font-medium block text-xs uppercase">LR No</span> <span className="font-bold text-slate-700">{billInfo?.lrNo}</span></p>
                <p><span className="text-slate-400 font-medium block text-xs uppercase">Bundles</span> <span className="font-bold text-slate-700">{billInfo?.bundles}</span></p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default VibrantTemplate;
