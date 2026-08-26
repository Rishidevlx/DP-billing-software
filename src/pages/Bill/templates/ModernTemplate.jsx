import React, { forwardRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const ModernTemplate = forwardRef(({ billData }, ref) => {
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
          {/* Header - Sidebar Style */}
          <div className="flex border-b border-blue-200 mb-6">
            <div className="w-1/3 bg-slate-50 p-6 flex flex-col justify-center border-r border-blue-200">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">TAX INVOICE</h1>
              <p className="text-sm font-medium text-slate-500 uppercase">Original for Recipient</p>
            </div>
            <div className="w-2/3 p-6 flex justify-between items-center bg-white">
              <div className="text-sm">
                <h2 className="text-xl font-bold text-slate-900">DOLPHIN PUBLICATIONS</h2>
                <p className="text-slate-600 mt-1">39, West Madavilagam,</p>
                <p className="text-slate-600">Srivilliputtur - 626 125</p>
                <p className="text-slate-600 mt-2 font-medium">GSTIN: 33CAEPK4827P1ZC</p>
              </div>
              <div className="text-right">
                 <img src="/DP-logo.png" alt="Logo" className="w-[100px] h-auto object-contain mb-2" />
                 <p className="text-xs text-slate-500">Mob: 98653-06197</p>
              </div>
            </div>
          </div>

          <div className="flex gap-6 px-6 mb-6">
            {/* Bill To */}
            <div className="flex-1 bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Billed To</h3>
              <p className="font-bold text-slate-900 text-base">{customer?.name || "Customer Name"}</p>
              <p className="text-sm text-slate-600 mt-1">{customer?.town || ""}</p>
              <p className="text-sm text-slate-600">{customer?.district || ""}</p>
              {customer?.mobile && <p className="text-sm text-slate-600 mt-1">Mob: {customer.mobile}</p>}
            </div>
            {/* Bill Info */}
            <div className="w-[200px] shrink-0 bg-blue-50 rounded-xl p-5 border border-blue-100 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Invoice No</p>
                <p className="font-bold text-blue-900 text-lg">{billInfo?.billNo || ""}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 mt-3">Invoice Date</p>
                <p className="font-bold text-blue-900 text-sm">{billInfo?.date || ""}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="px-6 flex-1">
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 text-center w-12 font-medium">S.No</th>
                    <th className="py-3 px-4 text-left font-medium">Particulars</th>
                    <th className="py-3 px-4 text-right w-24 font-medium">Qty</th>
                    <th className="py-3 px-4 text-right w-28 font-medium">Rate</th>
                    <th className="py-3 px-4 text-right w-32 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paddedItems.map((item, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="py-2 px-4 text-center text-slate-400 text-xs">{idx + 1}</td>
                      <td className="py-2 px-4 text-slate-700 font-medium">{item?.itemName || item?.particulars || item?.itemDetails || ""}</td>
                      <td className="py-2 px-4 text-right text-slate-600">{item?.qty || ""}</td>
                      <td className="py-2 px-4 text-right text-slate-600">{item?.rate || ""}</td>
                      <td className="py-2 px-4 text-right font-medium text-slate-800">{item?.amount ? Number(item.amount).toFixed(2) : ""}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td colSpan="4" className="py-4 px-4 text-right font-bold text-slate-900">NET AMOUNT</td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900 text-base">{Number(totals?.netAmount || 0).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Info */}
          <div className="px-6 pb-4 mt-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-bold">Amount in Words</p>
                <p className="text-sm font-medium text-slate-800 uppercase">{numberToWords(Math.round(totals?.netAmount || 0))}</p>
              </div>
              <div className="flex flex-col items-center relative mt-6">
                {digitalSignature && (
                  <img src={digitalSignature} alt="Digital Signature" className="absolute bottom-5 left-1/2 -translate-x-1/2 max-h-[60px] max-w-[150px] object-contain opacity-90" style={{ pointerEvents: 'none' }} />
                )}
                <span className="font-bold text-sm mt-8 text-slate-800 border-t border-slate-300 pt-2">Authorised Signatory</span>
              </div>
            </div>
          </div>

        <div className="text-left text-[10px] text-gray-500 mt-2 italic px-2">
          Prepared By: {creatorName} | Date & Time: {formattedTime}
        </div>
        </div>

        {/* CUT LINE */}
        <div className="relative flex items-center justify-center opacity-50 my-2">
          <div className="absolute w-full border-t-2 border-dashed border-slate-300"></div>
          <span className="bg-white px-2 text-slate-400 text-lg relative z-10" style={{ transform: 'rotate(180deg)' }}>✂️</span>
        </div>

        {/* TEAR-OFF SLIP */}
        <div className="h-[53mm] bg-slate-900 text-white rounded-t-xl p-4 flex flex-col font-sans">
          <div className="flex justify-between border-b border-slate-700 pb-2 mb-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Delivery Details</p>
              <h2 className="text-lg font-bold">{customer?.name || "Customer Name"}</h2>
              <p className="text-sm text-slate-300">{customer?.town} - {customer?.district}</p>
              {customer?.mobile && <p className="text-sm text-slate-300">Mob: {customer.mobile}</p>}
            </div>
            <div className="text-right flex flex-col justify-between">
               <p className="text-lg font-bold text-blue-400">Bill No: {billInfo?.billNo}</p>
               <p className="text-sm text-slate-300">Date: {billInfo?.date}</p>
            </div>
          </div>
          <div className="flex justify-between items-end flex-1">
             <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-200">
               <p><span className="text-slate-500 mr-2">Transport:</span> {billInfo?.transport}</p>
               <p><span className="text-slate-500 mr-2">Destination:</span> {billInfo?.destination}</p>
               <p><span className="text-slate-500 mr-2">LR No:</span> {billInfo?.lrNo}</p>
               <p><span className="text-slate-500 mr-2">Bundles:</span> {billInfo?.bundles}</p>
             </div>
             {billInfo?.isEbill && billInfo?.qrCode ? (
                <div className="bg-white p-1 rounded-lg"><QRCodeCanvas value={billInfo.qrCode} size={60} level={"M"} /></div>
             ) : (
                <div className="w-[68px] h-[68px]"></div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
});

export default ModernTemplate;
