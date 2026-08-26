import React, { forwardRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const MinimalistTemplate = forwardRef(({ billData }, ref) => {
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
        
        <div className="flex flex-col h-[230mm] font-sans text-gray-900 px-8 py-10">
          {/* Header - Minimalist */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-light tracking-widest text-black mb-6 uppercase">Invoice</h1>
              <h2 className="text-lg font-bold">Dolphin Publications</h2>
              <p className="text-sm text-gray-500">39, West Madavilagam</p>
              <p className="text-sm text-gray-500">Srivilliputtur - 626 125</p>
            </div>
            <div className="text-right text-sm">
               <div className="mb-4">
                 <p className="text-gray-400 uppercase tracking-widest text-xs mb-1">Invoice No</p>
                 <p className="font-bold text-xl">{billInfo?.billNo}</p>
               </div>
               <div>
                 <p className="text-gray-400 uppercase tracking-widest text-xs mb-1">Date</p>
                 <p className="font-medium">{billInfo?.date}</p>
               </div>
            </div>
          </div>

          <div className="mb-10">
            <p className="text-gray-400 uppercase tracking-widest text-xs mb-2 border-b border-gray-100 pb-2 inline-block">Billed To</p>
            <p className="font-semibold text-lg mt-2">{customer?.school}</p>
            <p className="text-gray-600">{customer?.address1}, {customer?.district}</p>
          </div>

          {/* Table */}
          <div className="flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black text-left text-xs uppercase tracking-widest text-gray-400">
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 text-right font-medium">Qty</th>
                  <th className="pb-3 text-right font-medium">Rate</th>
                  <th className="pb-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paddedItems.slice(0, 10).map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-medium text-gray-800">{item?.itemName || item?.particulars || item?.itemDetails || ""}</td>
                    <td className="py-3 text-right text-gray-500">{item?.qty || ""}</td>
                    <td className="py-3 text-right text-gray-500">{item?.rate || ""}</td>
                    <td className="py-3 text-right font-medium">{item?.amount ? Number(item.amount).toFixed(2) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex justify-end mt-4 pt-4 border-t-2 border-black">
               <div className="text-right">
                  <p className="text-gray-400 uppercase tracking-widest text-xs mb-1">Total Due</p>
                  <p className="text-3xl font-light">{Number(totals?.netAmount || 0).toFixed(2)}</p>
               </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 flex justify-between items-end border-t border-gray-100 pt-6">
            <div className="w-2/3">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Amount in words</p>
              <p className="text-sm font-medium uppercase text-gray-600">{numberToWords(Math.round(totals?.netAmount || 0))}</p>
            </div>
            <div className="flex flex-col items-center relative">
              {digitalSignature && <img src={digitalSignature} alt="Sig" className="absolute bottom-6 max-h-[50px] object-contain opacity-90 mix-blend-multiply" />}
              <span className="text-xs tracking-widest uppercase text-gray-400 mt-6 pt-2 border-t border-gray-200">Signatory</span>
            </div>
          </div>
        </div>
        <div className="text-left text-[10px] text-gray-400 mt-4 italic px-8">
          Prepared By: {creatorName} | Date & Time: {formattedTime}
        </div>

        {/* CUT LINE */}
        <div className="relative flex items-center justify-center opacity-20 my-1">
          <div className="absolute w-full border-t border-dashed border-black"></div>
          <span className="bg-white px-2 text-black text-lg relative z-10" style={{ transform: 'rotate(180deg)' }}>✂️</span>
        </div>

        {/* TEAR-OFF SLIP */}
        <div className="h-[53mm] px-8 py-4 font-sans flex flex-col justify-between bg-gray-50">
          <div className="flex justify-between items-start">
             <div>
                <p className="font-semibold text-lg">{customer?.school}</p>
                <p className="text-sm text-gray-500">{customer?.town} - {customer?.district}</p>
             </div>
             <div className="text-right">
                <p className="font-medium text-gray-900">Inv #{billInfo?.billNo}</p>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs mt-4">
             <div><p className="text-gray-400 uppercase tracking-wider mb-1">Transport</p><p className="font-medium">{billInfo?.transport}</p></div>
             <div><p className="text-gray-400 uppercase tracking-wider mb-1">LR No</p><p className="font-medium">{billInfo?.lrNo}</p></div>
             <div><p className="text-gray-400 uppercase tracking-wider mb-1">Bundles</p><p className="font-medium">{billInfo?.bundles}</p></div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default MinimalistTemplate;
