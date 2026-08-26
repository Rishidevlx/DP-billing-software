import React, { forwardRef } from 'react';

const MinimalistTemplate = forwardRef(({ billData }, ref) => {
  if (!billData) return null;
  const { customer, billInfo, items, totals } = billData;
  const digitalSignature = localStorage.getItem('digitalSignature');
  
  const padItems = (itemsArray, minLength) => {
    const arr = itemsArray || [];
    if (arr.length >= minLength) return arr;
    const padding = new Array(minLength - arr.length).fill({
      id: '', itemName: '', rate: '', qty: '', amount: ''
    });
    return [...arr, ...padding];
  };
  const paddedItems = padItems(items, 6); // fewer rows

  return (
    <div className="bg-white p-4 print-container" ref={ref}>
      <div className="w-[210mm] min-h-[297mm] mx-auto bg-white print-page relative text-[#1f2937] font-sans">
        
        <div className="flex flex-col h-[280mm] px-12 py-16">
          
          {/* Header Row */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#374151] rounded-full flex items-center justify-center text-white font-serif italic text-xl">
                 Dp
              </div>
              <div className="leading-tight">
                 <h2 className="text-sm font-bold tracking-widest uppercase">Dolphin</h2>
                 <p className="text-[10px] tracking-widest uppercase text-slate-500">Publications</p>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold tracking-[0.2em] text-[#374151]">INVOICE</h1>
          </div>

          {/* Light Grey Block for Details */}
          <div className="bg-[#f3f4f6] p-8 rounded-sm mb-10 flex justify-between">
            {/* Left side: Issued To & Payment Info */}
            <div className="text-[11px] w-[50%]">
              <div className="mb-6">
                <p className="font-bold tracking-widest uppercase mb-2">ISSUED TO:</p>
                <p className="font-bold text-sm">{customer?.name || customer?.school || 'Customer Name'}</p>
                <p className="mt-1">{customer?.address1}</p>
                {customer?.address2 && <p>{customer?.address2}</p>}
                <p>{customer?.district || customer?.city}</p>
                <p>{customer?.mobile || customer?.phone}</p>
              </div>
              
              <div>
                 <p className="font-bold tracking-widest uppercase mb-2">PAYMENT INFO:</p>
                 <p>Bank: State Bank of India</p>
                 <p>Account Name: Dolphin Publications</p>
                 <p>Account No: 1234567890123</p>
              </div>
            </div>
            
            {/* Right side: Invoice Details */}
            <div className="text-[11px] w-[200px] text-right">
              <div className="flex justify-between py-1">
                <span className="uppercase tracking-widest">INVOICE NO:</span>
                <span className="font-bold">{billInfo?.billNo}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="uppercase tracking-widest">DATE:</span>
                <span className="font-bold">{billInfo?.date}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="uppercase tracking-widest">DUE DATE:</span>
                <span className="font-bold">{billInfo?.date}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 mb-8">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-y border-[#374151]">
                  <th className="py-3 px-2 text-left font-bold uppercase tracking-widest text-[10px]">Description</th>
                  <th className="py-3 px-2 text-center font-bold uppercase tracking-widest text-[10px] w-24">Rate</th>
                  <th className="py-3 px-2 text-center font-bold uppercase tracking-widest text-[10px] w-20">Qty</th>
                  <th className="py-3 px-2 text-right font-bold uppercase tracking-widest text-[10px] w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {paddedItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#e5e7eb] last:border-b-0">
                    <td className="py-4 px-2 font-medium">{item?.itemName || item?.particulars || item?.itemDetails || ""}</td>
                    <td className="py-4 px-2 text-center">{item?.rate ? `₹ ${Number(item.rate).toFixed(2)}` : ""}</td>
                    <td className="py-4 px-2 text-center">{item?.qty || ""}</td>
                    <td className="py-4 px-2 text-right font-medium">{item?.amount ? `₹ ${Number(item.amount).toFixed(2)}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Subtotals & Grand Total border line */}
            <div className="w-full border-t border-[#374151] mt-2 pt-4 flex justify-end text-[11px]">
              <div className="w-[200px]">
                <div className="flex justify-between py-1 font-bold">
                   <span className="uppercase tracking-widest">SUBTOTAL</span>
                   <span>₹ {Number(totals?.grossAmount || 0).toFixed(2)}</span>
                </div>
                
                {billData.billSettings?.discountAmount > 0 && (
                  <div className="flex justify-between py-1">
                     <span className="uppercase tracking-widest">DISCOUNT</span>
                     <span>- ₹ {Number(billData.billSettings?.discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}
                {billData.billSettings?.freight > 0 && (
                  <div className="flex justify-between py-1">
                     <span className="uppercase tracking-widest">FREIGHT</span>
                     <span>+ ₹ {Number(billData.billSettings?.freight || 0).toFixed(2)}</span>
                  </div>
                )}
                {billData.billSettings?.roundOff && Number(billData.billSettings.roundOff) !== 0 ? (
                  <div className="flex justify-between py-1">
                     <span className="uppercase tracking-widest">ROUND OFF</span>
                     <span>₹ {Number(billData.billSettings?.roundOff || 0).toFixed(2)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between py-2 mt-2 font-bold text-sm">
                   <span className="uppercase tracking-widest">TOTAL</span>
                   <span>₹ {Number(totals?.netAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Area */}
          <div className="flex justify-end items-end mt-auto text-center w-[200px] ml-auto">
             <div>
                <p className="font-bold tracking-widest uppercase text-[10px] mb-8">THANK YOU</p>
                <div className="h-[40px] relative w-full mb-1 flex justify-center">
                   {digitalSignature ? (
                      <img src={digitalSignature} alt="Signature" className="h-full object-contain mix-blend-multiply" />
                   ) : (
                      <div className="w-3/4 border-b border-black"></div>
                   )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
});

export default MinimalistTemplate;
