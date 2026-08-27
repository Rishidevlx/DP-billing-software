import React, { forwardRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const Template2 = forwardRef(({ data, type = 'bill' }, ref) => {
  if (!data) return null;

  const isReturn = type === 'return';
  const info = isReturn ? data.returnInfo : data.billInfo;
  
  const {
    customer,
    items,
    totals,
    billSettings
  } = data;

  const digitalSignature = localStorage.getItem('digitalSignature');

  const numberToWords = (num) => {
    if (!num) return 'ZERO';
    const a = ['', 'ONE ', 'TWO ', 'THREE ', 'FOUR ', 'FIVE ', 'SIX ', 'SEVEN ', 'EIGHT ', 'NINE ', 'TEN ', 'ELEVEN ', 'TWELVE ', 'THIRTEEN ', 'FOURTEEN ', 'FIFTEEN ', 'SIXTEEN ', 'SEVENTEEN ', 'EIGHTEEN ', 'NINETEEN '];
    const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'CRORE ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'LAKH ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'THOUSAND ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'HUNDRED ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'AND ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return 'RUPEES ' + str.trim() + ' ONLY';
  };

  return (
    <div ref={ref} className="bg-white text-black font-sans mx-auto" style={{ width: '215.9mm', minHeight: '355mm', padding: '8mm', boxSizing: 'border-box' }}>
      <style>{`
        @media print {
          @page { margin: 0; }
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .tear-off { page-break-inside: avoid; }
        }
      `}</style>

      {/* Main Container */}
      <div className="flex flex-col relative" style={{ height: '265mm', pageBreakInside: 'avoid' }}>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          {/* Logo */}
          <div className="w-[140px] flex-shrink-0 pt-2">
             <img src="/DP-logo.png" alt="Logo" className="w-full h-auto object-contain max-h-[100px]" />
          </div>

          {/* Center Info */}
          <div className="flex-1 flex flex-col items-center justify-center text-[#0c2858]">
             <span className="text-[#f28c18] font-bold text-[10px] tracking-widest uppercase mb-1">
               {isReturn ? "SALES RETURN INVOICE" : "TAX INVOICE"}
             </span>
             <h1 className="text-3xl font-extrabold tracking-wider uppercase mb-1" style={{ transform: 'scaleY(1.1)' }}>Dolphin Publications</h1>
             <p className="text-[11px] font-semibold text-center leading-snug">
               239, Keelapatti Street, Srivilliputtur - 626 125<br/>
               Virudhunagar District, Tamil Nadu (Code : 33)
             </p>
             <div className="flex gap-4 mt-2 text-[10px] font-bold">
               <span className="flex items-center gap-1">✅ GSTIN : 33CAEPK4827P1ZC</span>
               <span className="flex items-center gap-1">📞 98653-06197, 89256-77710</span>
             </div>
             <div className="flex gap-4 mt-1 text-[10px] font-bold">
               <span className="flex items-center gap-1">✉ dolphin.pub2005@gmail.com</span>
               <span className="flex items-center gap-1">🌐 www.kalvidolphin.com</span>
             </div>
          </div>

          {/* QR Box */}
          <div className="w-[120px] flex-shrink-0 border border-slate-300 rounded-lg overflow-hidden flex flex-col items-center">
             <div className="bg-[#0c2858] text-white w-full text-center py-1 text-[9px] font-bold tracking-wider">
               INVOICE DETAILS
             </div>
             <div className="p-2 pb-1 bg-white">
               {!isReturn && info?.isEbill && info?.qrCode ? (
                 <QRCodeCanvas value={info.qrCode} size={70} level={"M"} />
               ) : (
                 <div style={{ width: 70, height: 70 }}></div>
               )}
             </div>
             <div className="text-[8px] font-bold text-[#0c2858] pb-1">Scan to Verify</div>
          </div>
        </div>

        {/* IRN Block */}
        {!isReturn && info?.isEbill && (
          <div className="border border-slate-300 rounded-md mb-2 flex text-[9px] font-bold text-[#0c2858]">
             <div className="w-[70%] border-r border-slate-300 p-1.5 flex items-center">
                IRN : <span className="font-normal ml-1 break-all">{info?.irn || ''}</span>
             </div>
             <div className="w-[30%] p-1.5 flex flex-col justify-center">
                <div className="flex"><span className="w-14">Ack No</span>: <span className="font-normal ml-1">{info?.ackNo || ''}</span></div>
                <div className="flex mt-0.5"><span className="w-14">Ack Date</span>: <span className="font-normal ml-1">{info?.ackDate || ''}</span></div>
             </div>
          </div>
        )}

        {/* Details Block */}
        <div className="flex border border-slate-300 rounded-md overflow-hidden mb-2">
          {/* Bill To */}
          <div className="w-1/2 p-2 text-[#0c2858] text-[10px] leading-tight flex flex-col justify-between">
             <div>
               <div className="flex justify-between items-start mb-2">
                 <span className="bg-[#0c2858] text-white font-bold px-3 py-1 rounded text-xs">{isReturn ? "RETURN FROM" : "BILL TO"}</span>
                 {customer?.mobile && <span className="font-bold">Mob. No : {customer.mobile}</span>}
               </div>
               <div className="font-bold uppercase text-[11px] mb-1">{customer?.name || customer?.school || ''}</div>
               <div className="font-semibold uppercase text-slate-700">
                 <p>{customer?.address1}</p>
                 <p>{customer?.address2}</p>
                 <p>{customer?.district}</p>
                 <p>Tamil Nadu (Code : 33)</p>
                 {customer?.gstin && <p className="mt-1 font-bold text-[#0c2858]">GST NO : {customer.gstin}</p>}
                 {customer?.phone && <p>Phone No : {customer.phone}</p>}
               </div>
             </div>
          </div>

          {/* Invoice Details */}
          <div className="w-1/2 border-l border-slate-300 flex flex-col text-[10px] font-bold text-[#0c2858] bg-[#f8fafc]">
             <div className="flex border-b border-slate-300 flex-1">
                <div className="w-1/2 p-1.5 border-r border-slate-300 flex items-center">
                  <span className="w-16">{isReturn ? "Return No." : "Bill No."}</span>
                  <span className="text-blue-600 text-sm">{info?.returnNo || info?.billNo || ""}</span>
                </div>
                <div className="w-1/2 p-1.5 flex items-center">
                  <span className="w-12">Date</span>:
                  <span className="ml-1 text-slate-800">{info?.date || ""}</span>
                </div>
             </div>

             {isReturn ? (
               <>
                 <div className="flex border-b border-slate-300 flex-1">
                   <div className="w-1/2 p-1.5 border-r border-slate-300 flex items-center uppercase">ORIGINAL BILL NO</div>
                   <div className="w-1/2 p-1.5 flex items-center uppercase text-slate-800">{info?.originalBillNo}</div>
                 </div>
                 <div className="flex border-b border-slate-300 flex-1">
                   <div className="w-1/2 p-1.5 border-r border-slate-300 flex items-center uppercase">TRANSPORT</div>
                   <div className="w-1/2 p-1.5 flex items-center uppercase text-slate-800">{info?.transport}</div>
                 </div>
                 <div className="flex border-b border-slate-300 flex-1">
                   <div className="w-1/2 p-1.5 border-r border-slate-300 flex items-center uppercase">REASON</div>
                   <div className="w-1/2 p-1.5 flex items-center uppercase text-slate-800">{info?.reason || "STOCK RETURN"}</div>
                 </div>
                 <div className="flex flex-1">
                   <div className="w-1/2 p-1.5 border-r border-slate-300 flex items-center uppercase"></div>
                   <div className="w-1/2 p-1.5 flex items-center uppercase text-slate-800"></div>
                 </div>
               </>
             ) : (
               <>
                 <div className="flex border-b border-slate-300 flex-1">
                   <div className="w-1/2 p-1.5 border-r border-slate-300 flex items-center uppercase">TRANSPORT</div>
                   <div className="w-1/2 p-1.5 flex items-center uppercase text-slate-800">{info?.transport}</div>
                 </div>
                 <div className="flex border-b border-slate-300 flex-1">
                   <div className="w-1/2 p-1.5 border-r border-slate-300 flex items-center uppercase">DESTINATION</div>
                   <div className="w-1/2 p-1.5 flex items-center uppercase text-slate-800">{info?.destination}</div>
                 </div>
                 <div className="flex border-b border-slate-300 flex-1">
                   <div className="w-1/2 p-1.5 border-r border-slate-300 flex items-center">
                     NO. OF BUNDLES <span className="ml-2 text-slate-800 font-normal">{info?.bundles || "0"}</span>
                   </div>
                   <div className="w-1/2 p-1.5 flex items-center">
                     <span className="w-12">LR Date</span>:
                     <span className="ml-1 text-slate-800 font-normal">{info?.lrDate || info?.date || ""}</span>
                   </div>
                 </div>
                 <div className="flex border-b border-slate-300 flex-1">
                   <div className="w-1/2 p-1.5 border-r border-slate-300 flex items-center uppercase">LR NO</div>
                   <div className="w-1/2 p-1.5 flex items-center uppercase text-slate-800">{info?.lrNo}</div>
                 </div>
                 <div className="flex flex-1">
                   <div className="w-1/2 p-1.5 border-r border-slate-300 flex items-center uppercase">E WAY BILL NO</div>
                   <div className="w-1/2 p-1.5 flex items-center uppercase text-slate-800">{info?.eWayBillNo}</div>
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Items Table */}
        <div className="flex-1 flex flex-col border border-slate-300 rounded-md overflow-hidden mb-2">
          <table className="w-full text-[11px] font-semibold flex-1 flex flex-col" style={{ tableLayout: 'fixed' }}>
            <thead className="w-full table" style={{ tableLayout: 'fixed' }}>
              <tr className="bg-[#0c2858] text-white">
                <th className="w-12 border-r border-slate-300 px-1 py-1 text-center font-bold">S.NO</th>
                <th className="border-r border-slate-300 px-2 py-1 text-center font-bold">PARTICULARS</th>
                <th className="w-20 border-r border-slate-300 px-1 py-1 text-center font-bold">RATE (₹)</th>
                <th className="w-16 border-r border-slate-300 px-1 py-1 text-center font-bold">QTY</th>
                {!isReturn && <th className="w-24 border-r border-slate-300 px-1 py-1 text-center font-bold">TEACHERS COPY</th>}
                <th className={`${isReturn ? 'w-40' : 'w-24'} px-2 py-1 text-center font-bold`}>AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody className="text-slate-900 flex-1 flex flex-col w-full">
              {items && items.map((item, index) => (
                <tr key={index} className="w-full table" style={{ tableLayout: 'fixed' }}>
                  <td className="w-12 border-r border-slate-300 px-1 py-1 text-center">{index + 1}</td>
                  <td className="border-r border-slate-300 px-2 py-1 text-xs">{item.itemName || item.particulars || item.itemDetails || ""}</td>
                  <td className="w-20 border-r border-slate-300 px-1 py-1 text-center">{Number(item.rate).toFixed(2)}</td>
                  <td className="w-16 border-r border-slate-300 px-1 py-1 text-center">{item.qty}</td>
                  {!isReturn && <td className="w-24 border-r border-slate-300 px-1 py-1 text-center">{item.teachersCopy || '0'}</td>}
                  <td className={`${isReturn ? 'w-40' : 'w-24'} text-right px-2 py-1 font-bold`}>{Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="flex-1 w-full table" style={{ tableLayout: 'fixed' }}>
                <td className="w-12 border-r border-slate-300 h-full border-t-0 border-b-0"></td>
                <td className="border-r border-slate-300 h-full border-t-0 border-b-0"></td>
                <td className="w-20 border-r border-slate-300 h-full border-t-0 border-b-0"></td>
                <td className="w-16 border-r border-slate-300 h-full border-t-0 border-b-0"></td>
                {!isReturn && <td className="w-24 border-r border-slate-300 h-full border-t-0 border-b-0"></td>}
                <td className={`${isReturn ? 'w-40' : 'w-24'} h-full border-t-0 border-b-0`}></td>
              </tr>
              {/* Totals inside table */}
              <tr className="w-full table border-t border-slate-300" style={{ tableLayout: 'fixed' }}>
                <td className="w-12 border-r border-slate-300"></td>
                <td className="border-r border-slate-300 px-2 py-1 text-center font-bold text-[#0c2858]">{isReturn ? "Total Qty" : "Sub Total"}</td>
                <td className="w-20 border-r border-slate-300"></td>
                <td className="w-16 border-r border-slate-300 text-center font-bold text-[#0c2858]">{totals?.qty || "0"}</td>
                {!isReturn && <td className="w-24 border-r border-slate-300"></td>}
                <td className={`${isReturn ? 'w-40' : 'w-24'} text-right px-2 py-1 font-bold text-[#0c2858]`}>{Number(totals?.grossAmount || totals?.amount || 0).toFixed(2)}</td>
              </tr>
              
              {!isReturn && (billSettings?.discountAmount > 0) && (
              <tr className="w-full table" style={{ tableLayout: 'fixed' }}>
                <td className="w-12 border-r border-slate-300"></td>
                <td className="border-r border-slate-300 px-2 py-1 text-center font-bold text-[#0c2858]">
                  Discount {billSettings.discountPercent ? `(${billSettings.discountPercent}%)` : ''}
                </td>
                <td className="w-20 border-r border-slate-300"></td>
                <td className="w-16 border-r border-slate-300"></td>
                <td className="w-24 border-r border-slate-300"></td>
                <td className="w-24 text-right px-2 py-1 font-bold text-[#0c2858]">{Number(billSettings.discountAmount || 0).toFixed(2)}</td>
              </tr>
              )}

              {!isReturn && (billSettings?.freight > 0) && (
              <tr className="w-full table" style={{ tableLayout: 'fixed' }}>
                <td className="w-12 border-r border-slate-300"></td>
                <td className="border-r border-slate-300 px-2 py-1 text-center font-bold text-[#0c2858]">Packing & Forwarding</td>
                <td className="w-20 border-r border-slate-300"></td>
                <td className="w-16 border-r border-slate-300"></td>
                <td className="w-24 border-r border-slate-300"></td>
                <td className="w-24 text-right px-2 py-1 font-bold text-[#0c2858]">{Number(billSettings.freight || 0).toFixed(2)}</td>
              </tr>
              )}

              {!isReturn && (billSettings?.roundOff && Number(billSettings.roundOff) !== 0) && (
              <tr className="w-full table" style={{ tableLayout: 'fixed' }}>
                <td className="w-12 border-r border-slate-300"></td>
                <td className="border-r border-slate-300 px-2 py-1 text-center font-bold text-[#0c2858]">Round Off</td>
                <td className="w-20 border-r border-slate-300"></td>
                <td className="w-16 border-r border-slate-300"></td>
                <td className="w-24 border-r border-slate-300"></td>
                <td className="w-24 text-right px-2 py-1 font-bold text-[#0c2858]">{Number(billSettings.roundOff).toFixed(2)}</td>
              </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* GST EXEMPTED GOODS ROW */}
        <div className="flex font-bold text-[11px] mb-2 rounded-md overflow-hidden border border-[#0c2858]">
          <div className="flex-1 bg-[#0c2858] text-white px-3 py-1.5">{isReturn ? "TOTAL RETURN AMOUNT DEDUCTED" : "GST EXEMPTED GOODS"}</div>
          <div className="w-32 text-center py-1.5 text-[#0c2858] bg-[#f8fafc]">{isReturn ? "Net Return Value" : "Net Amount"}</div>
          <div className="w-24 text-right px-2 py-1.5 bg-[#eff6ff] text-[#0c2858] border-l border-[#0c2858]">{Number(totals?.netAmount || totals?.amount || 0).toFixed(2)}</div>
        </div>

        {/* Amount in words */}
        <div className="px-2 py-1 font-bold text-[10px] text-[#0c2858] border-b border-slate-300 mb-2">
          Amount (Words) : <span className="text-slate-800 ml-2 uppercase">{numberToWords(Math.round(totals?.netAmount || totals?.amount || 0))}</span>
        </div>

        {/* Footer info (Terms & Signature) */}
        <div className="flex justify-between px-2 h-20 relative">
          <div className="w-1/2">
            <h4 className="text-[#0c2858] font-bold text-[11px] underline mb-1">{isReturn ? "Notes" : "Terms and Conditions"}</h4>
            <p className="text-[9px] font-semibold text-[#0c2858]">
              {isReturn 
                ? "1. This return invoice reduces the total balance due by the customer." 
                : "1. If you wish to return the books, you must return them within a month."}
            </p>
          </div>
          <div className="w-1/2 flex flex-col justify-between items-end">
            <h4 className="text-[#0c2858] font-bold text-[11px]">For DOLPHIN PUBLICATIONS</h4>
            <div className="flex flex-col items-center relative mt-6">
              {digitalSignature && (
                <img src={digitalSignature} alt="Digital Signature" className="absolute bottom-3 left-1/2 -translate-x-1/2 max-h-[50px] max-w-[120px] object-contain opacity-90" style={{ pointerEvents: 'none' }} />
              )}
              <span className="font-bold text-[10px] mt-4 relative z-10 text-[#0c2858]">Authorised Signatory</span>
            </div>
          </div>
        </div>
      </div>

      {/* CUT LINE */}
      <div className="relative flex items-center justify-center opacity-70" style={{ height: '6mm' }}>
        <div className="absolute w-full border-t-2 border-dashed border-slate-400"></div>
        <span className="bg-white px-4 text-slate-500 font-bold tracking-widest text-[10px] relative z-10 flex items-center gap-2">
           <span className="text-sm">✂</span> CUT HERE <span className="text-sm">✂</span>
        </span>
      </div>

      {/* TEAR-OFF SLIP */}
      <div className="border border-[#0c2858] rounded-md flex font-bold text-[10px] text-[#0c2858] p-2 pb-8 relative overflow-hidden" style={{ height: '60mm' }}>
        
        {/* Left Side: Address */}
        <div className="w-1/2 pr-4 flex flex-col justify-start">
          <div className="flex justify-between mb-1">
            <span className="text-blue-700">{isReturn ? "RETURN FROM :" : "To :"}</span>
          </div>
          <div className="text-slate-900 uppercase leading-snug">
            <p>{customer?.name || customer?.school || ""}</p>
            <p className="font-semibold text-slate-700">{customer?.address1 || ""}</p>
            <p className="font-semibold text-slate-700">{customer?.address2 || ""}</p>
            <p className="font-semibold text-slate-700">{customer?.district || ""}</p>
            <p className="font-semibold text-slate-700">Tamil Nadu (Code : 33)</p>
            {customer?.gstin && <p className="mt-1">GST NO : {customer.gstin}</p>}
            {customer?.phone && <p>Phone No : {customer.phone}</p>}
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="w-1/2 pl-4 border-l border-slate-300 relative flex flex-col gap-1 leading-snug">
          <div className="flex justify-between mb-1">
             <span className="text-blue-700">Mob. No : {customer?.mobile || ""}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-blue-700">{isReturn ? "Return No" : "Bill No"}</span>
            <span className="mr-2">:</span>
            <span className="text-slate-900">{info?.returnNo || info?.billNo || ""}</span>
          </div>
          {isReturn ? (
            <>
              <div className="flex">
                <span className="w-24 text-blue-700">Orig Bill No</span>
                <span className="mr-2">:</span>
                <span className="text-slate-900 uppercase">{info?.originalBillNo || ""}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-blue-700">Reason</span>
                <span className="mr-2">:</span>
                <span className="text-slate-900 uppercase">{info?.reason || "STOCK RETURN"}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex">
                <span className="w-24 text-blue-700">Transport</span>
                <span className="mr-2">:</span>
                <span className="text-slate-900 uppercase">{info?.transport || ""}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-blue-700">Destination</span>
                <span className="mr-2">:</span>
                <span className="text-slate-900 uppercase">{info?.destination || ""}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-blue-700">No. of Bundles</span>
                <span className="mr-2">:</span>
                <span className="text-slate-900">{info?.bundles || "0"}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-blue-700">LR No</span>
                <span className="mr-2">:</span>
                <span className="text-slate-900 uppercase">{info?.lrNo || ""}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-blue-700">LR Date</span>
                <span className="mr-2">:</span>
                <span className="text-slate-900">{info?.lrDate || info?.date || ""}</span>
              </div>
              <div className="flex mt-1">
                <span className="w-24 text-blue-700">Booking</span>
                <span className="mr-2">:</span>
                <span className="text-slate-900 font-extrabold">PAID / <span className="text-[#f28c18]">TO PAY</span></span>
              </div>
            </>
          )}
        </div>

        {/* Bottom Banner inside tear-off */}
        <div className="absolute bottom-0 left-0 w-full bg-[#0c2858] text-white py-1 flex items-center justify-center gap-4 border-t-4 border-[#0c2858]">
           <span className="text-[#f28c18] text-sm">★</span>
           <span className="text-[10px] tracking-widest">{isReturn ? "THANK YOU FOR YOUR COOPERATION!" : "Thank you for your business!"}</span>
           <span className="text-[#f28c18] text-sm">★ ★</span>
        </div>
      </div>
    </div>
  );
});

export default Template2;
