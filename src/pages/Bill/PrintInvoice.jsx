import React, { forwardRef } from 'react';

const PrintInvoice = forwardRef(({ billData }, ref) => {
  if (!billData) return null;

  const {
    customer,
    billInfo,
    items,
    totals
  } = billData;

  // Convert number to words helper (simple version for demo)
  const numberToWords = (num) => {
    // A full implementation would go here. Returning a placeholder for now, 
    // or we can just use the provided text if it's static in demo.
    return "RUPEES " + num + " ONLY";
  };

  return (
    <div ref={ref} className="p-6 bg-white text-black font-sans w-full mx-auto" style={{ width: '210mm', minHeight: '295mm' }}>
      <style>{`
        @media print {
          @page { margin: 0; size: A4; }
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      
      {/* Outer Border */}
      <div className="border-2 border-slate-800 h-[280mm] flex flex-col">
        
        {/* HEADER SECTION */}
        <div className="text-center pb-2 border-b-2 border-slate-800 relative">
          <div className="absolute top-4 left-4">
            <img src="/src/assets/DP-logo.png" alt="Logo" className="w-24 h-auto" />
          </div>
          <div className="pt-2">
            <h3 className="font-bold text-sm tracking-widest uppercase text-red-700">Tax Invoice</h3>
            <h1 className="text-3xl font-extrabold text-blue-800 mt-1 uppercase tracking-wide">Dolphin Publications</h1>
            <p className="text-sm font-semibold mt-1">239, Keelapatti Street,</p>
            <p className="text-sm font-semibold">Srivilliputtur - 626 125. Virudhunagar District</p>
            <p className="text-sm font-semibold">Tamil Nadu (Code : 33)</p>
            <p className="text-sm font-bold mt-1">GSTIN : 33CAEPK4827P1ZC</p>
            <p className="text-sm font-semibold">Mobile : 98653-06197, 89256-77710</p>
            <p className="text-sm font-semibold">E-Mail : dolphin.pub2005@gmail.com <span className="ml-4">Website : www.kalvidolphin.com</span></p>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="flex border-b-2 border-slate-800">
          
          {/* Bill To (Left) */}
          <div className="w-3/5 border-r-2 border-slate-800 p-2 text-sm leading-tight font-bold">
            <div className="flex justify-between">
              <span className="text-blue-800">BILL TO :</span>
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
                <span className="w-16">Bill No :</span>
                <span className="text-blue-800 text-base">{billInfo?.billNo || "8199"}</span>
              </div>
              <div className="w-1/2 p-1 flex items-center">
                <span>Date : {billInfo?.date || "31/07/2026"}</span>
              </div>
            </div>
            
            <div className="flex border-b border-slate-800 flex-1">
              <div className="w-1/2 p-1 border-r border-slate-800 flex items-center">TRANSPORT</div>
              <div className="w-1/2 p-1 flex items-center font-normal uppercase">{billInfo?.transport || "DIRECT SALES"}</div>
            </div>
            
            <div className="flex border-b border-slate-800 flex-1">
              <div className="w-1/2 p-1 border-r border-slate-800 flex items-center">DESTINATION</div>
              <div className="w-1/2 p-1 flex items-center font-normal uppercase">{billInfo?.destination || ""}</div>
            </div>

            <div className="flex border-b border-slate-800 flex-1">
              <div className="w-1/2 p-1 border-r border-slate-800 flex items-center">
                NO. OF BUNDLES <span className="ml-2 font-normal">{billInfo?.bundles || "0"}</span>
              </div>
              <div className="w-1/2 p-1 flex items-center">
                LR Date : <span className="ml-1 font-normal">{billInfo?.lrDate || "31/07/2026"}</span>
              </div>
            </div>

            <div className="flex border-b border-slate-800 flex-1">
              <div className="w-1/2 p-1 border-r border-slate-800 flex items-center">LR NO</div>
              <div className="w-1/2 p-1 flex items-center font-normal uppercase">{billInfo?.lrNo || ""}</div>
            </div>

            <div className="flex flex-1">
              <div className="w-1/2 p-1 border-r border-slate-800 flex items-center">E WAY BILL NO</div>
              <div className="w-1/2 p-1 flex items-center font-normal uppercase">{billInfo?.eWayBillNo || ""}</div>
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
                <th className="w-16 border-r-2 border-slate-800 py-2 text-red-800">Qty</th>
                <th className="w-20 border-r-2 border-slate-800 py-2 text-red-800 leading-tight">Teachers<br/>Copy</th>
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
                <td className="border-r-2 border-slate-800"></td>
                <td></td>
              </tr>
              
              {items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="border-r-2 border-slate-800 text-center py-1">{idx + 1}</td>
                  <td className="border-r-2 border-slate-800 px-2 py-1 font-medium">{item.itemName}</td>
                  <td className="border-r-2 border-slate-800 text-right px-2 py-1 font-medium">{Number(item.rate).toFixed(2)}</td>
                  <td className="border-r-2 border-slate-800 text-center py-1 font-medium">{item.qty}</td>
                  <td className="border-r-2 border-slate-800 text-center py-1 font-medium">{item.teachersCopy}</td>
                  <td className="text-right px-2 py-1 font-medium">{Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
              
              {/* Fill remaining empty space (simplistic approach for layout) */}
              <tr className="h-full">
                <td className="border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800"></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TOTALS SECTION */}
        <div className="flex border-t-2 border-slate-800 font-bold text-sm bg-slate-50">
          <div className="flex-1 text-center py-1 flex items-center justify-center">Total</div>
          <div className="w-16 border-l-2 border-slate-800 border-r-2 text-center py-1 flex items-center justify-center">{totals?.qty || "0"}</div>
          <div className="w-20 border-r-2 border-slate-800"></div>
          <div className="w-32 text-right px-2 py-1 flex items-center justify-end">{Number(totals?.amount || 0).toFixed(2)}</div>
        </div>

        <div className="flex border-t-2 border-b-2 border-slate-800 font-bold text-sm bg-slate-100">
          <div className="flex-1 px-2 py-1">GST EXEMPTED GOODS</div>
          <div className="w-40 border-l-2 border-r-2 border-slate-800 text-center py-1 text-blue-800">Net Amount</div>
          <div className="w-32 text-right px-2 py-1">{Number(totals?.amount || 0).toFixed(2)}</div>
        </div>

        {/* FOOTER SECTION */}
        <div className="px-2 py-1 font-bold text-sm border-b-2 border-slate-800">
          <span className="text-blue-800">Amount (Words) : </span>
          <span className="uppercase">{numberToWords(totals?.amount || 0)}</span>
        </div>

        <div className="flex justify-between p-2 pb-8 h-32 relative">
          <div className="w-1/2">
            <h4 className="text-blue-800 font-bold text-sm underline mb-1">Terms and Conditions</h4>
            <p className="text-xs font-semibold">1. If you wish to return the books, you must return them within a month.</p>
          </div>
          <div className="w-1/2 flex flex-col justify-between items-end">
            <h4 className="text-blue-800 font-bold text-sm">For DOLPHIN PUBLICATIONS</h4>
            <span className="font-bold text-sm mt-10">Authorised Signatory</span>
          </div>
        </div>

      </div>
    </div>
  );
});

export default PrintInvoice;
