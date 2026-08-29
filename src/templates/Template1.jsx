import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Phone, Mail, Globe, FileText, Truck, Map, Package, Receipt, Scissors } from 'lucide-react';

const Template1 = forwardRef(({ data, type = 'bill' }, ref) => {
  if (!data) return null;
  const isReturn = type === 'return';
  const info = isReturn ? data.returnInfo : data.billInfo;
  const { customer, items, totals, billSettings } = data;
  
  const totalQty = items?.reduce((sum, item) => sum + (Number(item.qty) || 0), 0) || 0;
  
  const digitalSignature = localStorage.getItem('digitalSignature');
  
  const padItems = (itemsArray, minLength) => {
    const arr = itemsArray || [];
    if (arr.length >= minLength) return arr;
    const padding = new Array(minLength - arr.length).fill({
      id: '', itemName: '', rate: '', qty: '', amount: ''
    });
    return [...arr, ...padding];
  };
  const paddedItems = padItems(items, 20);

  const numberToWords = (amount) => {
    if (!amount) return "";
    const a = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
    const b = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
    const n = String(amount).split('.');
    let num = parseInt(n[0]);
    if (num === 0) return "ZERO";
    if (num.toString().length > 9) return 'overflow';
    const rx = /(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})/;
    const nArr = ('000000000' + num).substr(-9).match(rx);
    if (!nArr) return "";
    let str = '';
    str += (nArr[1] != 0) ? (a[Number(nArr[1])] || b[nArr[1][0]] + ' ' + a[nArr[1][1]]) + ' CRORE ' : '';
    str += (nArr[2] != 0) ? (a[Number(nArr[2])] || b[nArr[2][0]] + ' ' + a[nArr[2][1]]) + ' LAKH ' : '';
    str += (nArr[3] != 0) ? (a[Number(nArr[3])] || b[nArr[3][0]] + ' ' + a[nArr[3][1]]) + ' THOUSAND ' : '';
    str += (nArr[4] != 0) ? (a[Number(nArr[4])] || b[nArr[4][0]] + ' ' + a[nArr[4][1]]) + ' HUNDRED ' : '';
    str += (nArr[5] != 0) ? ((str != '') ? 'AND ' : '') + (a[Number(nArr[5])] || b[nArr[5][0]] + ' ' + a[nArr[5][1]]) : '';
    return 'RUPEES ' + str.trim() + ' ONLY';
  };

  const netAmount = Number(totals?.netAmount || totals?.amount || 0);

  return (
    <div className="bg-white p-4 print-container" ref={ref}>
      <div className="w-[216mm] min-h-[356mm] mx-auto bg-white print-page relative text-[#374151] font-sans overflow-hidden">
        
        <div className="flex flex-col h-[356mm] pt-4 pb-2 px-6">
          
          {/* Header */}
          <div className="flex w-full mb-4 relative pl-[110px]">
            <div className="w-[100px] h-[140px] absolute top-0 left-0 z-10 flex flex-col items-center justify-start pt-2" 
                 style={{ backgroundColor: '#114b4c', clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)' }}>
               <div className="bg-white rounded-full p-1 mt-1">
                 <img 
                   src={billSettings?.logo || "/DP-logo.png"} 
                   alt="Logo" 
                   className="w-16 h-16 rounded-full object-contain" 
                 />
               </div>
            </div>

            <div className="flex-1 pl-2 pt-1">
              <h1 className="text-[26px] font-bold tracking-wide">
                <span className="text-[#114b4c]">DOLPHIN </span>
                <span className="text-[#d97706]">PUBLICATIONS</span>
              </h1>
              
              <div className="flex items-center my-1 w-[80%]">
                <div className="flex-1 border-b-2 border-gray-200"></div>
                <span className="px-3 text-[12px] font-bold text-[#114b4c] tracking-widest">{isReturn ? "TAX RETURN" : "TAX INVOICE"}</span>
                <div className="flex-1 border-b-2 border-gray-200"></div>
              </div>

              <div className="grid grid-cols-1 gap-y-1 mt-2 text-[12px] text-gray-700 font-medium">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 text-[#114b4c] mt-0.5 shrink-0" />
                  <p>239, Keelapatti Street, <br/>Srivilliputtur - 626 125, <br/>Virudhunagar District, Tamil Nadu ( Code : 33 )</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-[#114b4c] shrink-0" />
                  <p>98653-06197, 89256-77710</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-[#114b4c] shrink-0" />
                    <p>dolphin.pub2005@gmail.com</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-[#114b4c] shrink-0" />
                    <p>www.kalvidolphin.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-bold text-[#114b4c]">
                  <FileText className="w-3 h-3 shrink-0" />
                  <p>GSTIN : 33CAEPK4827P1ZC</p>
                </div>
              </div>
            </div>

            <div className="w-[180px] shrink-0">
               <div className="border border-gray-300 rounded-lg overflow-hidden relative pb-2 bg-white flex shadow-sm">
                  <div className="flex-1">
                    <div className="bg-[#114b4c] text-white text-[12px] font-bold text-center py-1">
                      {isReturn ? "RETURN SUMMARY" : "INVOICE SUMMARY"}
                    </div>
                    <div className="px-2 pt-2 pb-1">
                       <p className="text-[12px] font-bold text-gray-600">{isReturn ? "Return No." : "Bill No."}</p>
                       <p className="text-sm font-extrabold text-[#114b4c] leading-tight mb-2 border-b border-gray-100 pb-1">{info?.returnNo || info?.billNo}</p>
                       <p className="text-[12px] font-bold text-gray-600 mt-1">Date</p>
                       <p className="text-xs font-bold text-[#114b4c]">{info?.date}</p>
                    </div>
                  </div>
                  <div className="w-[70px] border-l border-gray-200 flex flex-col items-center justify-center p-1 bg-gray-50">
                    {billSettings?.enableEInvoice ? (
                       <>
                         <QRCodeSVG value={`Bill No: ${info?.billNo}, Date: ${info?.date}, Amount: ${netAmount}`} size={56} level={"L"} />
                         <p className="text-[9px] font-bold text-gray-500 mt-1">Scan to Verify</p>
                       </>
                    ) : (
                       <div className="w-[56px] h-[56px] border border-dashed border-gray-300 rounded flex items-center justify-center">
                       </div>
                    )}
                  </div>
               </div>
            </div>
          </div>

          {billSettings?.enableEInvoice && (
            <div className="border border-gray-300 rounded-sm flex items-center justify-between px-3 py-1.5 text-[12px] mb-2 bg-gray-50">
               <div className="flex items-center gap-4">
                 <span className="font-bold">IRN :</span>
                 <span className="text-gray-600">{info?.irn || "-"}</span>
               </div>
               <div className="flex items-center gap-6 border-l border-gray-300 pl-4">
                 <div>
                    <span className="font-bold">Ack No : </span>
                    <span className="text-gray-600">{info?.ackNo || "-"}</span>
                 </div>
                 <div>
                    <span className="font-bold">Ack Date : </span>
                    <span className="text-gray-600">{info?.ackDate || "-"}</span>
                 </div>
               </div>
            </div>
          )}

          <div className="flex gap-2 mb-2 h-[120px]">
            <div className="w-[45%] border border-gray-300 rounded-sm overflow-hidden flex flex-col">
               <div className="bg-[#114b4c] text-white px-2 py-1 flex justify-between items-center text-[12px]">
                  <div className="flex items-center gap-2">
                     <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                     <span className="font-bold uppercase tracking-wider">{isReturn ? "RETURN FROM" : "BILL TO"}</span>
                  </div>
                  <span className="font-medium text-[12px]">Mob. No : {customer?.mobile || customer?.phone}</span>
               </div>
               <div className="p-2 text-[12px] leading-tight flex-1 flex flex-col font-medium uppercase">
                 {customer?.school && <p className="font-bold mb-0.5">{customer?.school}</p>}
                 <p className="whitespace-pre-line">{customer?.address1}</p>
                 {customer?.address2 && <p>{customer?.address2}</p>}
                 <p>{customer?.city}</p>
                 {customer?.district && <p>{customer?.district}</p>}
                 <p className="mt-auto">
                    <span className="font-bold">GST NO : </span> {customer?.gstin || "-"}
                 </p>
                 <p>
                    <span className="font-bold">Phone No : </span> {customer?.phone}
                 </p>
               </div>
            </div>

            <div className="w-[55%] flex flex-col gap-0 border border-gray-300 rounded-sm overflow-hidden text-[12px] font-medium">
               <div className="flex border-b border-gray-200 h-1/4">
                 <div className="w-[35%] bg-gray-50 flex items-center gap-2 px-2 border-r border-gray-200 font-bold">
                    <Truck className="w-3.5 h-3.5 text-[#114b4c]" /> TRANSPORT
                 </div>
                 <div className="flex-1 px-3 flex items-center uppercase">
                    {info?.transport}
                 </div>
               </div>
               <div className="flex border-b border-gray-200 h-1/4">
                 <div className="w-[35%] bg-gray-50 flex items-center gap-2 px-2 border-r border-gray-200 font-bold">
                    <Map className="w-3.5 h-3.5 text-[#114b4c]" /> DESTINATION
                 </div>
                 <div className="flex-1 px-3 flex items-center uppercase">
                    {info?.destination}
                 </div>
               </div>
               <div className="flex border-b border-gray-200 h-1/4">
                 <div className="w-[35%] bg-gray-50 flex items-center gap-2 px-2 border-r border-gray-200 font-bold">
                    <Package className="w-3.5 h-3.5 text-[#114b4c]" /> NO. OF BUNDLES
                 </div>
                 <div className="flex-1 px-3 flex items-center gap-2">
                    <span className="flex-1">{info?.bundles}</span>
                    <span className="border-l border-gray-200 pl-2 h-full flex items-center font-bold">
                       LR Date : <span className="text-[#d97706] ml-1">{info?.lrDate}</span>
                    </span>
                 </div>
               </div>
               <div className="flex border-b border-gray-200 h-1/4">
                 <div className="w-[35%] bg-gray-50 flex items-center gap-2 px-2 border-r border-gray-200 font-bold">
                    <FileText className="w-3.5 h-3.5 text-[#114b4c]" /> LR NO
                 </div>
                 <div className="flex-1 px-3 flex items-center uppercase">
                    {info?.lrNo}
                 </div>
               </div>
               <div className="flex h-1/4">
                 <div className="w-[35%] bg-gray-50 flex items-center gap-2 px-2 border-r border-gray-200 font-bold">
                    <Receipt className="w-3.5 h-3.5 text-[#114b4c]" /> E WAY BILL NO
                 </div>
                 <div className="flex-1 px-3 flex items-center uppercase">
                    {info?.eWayBillNo || "-"}
                 </div>
               </div>
            </div>
          </div>

          <div className="border border-[#114b4c] rounded-sm overflow-hidden flex-1 flex flex-col mb-2">
             <table className="w-full text-[12px] text-center border-collapse h-full flex flex-col">
                <thead>
                   <tr className="bg-[#114b4c] text-white flex w-full">
                      <th className="py-1 px-1 w-[8%] font-bold border-r border-[#195f60]">S.NO</th>
                      <th className="py-1 px-2 flex-1 text-left font-bold border-r border-[#195f60]">PARTICULARS</th>
                      <th className="py-1 px-2 w-[12%] font-bold border-r border-[#195f60]">RATE (₹)</th>
                      <th className="py-1 px-2 w-[10%] font-bold border-r border-[#195f60]">QTY</th>
                      <th className="py-1 px-2 w-[15%] font-bold border-r border-[#195f60]">TEACHERS COPY</th>
                      <th className="py-1 px-2 w-[15%] font-bold">AMOUNT (₹)</th>
                   </tr>
                </thead>
                <tbody className="flex-1 flex flex-col font-medium">
                   <tr className="border-b border-gray-200 flex w-full min-h-[16px] items-center">
                      <td className="border-r border-gray-200 w-[8%]"></td>
                      <td className="border-r border-gray-200 flex-1 text-left px-2 py-0.5 uppercase text-[12px] font-extrabold text-slate-800">
                         PRINTED BOOKS - HSN - {info?.hsnCode || "49011010"}
                      </td>
                      <td className="border-r border-gray-200 w-[12%]"></td>
                      <td className="border-r border-gray-200 w-[10%]"></td>
                      <td className="border-r border-gray-200 w-[15%]"></td>
                      <td className="w-[15%]"></td>
                   </tr>
                   {paddedItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200 flex w-full min-h-[15px] items-center">
                         <td className="border-r border-gray-200 w-[8%] text-[#d97706] font-bold py-0.5">{item?.itemName || item?.particulars ? idx + 1 : ""}</td>
                         <td className="border-r border-gray-200 flex-1 text-left px-2 py-0.5 uppercase text-[12px] font-bold">{item?.itemName || item?.particulars || ""}</td>
                         <td className="border-r border-gray-200 w-[12%] py-0.5">{item?.rate ? Number(item.rate).toFixed(2) : ""}</td>
                         <td className="border-r border-gray-200 w-[10%] py-0.5">{item?.qty || ""}</td>
                         <td className="border-r border-gray-200 w-[15%] py-0.5">{item?.itemName || item?.particulars ? (item?.teachersCopy || "0") : ""}</td>
                         <td className="text-right px-2 w-[15%] text-[#114b4c] font-bold py-0.5">{item?.amount ? Number(item.amount).toFixed(2) : ""}</td>
                      </tr>
                   ))}
                   {/* Filler row to stretch borders to bottom */}
                   <tr className="flex-1 flex w-full" style={{ backgroundSize: '100% 15px', backgroundImage: 'linear-gradient(to bottom, transparent 14px, #e5e7eb 14px)' }}>
                      <td className="border-r border-gray-200 w-[8%]"></td>
                      <td className="border-r border-gray-200 flex-1"></td>
                      <td className="border-r border-gray-200 w-[12%]"></td>
                      <td className="border-r border-gray-200 w-[10%]"></td>
                      <td className="border-r border-gray-200 w-[15%]"></td>
                      <td className="w-[15%]"></td>
                   </tr>
                </tbody>
             </table>

             <div className="mt-auto border-t border-[#114b4c] flex bg-gray-50/50 min-h-[40px]">
                <div className="w-[30%] p-2 flex items-center justify-center">
                   <div className="bg-[#e4ecec] text-[#114b4c] font-bold text-[12px] py-1 px-4 rounded-sm border border-[#c4dbdb]">
                      GST EXEMPTED GOODS
                   </div>
                </div>
                
                <div className="flex-1 border-l border-[#114b4c] flex flex-col text-[12px] font-bold justify-center">
                   <div className="flex justify-between px-3 py-[1px]">
                      <span>Sub Total</span>
                      <span>{totals?.grossAmount ? Number(totals.grossAmount).toFixed(2) : "0.00"}</span>
                   </div>
                   <div className="flex justify-between px-3 py-[1px]">
                      <span className="flex items-center gap-6">Discount <span className="font-normal text-gray-500">{billSettings?.discountPercent || 0}%</span></span>
                      <span>{billSettings?.discountAmount ? Number(billSettings.discountAmount).toFixed(2) : "0.00"}</span>
                   </div>
                   <div className="flex justify-between px-3 py-[1px]">
                      <span>Freight</span>
                      <span>{billSettings?.freight ? Number(billSettings.freight).toFixed(2) : "0.00"}</span>
                   </div>
                </div>

                <div className="w-[35%] bg-[#114b4c] text-white flex items-center justify-between px-3 relative">
                   <div className="absolute left-0 top-0 h-full w-4 bg-[#114b4c] -ml-2 skew-x-[-15deg] border-l border-[#114b4c]"></div>
                   
                   <span className="font-bold text-[12px] z-10">Net Amount</span>
                   <span className="font-bold text-[16px] text-[#f89b33] z-10">₹ {netAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
             </div>
          </div>

          <div className="border border-[#e5e7eb] rounded-sm px-2 py-1 text-[12px] mb-2 flex items-center">
             <span className="font-bold mr-2">Amount (Words) :</span>
             <span className="text-[#d97706] font-bold uppercase tracking-wider">{numberToWords(netAmount)}</span>
          </div>

          <div className="flex justify-between items-start mb-2 pt-1 h-[65px]">
             <div className="w-[40%] text-[12px]">
                <div className="flex items-center gap-1 font-bold mb-1">
                   <Receipt className="w-3.5 h-3.5 text-[#114b4c]" />
                   TERMS AND CONDITIONS
                </div>
                <ol className="list-decimal pl-4 space-y-0.5">
                   <li>If you wish to return the books, you must return them within a month.</li>
                   {billSettings?.terms?.split('\n').map((term, i) => (
                      term.trim() ? <li key={i}>{term}</li> : null
                   ))}
                </ol>
             </div>
             <div className="text-center flex flex-col items-center">
                <p className="font-bold text-[12px] mb-2">For DOLPHIN PUBLICATIONS</p>
                <div className="h-[25px] flex items-center justify-center">
                  {digitalSignature ? (
                    <img src={digitalSignature} alt="Signature" className="h-[25px] object-contain" />
                  ) : (
                    <div className="font-['Brush_Script_MT'] text-[18px] text-[#114b4c]">Dolphin</div>
                  )}
                </div>
                <div className="w-32 border-t border-gray-400 mt-1"></div>
                <p className="text-[12px] font-bold mt-0.5">Authorised Signatory</p>
             </div>
             <div className="w-[30%] flex flex-col items-center justify-center h-full">
                <p className="font-['Brush_Script_MT'] text-[32px] text-[#114b4c] leading-none mb-1">Thank you</p>
                <p className="font-bold text-[12px] tracking-widest text-gray-700">FOR YOUR BUSINESS!</p>
             </div>
          </div>

          <div className="break-inside-avoid w-full flex flex-col" style={{ pageBreakInside: 'avoid' }}>
            <div className="relative flex items-center py-2 mb-1">
               <div className="flex-1 border-t-2 border-dashed border-gray-400"></div>
               <div className="px-2 bg-white flex items-center gap-1 text-gray-500 font-bold text-[12px]">
                  <Scissors className="w-3.5 h-3.5" /> CUT HERE
               </div>
               <div className="flex-1 border-t-2 border-dashed border-gray-400"></div>
            </div>

            <div className="border border-[#114b4c] rounded-sm flex h-[115px] bg-gray-50/30">
               <div className="w-[30px] bg-[#114b4c] text-white flex items-center justify-center relative overflow-hidden shrink-0">
                  <span className="transform -rotate-90 whitespace-nowrap text-[12px] font-bold tracking-widest absolute">
                     RECEIPT / PAYMENT SLIP
                  </span>
               </div>
               
               <div className="flex-1 p-2 flex gap-4 text-[12px]">
                  <div className="w-[50%] flex flex-col font-medium pr-2 uppercase">
                     <div className="flex justify-between font-bold mb-0.5">
                        <span>To :</span>
                        <span>Mob. No : {customer?.mobile || customer?.phone}</span>
                     </div>
                     {customer?.school && <p className="font-bold">{customer?.school}</p>}
                     <p className="whitespace-pre-line">{customer?.address1}</p>
                     {customer?.address2 && <p>{customer?.address2}</p>}
                     <p>{customer?.city}</p>
                     {customer?.district && <p>{customer?.district}</p>}
                     <p><span className="font-bold">GST NO : </span> {customer?.gstin || "-"}</p>
                     <p><span className="font-bold">Phone No : </span> {customer?.phone}</p>
                  </div>
                  
                  <div className="w-[50%] flex flex-col justify-between font-medium pl-2 border-l border-gray-200">
                     <div className="flex">
                        <span className="w-[35%] font-bold">Bill No</span>
                        <span>: {info?.returnNo || info?.billNo}</span>
                     </div>
                     <div className="flex">
                        <span className="w-[35%] font-bold">Transport</span>
                        <span className="uppercase">: {info?.transport}</span>
                     </div>
                     <div className="flex">
                        <span className="w-[35%] font-bold">Destination</span>
                        <span className="uppercase">: {info?.destination}</span>
                     </div>
                     <div className="flex">
                        <span className="w-[35%] font-bold">No. of Bundles</span>
                        <span>: {info?.bundles}</span>
                     </div>
                     <div className="flex">
                        <span className="w-[35%] font-bold">LR No</span>
                        <span>: {info?.lrNo}</span>
                     </div>
                     <div className="flex">
                        <span className="w-[35%] font-bold">LR Date</span>
                        <span>: {info?.lrDate}</span>
                     </div>
                     <div className="flex">
                        <span className="w-[35%] font-bold">Booking</span>
                        <span className="font-bold">: PAID <span className="text-[#d97706]">/ TO PAY</span></span>
                     </div>
                  </div>
               </div>

               <div className="w-[180px] p-2 flex flex-col justify-between items-center border-l border-gray-200 bg-white">
                  <div className="w-full border border-gray-300 rounded-sm p-1.5 flex flex-col items-center mt-1">
                     <span className="text-[12px] font-bold text-gray-700">AMOUNT PAYABLE</span>
                     <span className="text-[16px] font-bold text-[#114b4c]">₹ {netAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  
                  <div className="w-full space-y-4 text-[12px] font-bold">
                     <div className="flex justify-between items-end border-b border-gray-400 pb-0.5">
                        <span>Date</span>
                        <span>:</span>
                     </div>
                     <div className="flex justify-between items-end border-b border-gray-400 pb-0.5">
                        <span>Signature</span>
                        <span>:</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="mt-2 bg-[#114b4c] text-white text-[12px] font-bold px-4 py-1 flex justify-between items-center rounded-sm">
               <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  Goods once sold will not be taken back.
               </div>
               <div className="flex gap-16">
                  <span>E. & O.E.</span>
                  <div className="flex gap-1 items-center opacity-70">
                     {[...Array(6)].map((_, i) => (
                       <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
                     ))}
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

export default Template1;
