import React, { forwardRef } from 'react';

const ModernTemplate = forwardRef(({ billData }, ref) => {
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
      <div className="w-[210mm] min-h-[297mm] mx-auto bg-white print-page relative text-[#374151] font-sans overflow-hidden">
        
        {/* Top Blue Edge Accent */}
        <div className="absolute top-0 left-0 w-[80%] h-4 bg-[#1e3a8a] rounded-br-2xl"></div>

        <div className="flex flex-col h-[285mm] pt-12 pb-6 px-10">
          
          {/* Header Row */}
          <div className="flex justify-between items-start mb-16 px-4 pt-4">
            <div className="flex items-center gap-2 text-[#1e3a8a]">
              <div className="w-8 h-8 rounded-full border-2 border-[#1e3a8a] flex items-center justify-center font-bold text-lg">
                 dp
              </div>
              <h2 className="font-bold text-xl tracking-wide">Dolphin Publications</h2>
            </div>
            
            <h1 className="text-5xl font-bold tracking-widest text-[#374151]">INVOICE</h1>
          </div>

          {/* Details Row */}
          <div className="flex justify-between items-start mb-10 px-4 text-[11px]">
            <div>
              <p className="font-bold text-[#1e3a8a] mb-2 text-xs">Issued To</p>
              <p className="font-semibold text-sm mb-1">{customer?.name || customer?.school || 'Customer Name'}</p>
              <p>{customer?.address1}</p>
              {customer?.address2 && <p>{customer?.address2}</p>}
              <p>{customer?.district || customer?.city}</p>
              <p className="mt-1">{customer?.mobile || customer?.phone}</p>
            </div>
            
            <div className="w-[220px]">
              <p className="font-bold text-[#1e3a8a] mb-2 text-xs">Invoice To</p>
              <div className="flex justify-between py-1">
                <span className="font-semibold">Invoice No:</span>
                <span>{billInfo?.billNo}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold">Date:</span>
                <span>{billInfo?.date}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold">Due Date:</span>
                <span>{billInfo?.date}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 px-4">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="border-b-2 border-[#1e3a8a] text-[#1e3a8a]">
                  <th className="py-2 px-2 text-left font-bold w-[50%]">Description</th>
                  <th className="py-2 px-2 text-center font-bold">Quantity</th>
                  <th className="py-2 px-2 text-center font-bold">Unit Price</th>
                  <th className="py-2 px-2 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {paddedItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#f3f4f6] last:border-b-0">
                    <td className="py-3 px-2 font-medium">{item?.itemName || item?.particulars || item?.itemDetails || ""}</td>
                    <td className="py-3 px-2 text-center">{item?.qty || ""}</td>
                    <td className="py-3 px-2 text-center">{item?.rate ? `₹ ${Number(item.rate).toFixed(2)}` : ""}</td>
                    <td className="py-3 px-2 text-right font-medium">{item?.amount ? `₹ ${Number(item.amount).toFixed(2)}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="w-full border-t border-[#f3f4f6] flex justify-end">
              <div className="w-[280px]">
                <div className="flex justify-between py-2 px-4 text-[11px]">
                   <span className="font-semibold">Subtotal:</span>
                   <span>₹ {Number(totals?.grossAmount || 0).toFixed(2)}</span>
                </div>
                
                {billData.billSettings?.discountAmount > 0 && (
                  <div className="flex justify-between py-2 px-4 text-[11px]">
                     <span className="font-semibold">Discount:</span>
                     <span>- ₹ {Number(billData.billSettings?.discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}
                {billData.billSettings?.freight > 0 && (
                  <div className="flex justify-between py-2 px-4 text-[11px]">
                     <span className="font-semibold">Freight:</span>
                     <span>+ ₹ {Number(billData.billSettings?.freight || 0).toFixed(2)}</span>
                  </div>
                )}
                {billData.billSettings?.roundOff && Number(billData.billSettings.roundOff) !== 0 ? (
                  <div className="flex justify-between py-2 px-4 text-[11px]">
                     <span className="font-semibold">Round Off:</span>
                     <span>₹ {Number(billData.billSettings?.roundOff || 0).toFixed(2)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between items-center py-3 px-4 bg-[#1e3a8a] text-white font-bold text-[12px] mt-1 rounded-sm">
                   <span>Total Amount</span>
                   <span className="text-[14px]">₹ {Number(totals?.netAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="mt-8 text-[11px]">
               <p className="font-bold text-[#1e3a8a] mb-2">Payment Information</p>
               <div className="flex max-w-[300px]">
                  <div className="w-[100px] text-slate-500 space-y-1">
                     <p>Bank Name:</p>
                     <p>Account Name:</p>
                     <p>Account No:</p>
                  </div>
                  <div className="font-semibold space-y-1">
                     <p>State Bank of India</p>
                     <p>Dolphin Publications</p>
                     <p>1234567890123</p>
                  </div>
               </div>
            </div>

          </div>
          
          {/* Bottom Banner */}
          <div className="w-full flex items-end mt-auto h-[100px]">
             {/* Left logo area */}
             <div className="w-[40%] bg-[#1e3a8a] text-white h-[70px] rounded-tr-3xl flex items-center px-8 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center font-bold text-[10px]">
                     dp
                  </div>
                  <h2 className="font-bold tracking-wide">Dolphin Publications</h2>
                </div>
             </div>
             
             {/* Right contact area */}
             <div className="w-[60%] bg-[#1e40af] h-[100px] text-white rounded-tl-[40px] flex flex-col justify-center px-10 text-[9px] space-y-2 relative -ml-10 z-0">
                <p className="flex items-center gap-3">
                   <span className="w-4 h-4 rounded-full bg-white text-[#1e40af] flex items-center justify-center font-bold">📞</span> 
                   +91 98765 43210
                </p>
                <p className="flex items-center gap-3">
                   <span className="w-4 h-4 rounded-full bg-white text-[#1e40af] flex items-center justify-center font-bold">✉</span> 
                   dolphinpublications@gmail.com
                </p>
                <p className="flex items-center gap-3">
                   <span className="w-4 h-4 rounded-full bg-white text-[#1e40af] flex items-center justify-center font-bold">📍</span> 
                   39, West Madavilagam, Srivilliputtur - 626125
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
});

export default ModernTemplate;
