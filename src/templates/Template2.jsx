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
  const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
  const username = currentUser?.username || currentUser?.name || 'Admin';

  const totalQty = items?.reduce((sum, item) => sum + (Number(item.qty) || 0), 0) || 0;

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
    <div ref={ref} className="bg-white text-black font-sans mx-auto" style={{ width: '215.9mm', height: '395mm', minHeight: '395mm', maxHeight: '395mm', padding: '8mm', boxSizing: 'border-box' }}>
      <style>{`
        @media print {
          @page { margin: 0; }
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .tear-off { page-break-inside: avoid; }
        }
      `}</style>

      {/* Main Container */}
      <div className="flex flex-col relative" style={{ height: '335mm', minHeight: '335mm', maxHeight: '335mm', pageBreakInside: 'avoid' }}>
        
        {/* Header */}
        <div className="relative flex justify-center items-center mb-1 min-h-[140px]">
          {/* Logo */}
          <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-[220px] flex justify-start">
             <img src={billSettings?.logo || "/DP-logo.png"} alt="Logo" className="max-w-full h-auto object-contain max-h-[160px]" />
          </div>

          {/* Center Info */}
          <div className="flex flex-col items-center justify-center text-[#0c2858] z-10">
             <span className="text-[#f28c18] font-bold text-[14px] tracking-widest uppercase mb-1">
               {isReturn ? "SALES RETURN INVOICE" : "TAX INVOICE"}
             </span>
             <h1 className="text-3xl font-extrabold tracking-wider uppercase mb-1 text-[#800000]" style={{ transform: 'scaleY(1.1)' }}>Dolphin Publications</h1>
             <p className="text-[13px] font-semibold text-center leading-snug">
               239, Keelapatti Street, Srivilliputtur - 626 125<br/>
               Virudhunagar District, Tamil Nadu (Code : 33)
             </p>
             <div className="flex justify-center gap-3 mt-2 text-[13px] font-bold whitespace-nowrap">
               <span className="flex items-center gap-1"> GSTIN : 33CAEPK4827P1ZC</span>
               <span className="flex items-center gap-1">Mobile No : 98653-06197, 89256-77710</span>
             </div>
             <div className="flex justify-center gap-3 mt-1 text-[13px] font-bold whitespace-nowrap">
               <span className="flex items-center gap-1">✉ dolphin.pub2005@gmail.com</span>
               <span className="flex items-center gap-1">🌐 www.kalvidolphin.com</span>
             </div>
          </div>

          {/* QR Box Wrapper */}
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex justify-end">
            <div className="border border-slate-300 rounded-lg p-2 bg-white flex items-center justify-center">
               {!isReturn && info?.isEbill && info?.qrCode ? (
                 <QRCodeCanvas value={info.qrCode} size={85} level={"M"} />
               ) : (
                 <div style={{ width: 85, height: 85 }}></div>
               )}
            </div>
          </div>
        </div>

        {/* IRN Block */}
        {!isReturn && info?.isEbill && (
          <div className="border border-slate-300 rounded-md mb-2 flex items-center justify-between text-[11px] font-bold text-[#0c2858] p-1.5 px-3">
             <div className="flex items-center gap-2 overflow-hidden mr-4">
                <span className="whitespace-nowrap">IRN :</span> 
                <span className="font-normal truncate">{info?.irn || ''}</span>
             </div>
             <div className="flex items-center gap-6 whitespace-nowrap shrink-0">
                <div>Ack No : <span className="font-normal">{info?.ackNo || ''}</span></div>
                <div>Ack Date : <span className="font-normal">{info?.ackDate || ''}</span></div>
             </div>
          </div>
        )}

        {/* Details Block */}
        <div className="flex border border-slate-300 rounded-md overflow-hidden mb-1">
          {/* Bill To */}
          <div className="w-1/2 p-2 text-[#0c2858] text-[14px] leading-snug flex flex-col justify-between">
             <div>
               <div className="flex justify-between items-start mb-2">
                 <span className="bg-[#0c2858] text-white font-bold px-3 py-1 rounded text-[14px]">{isReturn ? "RETURN FROM" : "BILL TO"}</span>
                 {customer?.mobile && <span className="font-bold text-[13px]">Mob. No : {customer.mobile}</span>}
               </div>
               <p className="font-extrabold text-[16px] uppercase tracking-wide">{customer?.printName || customer?.school || customer?.name || ""}</p>
               <div className="font-semibold uppercase text-slate-700 text-[13px]">
                 <p className="whitespace-pre-line">{customer?.address1}</p>
                 {(customer?.town || customer?.address2) && (
                   <p>{[customer?.town, customer?.address2].filter(Boolean).join(" - ")}</p>
                 )}
                 {customer?.district && <p>{customer?.district}</p>}
                 <p>Tamil Nadu (Code : 33)</p>
                 {customer?.gstin && <p className="mt-1 font-bold text-[#0c2858]">GST NO : {customer.gstin}</p>}
                 {customer?.phone && <p>Phone No : {customer.phone}</p>}
               </div>
             </div>
          </div>

          {/* Invoice Details */}
          <div className="w-1/2 border-l border-slate-300 flex flex-col text-[14px] font-bold text-[#0c2858] bg-[#f8fafc]">
             <div className="flex border-b border-slate-300 flex-1">
                <div className="w-[40%] p-1.5 border-r border-slate-300 flex items-center bg-gray-200/60 uppercase">
                  {isReturn ? "Return No :" : "Bill No :"}
                </div>
                <div className="w-[60%] p-1.5 flex items-center justify-between text-slate-800">
                  <span className="text-blue-600">{info?.returnNo || info?.billNo || ""}</span>
                  <span className="font-semibold text-[13px]">Date : {info?.date || ""}</span>
                </div>
             </div>

             {isReturn ? (
               <>
                 <div className="flex border-b border-slate-300 flex-1">
                   <div className="w-[40%] p-1.5 border-r border-slate-300 flex items-center bg-gray-200/60 uppercase">ORIGINAL BILL NO</div>
                   <div className="w-[60%] p-1.5 flex items-center uppercase text-slate-800">{info?.originalBillNo}</div>
                 </div>
                 <div className="flex border-b border-slate-300 flex-1">
                   <div className="w-[40%] p-1.5 border-r border-slate-300 flex items-center bg-gray-200/60 uppercase">TRANSPORT</div>
                   <div className="w-[60%] p-1.5 flex items-center uppercase text-slate-800">{info?.transport}</div>
                 </div>
                 <div className="flex border-b border-slate-300 flex-1">
                   <div className="w-[40%] p-1.5 border-r border-slate-300 flex items-center bg-gray-200/60 uppercase">REASON</div>
                   <div className="w-[60%] p-1.5 flex items-center uppercase text-slate-800">{info?.reason || "STOCK RETURN"}</div>
                 </div>
                 <div className="flex flex-1">
                   <div className="w-[40%] p-1.5 border-r border-slate-300 flex items-center bg-gray-200/60 uppercase"></div>
                   <div className="w-[60%] p-1.5 flex items-center uppercase text-slate-800"></div>
                 </div>
               </>
             ) : (
               <>
                 <div className="flex border-b border-slate-300 flex-1">
                   <div className="w-[40%] p-1.5 border-r border-slate-300 flex items-center bg-gray-200/60 uppercase">TRANSPORT</div>
                   <div className="w-[60%] p-1.5 flex items-center uppercase text-slate-800">{info?.transport}</div>
                 </div>
                 <div className="flex border-b border-slate-300 flex-1">
                   <div className="w-[40%] p-1.5 border-r border-slate-300 flex items-center bg-gray-200/60 uppercase">DESTINATION</div>
                   <div className="w-[60%] p-1.5 flex items-center uppercase text-slate-800">{info?.destination}</div>
                 </div>
                 <div className="flex border-b border-slate-300 flex-1">
                   <div className="w-[40%] p-1.5 border-r border-slate-300 flex items-center bg-gray-200/60 uppercase">NO. OF BUNDLES</div>
                   <div className="w-[60%] p-1.5 flex items-center justify-between text-slate-800">
                     <span>{info?.bundles || "0"}</span>
                     <span className="font-semibold text-[13px]">LR Date : {info?.lrDate || info?.date || ""}</span>
                   </div>
                 </div>
                 <div className="flex border-b border-slate-300 flex-1">
                   <div className="w-[40%] p-1.5 border-r border-slate-300 flex items-center bg-gray-200/60 uppercase">LR NO</div>
                   <div className="w-[60%] p-1.5 flex items-center uppercase text-slate-800">{info?.lrNo}</div>
                 </div>
                 <div className="flex flex-1">
                   <div className="w-[40%] p-1.5 border-r border-slate-300 flex items-center bg-gray-200/60 uppercase">E WAY BILL NO</div>
                   <div className="w-[60%] p-1.5 flex items-center uppercase text-slate-800">{info?.eWayBillNo}</div>
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Items Table */}
        <div className="flex-1 flex flex-col border border-slate-300 rounded-md overflow-hidden mb-1">
          <table className="w-full text-[13px] font-semibold flex-1 flex flex-col" style={{ tableLayout: 'fixed' }}>
            <thead className="w-full table" style={{ tableLayout: 'fixed' }}>
              <tr className="bg-[#0c2858] text-white">
                <th className="w-12 border-r border-slate-300 px-1 py-0.5 text-center font-bold">S.NO</th>
                <th className="border-r border-slate-300 px-2 py-0.5 text-center font-bold">PARTICULARS</th>
                <th className="w-20 border-r border-slate-300 px-1 py-0.5 text-center font-bold">RATE (₹)</th>
                <th className="w-16 border-r border-slate-300 px-1 py-0.5 text-center font-bold">QTY</th>
                {!isReturn && <th className="w-24 border-r border-slate-300 px-1 py-0.5 text-center font-bold">TEACHERS COPY</th>}
                <th className={`${isReturn ? 'w-40' : 'w-24'} px-2 py-0.5 text-center font-bold`}>AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody className="text-slate-900 flex-1 flex flex-col w-full">
              {/* HSN CODE ROW */}
              <tr className="w-full table" style={{ tableLayout: 'fixed' }}>
                <td className="w-12 border-r border-slate-300 px-1 py-0 text-center"></td>
                <td className="border-r border-slate-300 px-2 py-0.5 text-[12px] font-bold">PRINTED BOOKS - HSN - 49011010</td>
                <td className="w-20 border-r border-slate-300 px-1 py-0 text-center"></td>
                <td className="w-16 border-r border-slate-300 px-1 py-0 text-center"></td>
                {!isReturn && <td className="w-24 border-r border-slate-300 px-1 py-0 text-center"></td>}
                <td className={`${isReturn ? 'w-40' : 'w-24'} text-right px-2 py-0 font-bold`}></td>
              </tr>
              {items && items.map((item, index) => (
                <tr key={index} className="w-full table" style={{ tableLayout: 'fixed' }}>
                  <td className="w-12 border-r border-slate-300 px-1 py-0 text-center">{index + 1}</td>
                  <td className="border-r border-slate-300 px-2 py-0 text-[12px]">{item.itemName || item.particulars || item.itemDetails || ""}</td>
                  <td className="w-20 border-r border-slate-300 px-1 py-0 text-center">{Number(item.rate).toFixed(2)}</td>
                  <td className="w-16 border-r border-slate-300 px-1 py-0 text-center">{item.qty}</td>
                  {!isReturn && <td className="w-24 border-r border-slate-300 px-1 py-0 text-center">{item.teachersCopy || '0'}</td>}
                  <td className={`${isReturn ? 'w-40' : 'w-24'} text-right px-2 py-0 font-bold`}>{Number(item.amount).toFixed(2)}</td>
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
                <td className="border-r border-slate-300 px-2 py-0.5 text-right font-bold text-[#0c2858]">{isReturn ? "Total Qty" : "Sub Total"}</td>
                <td className="w-20 border-r border-slate-300"></td>
                <td className="w-16 border-r border-slate-300 text-center font-bold text-[#0c2858]">{totalQty || "0"}</td>
                {!isReturn && <td className="w-24 border-r border-slate-300"></td>}
                <td className={`${isReturn ? 'w-40' : 'w-24'} text-right px-2 py-0.5 font-bold text-[#0c2858]`}>{Number(totals?.grossAmount || totals?.amount || 0).toFixed(2)}</td>
              </tr>
              
              {!isReturn && (billSettings?.discountAmount > 0) && (
              <tr className="w-full table" style={{ tableLayout: 'fixed' }}>
                <td className="w-12 border-r border-slate-300"></td>
                <td className="border-r border-slate-300 px-2 py-0.5 text-right font-bold text-[#0c2858]">
                  Discount {billSettings.discountPercent ? `(${billSettings.discountPercent}%)` : ''}
                </td>
                <td className="w-20 border-r border-slate-300"></td>
                <td className="w-16 border-r border-slate-300"></td>
                <td className="w-24 border-r border-slate-300"></td>
                <td className="w-24 text-right px-2 py-0.5 font-bold text-[#0c2858]">{Number(billSettings.discountAmount || 0).toFixed(2)}</td>
              </tr>
              )}

              {!isReturn && (billSettings?.freight > 0) && (
              <tr className="w-full table" style={{ tableLayout: 'fixed' }}>
                <td className="w-12 border-r border-slate-300"></td>
                <td className="border-r border-slate-300 px-2 py-0.5 text-right font-bold text-[#0c2858]">Packing & Forwarding</td>
                <td className="w-20 border-r border-slate-300"></td>
                <td className="w-16 border-r border-slate-300"></td>
                <td className="w-24 border-r border-slate-300"></td>
                <td className="w-24 text-right px-2 py-0.5 font-bold text-[#0c2858]">{Number(billSettings.freight || 0).toFixed(2)}</td>
              </tr>
              )}

              {!isReturn && Number(billSettings?.roundOff || 0) !== 0 && (
              <tr className="w-full table" style={{ tableLayout: 'fixed' }}>
                <td className="w-12 border-r border-slate-300"></td>
                <td className="border-r border-slate-300 px-2 py-1 text-right font-bold text-[#0c2858]">Round Off</td>
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
        <div className="flex font-bold text-[12px] mb-1 rounded-md overflow-hidden border border-[#0c2858]">
          <div className="flex-1 bg-[#0c2858] text-white px-3 py-1">{isReturn ? "TOTAL RETURN AMOUNT DEDUCTED" : "GST EXEMPTED GOODS"}</div>
          <div className="w-32 text-center py-1 text-[#0c2858] bg-[#f8fafc]">{isReturn ? "Net Return Value" : "Net Amount"}</div>
          <div className="w-24 text-right px-2 py-1 bg-[#eff6ff] text-[#0c2858] border-l border-[#0c2858]">{Number(totals?.netAmount || totals?.amount || 0).toFixed(2)}</div>
        </div>

        {/* Amount in words */}
        <div className="px-2 py-0.5 font-bold text-[13px] text-[#0c2858] border-b border-slate-300 mb-1">
          Amount (Words) : <span className="text-slate-800 ml-2 uppercase">{numberToWords(Math.round(totals?.netAmount || totals?.amount || 0))}</span>
        </div>

        {/* Footer info (Terms & Signature) */}
        <div className="flex justify-between px-2 h-20 relative">
          <div className="w-1/2">
            <h4 className="text-[#0c2858] font-bold text-[13px] underline mb-1">{isReturn ? "Notes" : "Terms and Conditions"}</h4>
            <p className="text-[13px] font-semibold text-[#0c2858]">
              {isReturn 
                ? "1. This return invoice reduces the total balance due by the customer." 
                : "1. If you wish to return the books, you must return them within a month."}
            </p>
            <div className="mt-1 text-[11px] text-slate-500 font-bold uppercase tracking-wide">
               Prepared by: {username} | Date: {info?.createdAt ? new Date(info.createdAt).toLocaleDateString('en-GB') : (info?.date || new Date().toLocaleDateString('en-GB'))} | Time: {info?.createdAt ? new Date(info.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
          </div>
          <div className="w-1/2 flex flex-col justify-between items-end">
            <h4 className="text-[#0c2858] font-bold text-[13px]">For DOLPHIN PUBLICATIONS</h4>
            <div className="flex flex-col items-center relative mt-6">
              {digitalSignature && (
                <img src={digitalSignature} alt="Digital Signature" className="absolute bottom-3 left-1/2 -translate-x-1/2 max-h-[50px] max-w-[120px] object-contain opacity-90" style={{ pointerEvents: 'none' }} />
              )}
              <span className="font-bold text-[14px] mt-4 relative z-10 text-[#0c2858]">Authorised Signatory</span>
            </div>
          </div>
        </div>
           <div className="break-inside-avoid w-full" style={{ pageBreakInside: 'avoid' }}>
        {/* CUT LINE */}
        <div className="relative flex items-center justify-center opacity-70" style={{ height: '6mm' }}>
          <div className="w-full border-t border-dashed border-slate-400 my-4"></div>
        </div>

        {/* TEAR-OFF SLIP */}
        <div className="border border-[#0c2858] rounded-md flex font-bold text-[14px] text-[#0c2858] p-2 relative overflow-hidden" style={{ minHeight: '40mm' }}>
          
          {/* Left Side: Address */}
          <div className="w-1/2 pr-4 flex flex-col justify-start">
            <div className="flex mb-1">
              <span className="text-blue-700">{isReturn ? "RETURN FROM :" : "To :"}</span>
            </div>
            <div className="text-slate-900 uppercase leading-snug text-[14px]">
              <p className="font-extrabold tracking-wide">{customer?.printName || customer?.school || customer?.name || ""}</p>
              <p className="font-semibold text-slate-700 whitespace-pre-line">{customer?.address1 || ""}</p>
              {(customer?.town || customer?.address2) && (
                <p className="font-semibold text-slate-700">
                  {[customer?.town, customer?.address2].filter(Boolean).join(" - ")}
                </p>
              )}
              {customer?.district && <p className="font-semibold text-slate-700">{customer?.district}</p>}
              <p className="font-semibold text-slate-700">Tamil Nadu (Code : 33)</p>
              {customer?.gstin && <p className="mt-1">GST NO : {customer.gstin}</p>}
              {customer?.phone && <p>Phone No : {customer.phone}</p>}
              {customer?.mobile && <p className="text-blue-700 font-bold text-[13px] mt-1 normal-case">Mob. No : {customer.mobile}</p>}
            </div>
          </div>

          {/* Right Side: Details */}
          <div className="w-1/2 pl-4 border-l border-slate-300 relative flex justify-between leading-snug">
            <div className="flex flex-col gap-1 w-[70%]">
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
            
            <div className="absolute right-2 top-[15px] w-[180px]">
               <img src={billSettings?.logo || "/DP-logo.png"} alt="Logo" className="w-full h-auto object-contain max-h-[120px]" />
            </div>
          </div>
        </div>
      </div>   </div>
    </div>
  );
});

export default Template2;
