import React, { forwardRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const ElegantTemplate = forwardRef(({ billData }, ref) => {
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
        
        <div className="flex flex-col h-[230mm] font-serif text-[#2C3E50] border-8 border-double border-[#2C3E50] m-2 p-4">
          {/* Header - Overlapping style */}
          <div className="text-center mb-8 relative">
             <div className="inline-block border-b-2 border-[#D4AF37] pb-2 px-8 mb-4">
               <h1 className="text-3xl font-bold uppercase tracking-[0.2em] text-[#2C3E50]">Invoice</h1>
             </div>
             <div className="flex justify-between items-start text-left mt-4">
                <div className="w-[45%]">
                   <h2 className="text-xl font-bold mb-1">Dolphin Publications</h2>
                   <p className="text-sm italic">39, West Madavilagam, Srivilliputtur - 626 125</p>
                   <p className="text-sm">GSTIN: 33CAEPK4827P1ZC</p>
                </div>
                <div className="w-[45%] bg-[#F9F6F0] p-4 border border-[#E0D6C8] shadow-sm text-right">
                   <p className="text-sm uppercase tracking-wider text-[#7F8C8D] mb-1">Invoice Details</p>
                   <p className="font-bold text-lg">No. {billInfo?.billNo}</p>
                   <p className="text-sm">Date: {billInfo?.date}</p>
                </div>
             </div>
          </div>

          <div className="mb-6 px-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-2 border-b border-[#E0D6C8] pb-1">Billed To</h3>
            <p className="font-bold text-lg">{customer?.name || "Customer Name"}</p>
            <p className="text-sm">{customer?.town}, {customer?.district}</p>
            {customer?.mobile && <p className="text-sm">Ph: {customer.mobile}</p>}
          </div>

          {/* Table */}
          <div className="flex-1 px-2">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-[#2C3E50] text-left">
                  <th className="py-2 px-2 font-bold uppercase tracking-wider text-xs">S.No</th>
                  <th className="py-2 px-2 font-bold uppercase tracking-wider text-xs">Particulars</th>
                  <th className="py-2 px-2 text-right font-bold uppercase tracking-wider text-xs">Qty</th>
                  <th className="py-2 px-2 text-right font-bold uppercase tracking-wider text-xs">Rate</th>
                  <th className="py-2 px-2 text-right font-bold uppercase tracking-wider text-xs">Amount</th>
                </tr>
              </thead>
              <tbody>
                {paddedItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#E0D6C8] border-dashed">
                    <td className="py-1 px-2 text-[#7F8C8D]">{idx + 1}</td>
                    <td className="py-1 px-2 font-medium">{item?.itemDetails || ""}</td>
                    <td className="py-1 px-2 text-right">{item?.qty || ""}</td>
                    <td className="py-1 px-2 text-right">{item?.rate || ""}</td>
                    <td className="py-1 px-2 text-right font-medium">{item?.amount ? Number(item.amount).toFixed(2) : ""}</td>
                  </tr>
                ))}
                <tr className="border-t-[3px] border-[#2C3E50]">
                  <td colSpan="4" className="py-3 px-2 text-right font-bold uppercase tracking-wider text-sm">Net Amount Due</td>
                  <td className="py-3 px-2 text-right font-bold text-lg text-[#D4AF37]">{Number(totals?.netAmount || 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          <div className="px-2 mt-4 flex justify-between items-end">
            <div>
              <p className="text-xs italic text-[#7F8C8D] mb-1">Amount in words</p>
              <p className="text-sm font-semibold uppercase">{numberToWords(Math.round(totals?.netAmount || 0))}</p>
            </div>
            <div className="flex flex-col items-center relative min-w-[150px]">
              {digitalSignature && <img src={digitalSignature} alt="Sig" className="absolute bottom-6 max-h-[50px] object-contain opacity-90" />}
              <span className="font-serif italic text-sm mt-8 border-t border-[#2C3E50] w-full text-center pt-1">Authorised Signatory</span>
            </div>
          </div>
        </div>

        <div className="text-left text-[10px] text-gray-500 mt-2 italic px-2">
          Prepared By: {creatorName} | Date & Time: {formattedTime}
        </div>

        {/* CUT LINE */}
        <div className="relative flex items-center justify-center opacity-30 my-2">
          <div className="absolute w-full border-t border-dashed border-[#2C3E50]"></div>
          <span className="bg-white px-2 text-[#2C3E50] text-lg relative z-10" style={{ transform: 'rotate(180deg)' }}>✂️</span>
        </div>

        {/* TEAR-OFF SLIP */}
        <div className="h-[53mm] border-2 border-[#D4AF37] bg-[#F9F6F0] m-2 flex p-4 font-serif">
          <div className="w-1/2 pr-4 border-r border-[#E0D6C8] flex flex-col justify-between">
            <div>
               <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-2">Delivery Ticket</h4>
               <p className="font-bold text-lg text-[#2C3E50]">{customer?.name}</p>
               <p className="text-sm text-[#2C3E50]">{customer?.town} - {customer?.district}</p>
            </div>
            <p className="text-xs italic text-[#7F8C8D]">Invoice Ref: {billInfo?.billNo}</p>
          </div>
          <div className="w-1/2 pl-4 flex flex-col justify-between">
            <div className="grid grid-cols-2 text-xs gap-y-2">
               <p><strong className="text-[#2C3E50]">Transport:</strong><br/>{billInfo?.transport}</p>
               <p><strong className="text-[#2C3E50]">Bundles:</strong><br/>{billInfo?.bundles}</p>
               <p><strong className="text-[#2C3E50]">LR No:</strong><br/>{billInfo?.lrNo}</p>
            </div>
            <div className="flex justify-end mt-2">
               {billInfo?.isEbill && billInfo?.qrCode && (
                  <div className="border border-[#D4AF37] p-1 bg-white"><QRCodeCanvas value={billInfo.qrCode} size={50} level={"M"} /></div>
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default ElegantTemplate;
