import React, { forwardRef } from 'react';

const PrintReturn = forwardRef(({ returnData }, ref) => {
  if (!returnData) return null;

  const {
    customer,
    returnInfo,
    items,
    totals
  } = returnData;

  // Convert number to words helper
  const numberToWords = (num) => {
    if (!num) return "ZERO";
    const a = ['','ONE ','TWO ','THREE ','FOUR ', 'FIVE ','SIX ','SEVEN ','EIGHT ','NINE ','TEN ','ELEVEN ','TWELVE ','THIRTEEN ','FOURTEEN ','FIFTEEN ','SIXTEEN ','SEVENTEEN ','EIGHTEEN ','NINETEEN '];
    const b = ['', '', 'TWENTY','THIRTY','FORTY','FIFTY', 'SIXTY','SEVENTY','EIGHTY','NINETY'];
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'CRORE ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'LAKH ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'THOUSAND ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'HUNDRED ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'AND ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return "RUPEES " + str.trim() + " ONLY";
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
      
      {/* Outer Border */}
      <div className={`border-2 border-slate-800 flex flex-col`} style={{ height: '271mm', pageBreakInside: 'avoid' }}>
        
        {/* HEADER SECTION */}
        <div className="flex border-b-2 border-slate-800 h-[155px]">
          <div className="flex-1 flex border-r-2 border-slate-800 p-1">
            <div className="w-[130px] flex justify-center items-center shrink-0">
              <img src="/src/assets/DP-logo.png" alt="Logo" className="w-[120px] h-auto" />
            </div>
            <div className="flex-1 text-center flex flex-col justify-center">
              <h3 className="font-bold text-[10px] tracking-widest uppercase text-red-700">SALES RETURN INVOICE</h3>
              <h1 className="text-3xl font-extrabold text-blue-800 uppercase tracking-wider mt-0.5" style={{ fontFamily: 'Arial, sans-serif', transform: 'scaleY(1.1)' }}>Dolphin Publications</h1>
              <div className="border-b border-slate-800 my-1 mx-2"></div>
              <div className="text-[11px] font-bold leading-tight text-slate-900 pb-1">
                <p>239, Keelapatti Street,</p>
                <p>Srivilliputtur - 626 125. Virudhunagar District</p>
                <p>Tamil Nadu (Code : 33)</p>
                <p className="text-[12px] mt-0.5">GSTIN : 33CAEPK4827P1ZC</p>
                <p>Mobile : 98653-06197, 89256-77710</p>
                <p>E-Mail : dolphin.pub2005@gmail.com <span className="ml-2">Website : www.kalvidolphin.com</span></p>
              </div>
            </div>
          </div>
          <div className="w-[155px] flex justify-center items-center shrink-0">
              <div className="w-[110px] h-[110px]"></div>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="flex border-b-2 border-slate-800">
          
          {/* Bill To (Left) */}
          <div className="w-3/5 border-r-2 border-slate-800 p-1 px-2 text-sm leading-tight font-bold">
            <div className="flex justify-between">
              <span className="text-blue-800">RETURN FROM :</span>
              {customer?.mobile && <span>Mob. No : {customer.mobile}</span>}
            </div>
            <div className="mt-2 text-slate-900 uppercase">
              <p>{customer?.name || "THE HEAD MISTRESS,"}</p>
              <p>{customer?.school || "THIYAGARAJA HR SEC SCHOOL"}</p>
              <p>{customer?.address1 || "N.G.G. O. COLONY"}</p>
              <p>{customer?.address2 || "Srivilliputtur Taluk - 626125"}</p>
              <p>{customer?.district || "Virudhunagar District"}</p>
              <p>Tamil Nadu (Code : 33)</p>
              {customer?.phone && <p>Phone No : {customer.phone}</p>}
            </div>
          </div>

          {/* Bill Info (Right) */}
          <div className="w-2/5 flex flex-col text-sm font-bold">
            <div className="flex border-b border-slate-800 flex-1">
              <div className="w-1/2 p-1 border-r border-slate-800 flex items-center">
                <span className="w-20">Return No :</span>
                <span className="text-blue-800 text-base">{returnInfo?.returnNo || "001"}</span>
              </div>
              <div className="w-1/2 p-1 flex items-center">
                <span>Date : {returnInfo?.date || "31/07/2026"}</span>
              </div>
            </div>
            
            <div className="flex border-b border-slate-800 flex-1">
              <div className="w-1/2 p-1 border-r border-slate-800 flex items-center">ORIGINAL BILL NO</div>
              <div className="w-1/2 p-1 flex items-center font-normal uppercase">{returnInfo?.originalBillNo || ""}</div>
            </div>
            
            <div className="flex border-b border-slate-800 flex-1">
              <div className="w-1/2 p-1 border-r border-slate-800 flex items-center">TRANSPORT</div>
              <div className="w-1/2 p-1 flex items-center font-normal uppercase">{returnInfo?.transport || "RETURNED BY HAND"}</div>
            </div>

            <div className="flex flex-1">
              <div className="w-1/2 p-1 border-r border-slate-800 flex items-center">REASON</div>
              <div className="w-1/2 p-1 flex items-center font-normal uppercase">{returnInfo?.reason || "STOCK RETURN"}</div>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="flex-1 flex flex-col">
          <table className="w-full h-full table-fixed border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 text-sm bg-slate-100">
                <th className="w-12 border-r-2 border-slate-800 py-2">S.No</th>
                <th className="border-r-2 border-slate-800 py-2 text-red-800">Particulars</th>
                <th className="w-24 border-r-2 border-slate-800 py-2 text-red-800">Rate</th>
                <th className="w-20 border-r-2 border-slate-800 py-2 text-red-800">Qty</th>
                <th className="w-32 py-2 text-red-800">Amount</th>
              </tr>
            </thead>
            <tbody className="align-top font-bold text-sm">
              {/* Header row in items for HSN */}
              <tr>
                <td className="border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800 px-2 py-1 font-extrabold text-black">PRINTED BOOKS - HSN - 49011010</td>
                <td className="border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800"></td>
                <td></td>
              </tr>
              {items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="border-r-2 border-slate-800 text-center py-1">{idx + 1}</td>
                  <td className="border-r-2 border-slate-800 px-2 py-1 font-medium">{item.itemName}</td>
                  <td className="border-r-2 border-slate-800 text-right px-2 py-1 font-medium">{Number(item.rate).toFixed(2)}</td>
                  <td className="border-r-2 border-slate-800 text-center py-1 font-medium">{item.qty}</td>
                  <td className="text-right px-2 py-1 font-medium">{Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
              
              {/* Fill remaining empty space (simplistic approach for layout) */}
              <tr className="h-full">
                <td className="border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800"></td>
                <td></td>
              </tr>
              {/* Totals Rows inside the table */}
              <tr>
                <td className="border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800 px-2 py-1 text-right">Total Return Quantity</td>
                <td className="border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800 text-center font-bold">{totals?.qty || "0"}</td>
                <td className="text-right px-2 py-1 font-bold"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex border-t-2 border-b-2 border-slate-800 font-bold text-sm bg-slate-100">
          <div className="flex-1 px-2 py-1">TOTAL RETURN AMOUNT DEDUCTED</div>
          <div className="w-40 border-l-2 border-r-2 border-slate-800 text-center py-1 text-blue-800">Net Return Value</div>
          <div className="w-32 text-right px-2 py-1">{Number(totals?.amount || 0).toFixed(2)}</div>
        </div>

        {/* FOOTER SECTION */}
        <div className="px-2 py-1 font-bold text-sm border-b-2 border-slate-800">
          <span className="text-blue-800">Amount (Words) : </span>
          <span className="uppercase">{numberToWords(Math.round(totals?.amount || 0))}</span>
        </div>

        <div className="flex justify-between p-2 pb-4 h-24 relative">
          <div className="w-1/2">
            <h4 className="text-blue-800 font-bold text-sm underline mb-1">Notes</h4>
            <p className="text-xs font-semibold">1. This return invoice reduces the total balance due by the customer.</p>
          </div>
          <div className="w-1/2 flex flex-col justify-between items-end">
            <h4 className="text-blue-800 font-bold text-sm">For DOLPHIN PUBLICATIONS</h4>
            <span className="font-bold text-sm mt-6">Authorised Signatory</span>
          </div>
        </div>

      </div>

      {/* CUT LINE */}
      <div className="relative flex items-center justify-center opacity-50" style={{ height: '5mm', marginTop: '1mm', marginBottom: '1mm' }}>
        <div className="absolute w-full border-t-2 border-dashed border-slate-600"></div>
        <span className="bg-white px-2 text-slate-600 text-lg relative z-10" style={{ transform: 'rotate(180deg)' }}>✂️</span>
      </div>

      {/* TEAR-OFF SLIP (Below Authorised Signatory) */}
      <div className="border-2 border-slate-800 flex font-bold text-sm bg-slate-100 tear-off" style={{ height: '61mm' }}>
        {/* Left Side: Address */}
        <div className="w-1/2 border-r-2 border-slate-800 p-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between text-blue-800 mb-1">
              <span>RETURN FROM :</span>
              {customer?.mobile && <span className="text-slate-800">Mob. No : {customer.mobile}</span>}
            </div>
            <div className="text-slate-900 uppercase leading-snug">
              <p>{customer?.name || "THE HEAD MISTRESS,"}</p>
              <p>{customer?.school || "THIYAGARAJA HR SEC SCHOOL"}</p>
              <p>{customer?.address1 || "N.G.G. O. COLONY"}</p>
              <p>{customer?.address2 || "Srivilliputtur Taluk - 626125"}</p>
              <p>{customer?.district || "Virudhunagar District"}</p>
              <p>Tamil Nadu (Code : 33)</p>
            </div>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="w-1/2 p-2 relative text-blue-800 flex flex-col gap-1 leading-snug">
          <div className="flex">
            <span className="w-28">Return No</span>
            <span className="mr-2">:</span>
            <span className="text-slate-900">{returnInfo?.returnNo || "001"}</span>
          </div>
          <div className="flex">
            <span className="w-28">Original Bill No</span>
            <span className="mr-2">:</span>
            <span className="text-slate-900 uppercase">{returnInfo?.originalBillNo || ""}</span>
          </div>
          <div className="flex">
            <span className="w-28">Transport</span>
            <span className="mr-2">:</span>
            <span className="text-slate-900 uppercase">{returnInfo?.transport || "RETURNED BY HAND"}</span>
          </div>
          <div className="flex">
            <span className="w-28">Reason</span>
            <span className="mr-2">:</span>
            <span className="text-slate-900 uppercase">{returnInfo?.reason || "STOCK RETURN"}</span>
          </div>

          <div className="absolute bottom-1 right-2">
            <img src="/src/assets/DP-logo.png" alt="Logo" className="w-16 h-auto opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
});

export default PrintReturn;
