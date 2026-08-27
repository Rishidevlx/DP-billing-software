import React, { forwardRef } from 'react';

const Template5 = forwardRef(({ data, type = 'bill' }, ref) => {
  if (!data) return null;
  const isReturn = type === 'return';
  const info = isReturn ? data.returnInfo : data.billInfo;
  const { customer, items, totals, billSettings } = data;
  
  const digitalSignature = localStorage.getItem('digitalSignature');
  
  const padItems = (itemsArray, minLength) => {
    const arr = itemsArray || [];
    if (arr.length >= minLength) return arr;
    const padding = new Array(minLength - arr.length).fill({
      id: '', itemName: '', rate: '', qty: '', amount: ''
    });
    return [...arr, ...padding];
  };
  const paddedItems = padItems(items, 8);

  return (
    <div className="bg-[#0f172a] p-4 print-container" ref={ref}>
      {/* 
        Note: For dark mode printing to work properly, 
        users MUST enable "Background graphics" in the print dialog.
      */}
      <div className="w-[210mm] min-h-[297mm] mx-auto bg-[#0f172a] print-page relative text-slate-300 font-sans border border-slate-800">
        
        {/* Neon Top Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <div className="flex flex-col h-[280mm] pt-16 pb-12 px-12 relative z-10">
          
          {/* Header Row */}
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                 <span className="font-bold text-white text-2xl font-serif italic">Dp</span>
              </div>
              <div className="leading-none">
                 <h1 className="font-bold text-2xl text-white tracking-wide">Dolphin</h1>
                 <p className="text-[11px] text-blue-400 font-semibold tracking-widest uppercase mt-1">Publications</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-black tracking-widest text-white/10 uppercase">{isReturn ? "RETURN" : "INVOICE"}</h2>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-3 gap-8 mb-12 text-[11px]">
            {/* Invoice To */}
            <div className="col-span-1">
              <p className="font-bold text-blue-400 uppercase tracking-widest mb-3 text-[10px]">{isReturn ? "RETURN FROM" : "INVOICE TO"}</p>
              <p className="font-bold text-sm text-white mb-2 uppercase">{customer?.name || customer?.school || 'Customer Name'}</p>
              <p className="text-slate-400 uppercase">{customer?.address1}</p>
              {customer?.address2 && <p className="text-slate-400 uppercase">{customer?.address2}</p>}
              <p className="text-slate-400 uppercase">{customer?.district || customer?.city}</p>
              <p className="text-slate-400 mt-2 uppercase">{customer?.mobile || customer?.phone}</p>
            </div>
            
            {/* Details */}
            <div className="col-span-1">
              <p className="font-bold text-blue-400 uppercase tracking-widest mb-3 text-[10px]">DETAILS</p>
              <div className="space-y-2 text-slate-300">
                 <div className="flex justify-between">
                    <span className="text-slate-500">{isReturn ? "Return No" : "Invoice No"}</span>
                    <span className="text-white font-medium uppercase">{info?.returnNo || info?.billNo}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="text-white font-medium">{info?.date}</span>
                 </div>
                 {isReturn ? (
                   <>
                     <div className="flex justify-between">
                        <span className="text-slate-500">Orig Bill No</span>
                        <span className="text-white font-medium uppercase">{info?.originalBillNo}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-slate-500">Reason</span>
                        <span className="text-white font-medium uppercase">{info?.reason || "STOCK RETURN"}</span>
                     </div>
                   </>
                 ) : (
                   <div className="flex justify-between">
                      <span className="text-slate-500">LR No</span>
                      <span className="text-white font-medium uppercase">{info?.lrNo}</span>
                   </div>
                 )}
              </div>
            </div>

            {/* Payment Info */}
            {!isReturn && (
            <div className="col-span-1">
              <p className="font-bold text-blue-400 uppercase tracking-widest mb-3 text-[10px]">PAYMENT INFO</p>
              <div className="space-y-2 text-slate-300">
                 <div className="flex justify-between">
                    <span className="text-slate-500">Bank</span>
                    <span className="text-white font-medium text-right">State Bank of India</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">Account</span>
                    <span className="text-white font-medium text-right">1234567890123</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">IFSC</span>
                    <span className="text-white font-medium text-right">SBIN000123</span>
                 </div>
              </div>
            </div>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 mb-8">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="py-3 px-4 text-left font-semibold uppercase tracking-widest text-[10px]">Item Description</th>
                  <th className="py-3 px-4 text-center font-semibold uppercase tracking-widest text-[10px] w-24">Price</th>
                  <th className="py-3 px-4 text-center font-semibold uppercase tracking-widest text-[10px] w-20">Qty</th>
                  <th className="py-3 px-4 text-right font-semibold uppercase tracking-widest text-[10px] w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {paddedItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-medium text-slate-200">{item?.itemName || item?.particulars || item?.itemDetails || ""}</td>
                    <td className="py-4 px-4 text-center text-slate-400">{item?.rate || ""}</td>
                    <td className="py-4 px-4 text-center text-slate-400">{item?.qty || ""}</td>
                    <td className="py-4 px-4 text-right font-bold text-white">{item?.amount ? Number(item.amount).toFixed(2) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="w-full flex justify-end mt-6 text-[11px]">
              <div className="w-[250px] bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex justify-between py-1 text-slate-300">
                   <span className="uppercase tracking-widest text-[10px]">{isReturn ? "Total Qty" : "Subtotal"}</span>
                   <span>{isReturn ? totals?.qty : `₹ ${Number(totals?.grossAmount || 0).toFixed(2)}`}</span>
                </div>
                
                {!isReturn && billSettings?.discountAmount > 0 && (
                  <div className="flex justify-between py-1 text-slate-300">
                     <span className="uppercase tracking-widest text-[10px]">Discount</span>
                     <span className="text-green-400">- ₹ {Number(billSettings?.discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}
                {!isReturn && billSettings?.freight > 0 && (
                  <div className="flex justify-between py-1 text-slate-300">
                     <span className="uppercase tracking-widest text-[10px]">Freight</span>
                     <span>+ ₹ {Number(billSettings?.freight || 0).toFixed(2)}</span>
                  </div>
                )}
                {!isReturn && billSettings?.roundOff && Number(billSettings.roundOff) !== 0 ? (
                  <div className="flex justify-between py-1 text-slate-300">
                     <span className="uppercase tracking-widest text-[10px]">Round Off</span>
                     <span>₹ {Number(billSettings?.roundOff || 0).toFixed(2)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between pt-4 mt-3 border-t border-slate-700 font-bold text-lg text-white">
                   <span className="uppercase tracking-widest text-sm self-center">TOTAL</span>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">₹ {Number(totals?.netAmount || totals?.amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Banner */}
          <div className="w-full flex justify-between items-end mt-auto h-[100px] border-t border-slate-800 pt-6">
             <div className="text-[10px] text-slate-500 w-[50%]">
                <p className="font-bold text-white mb-1 uppercase tracking-widest">Terms & Conditions</p>
                {isReturn ? (
                  <p>This return invoice reduces the total balance due by the customer.</p>
                ) : (
                  <>
                    <p>Please pay within 15 days of receiving this invoice.</p>
                    <p>Thank you for your business!</p>
                  </>
                )}
             </div>
             
             {/* Signature */}
             <div className="text-center w-[200px]">
                <div className="h-[40px] relative w-full mb-1 flex justify-center">
                   {digitalSignature ? (
                      <img src={digitalSignature} alt="Signature" className="h-full object-contain mix-blend-screen opacity-80" />
                   ) : (
                      <div className="w-3/4 border-b border-slate-700"></div>
                   )}
                </div>
                <div className="w-full pt-1">
                   <p className="text-[10px] text-slate-500 font-semibold tracking-wider">Authorized Signatory</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
});

export default Template5;
