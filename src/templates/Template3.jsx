import React, { forwardRef } from 'react';

const Template3 = forwardRef(({ data, type = 'bill' }, ref) => {
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
  const paddedItems = padItems(items, 8); // fewer rows

  return (
    <div className="bg-white p-4 print-container" ref={ref}>
      <div className="w-[210mm] min-h-[297mm] mx-auto bg-white print-page relative text-slate-800 font-sans border-2 border-slate-800 rounded-3xl overflow-hidden flex flex-col">
        
        {/* Top Edge Accent */}
        <div className="w-full h-[30px] bg-slate-800 relative">
           <div className="absolute top-0 left-[15%] w-[120px] h-[15px] bg-[#dc2626] skew-x-12 translate-x-4"></div>
           <div className="absolute top-0 right-4 h-full flex items-center text-white font-bold tracking-widest text-sm px-4">
              {isReturn ? "RETURN INVOICE" : "TAX INVOICE"}
           </div>
        </div>

        <div className="flex-1 flex flex-col pt-12 pb-6 px-16 relative">
          
          {/* Header Row */}
          <div className="flex justify-start items-center mb-12">
            <div className="flex items-center gap-4 text-[#dc2626]">
              {/* Logo shape */}
              <div className="w-10 h-10 border-2 border-[#dc2626] rounded-t-full rounded-bl-full flex items-center justify-center font-bold text-lg rotate-45">
                 <span className="-rotate-45">dp</span>
              </div>
              <div className="leading-tight">
                 <h1 className="font-extrabold text-2xl text-slate-900 tracking-wide">Dolphin</h1>
                 <p className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase">Publications</p>
              </div>
            </div>
          </div>

          {/* Details Row */}
          <div className="flex justify-between items-start mb-12 text-[10px] font-semibold text-slate-600">
            <div className="w-[50%] space-y-6">
              <div>
                <p className="font-bold text-slate-900 uppercase tracking-widest mb-1 text-[11px]">{isReturn ? "RETURN FROM:" : "ISSUED TO:"}</p>
                <p className="font-bold text-sm text-slate-800 uppercase">{customer?.name || customer?.school || 'Customer Name'}</p>
                <p className="font-normal uppercase whitespace-pre-line">{customer?.address1?.trim()}</p>
                {customer?.address2 && <p className="font-normal uppercase">{customer?.address2}</p>}
                <p className="font-normal uppercase">{customer?.district || customer?.city}</p>
              </div>
              
              {!isReturn && (
              <div>
                <p className="font-bold text-slate-900 uppercase tracking-widest mb-1 text-[11px]">PAY TO:</p>
                <p className="font-bold text-slate-800">State Bank of India</p>
                <p className="font-normal">Account Name: Dolphin Publications</p>
                <p className="font-normal">Account No: 1234567890123</p>
              </div>
              )}
            </div>
            
            <div className="w-[200px] mt-6">
              <div className="flex justify-between py-1">
                <span className="font-bold text-slate-900 uppercase tracking-widest">{isReturn ? "RETURN NO:" : "INVOICE NO:"}</span>
                <span className="font-bold text-slate-800 uppercase">{info?.returnNo || info?.billNo}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-bold text-slate-900 uppercase tracking-widest">DATE:</span>
                <span>{info?.date}</span>
              </div>
              {isReturn ? (
                <>
                  <div className="flex justify-between py-1">
                    <span className="font-bold text-slate-900 uppercase tracking-widest">ORIG BILL NO:</span>
                    <span className="uppercase">{info?.originalBillNo}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-bold text-slate-900 uppercase tracking-widest">REASON:</span>
                    <span className="uppercase">{info?.reason || "STOCK RETURN"}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between py-1">
                  <span className="font-bold text-slate-900 uppercase tracking-widest">LR NO:</span>
                  <span className="uppercase">{info?.lrNo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 mb-8">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-y-2 border-slate-900">
                  <th className="py-3 px-2 text-left font-bold uppercase tracking-widest text-[10px] text-slate-900">Description</th>
                  <th className="py-3 px-2 text-center font-bold uppercase tracking-widest text-[10px] text-slate-900 w-24">Unit Price</th>
                  <th className="py-3 px-2 text-center font-bold uppercase tracking-widest text-[10px] text-slate-900 w-20">Qty</th>
                  <th className="py-3 px-2 text-right font-bold uppercase tracking-widest text-[10px] text-slate-900 w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {paddedItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4 px-2 font-semibold text-slate-700">{item?.itemName || item?.particulars || item?.itemDetails || ""}</td>
                    <td className="py-4 px-2 text-center font-medium text-slate-600">{item?.rate || ""}</td>
                    <td className="py-4 px-2 text-center font-medium text-slate-600">{item?.qty || ""}</td>
                    <td className="py-4 px-2 text-right font-bold text-slate-800">{item?.amount ? Number(item.amount).toFixed(2) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="w-full border-y-2 border-slate-900 mt-2 py-4 flex justify-end text-[11px]">
              <div className="w-[200px]">
                <div className="flex justify-between py-1 font-bold text-slate-700">
                   <span className="uppercase tracking-widest">{isReturn ? "TOTAL QTY" : "SUBTOTAL"}</span>
                   <span>{isReturn ? totals?.qty : `₹ ${Number(totals?.grossAmount || 0).toFixed(2)}`}</span>
                </div>
                
                {!isReturn && billSettings?.discountAmount > 0 && (
                  <div className="flex justify-between py-1 font-bold text-slate-700">
                     <span className="uppercase tracking-widest text-[10px]">DISCOUNT</span>
                     <span>- ₹ {Number(billSettings?.discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}
                {!isReturn && billSettings?.freight > 0 && (
                  <div className="flex justify-between py-1 font-bold text-slate-700">
                     <span className="uppercase tracking-widest text-[10px]">FREIGHT</span>
                     <span>+ ₹ {Number(billSettings?.freight || 0).toFixed(2)}</span>
                  </div>
                )}
                {!isReturn && billSettings?.roundOff && Number(billSettings.roundOff) !== 0 ? (
                  <div className="flex justify-between py-1 font-bold text-slate-700">
                     <span className="uppercase tracking-widest text-[10px]">ROUND OFF</span>
                     <span>₹ {Number(billSettings?.roundOff || 0).toFixed(2)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between pt-2 mt-2 font-bold text-sm text-slate-900">
                   <span className="uppercase tracking-widest">TOTAL</span>
                   <span>₹ {Number(totals?.netAmount || totals?.amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Banner */}
          <div className="w-full flex justify-between items-end mt-auto h-[100px] pb-6">
             <div className="font-bold text-sm text-slate-800 w-[50%]">
                {isReturn ? "Thank you for your cooperation." : "Thank you for your business!"}
             </div>
             
             {/* Signature */}
             <div className="text-center w-[200px]">
                <div className="h-[40px] relative w-full mb-1 flex justify-center">
                   {digitalSignature && (
                      <img src={digitalSignature} alt="Signature" className="h-full object-contain mix-blend-multiply" />
                   )}
                </div>
                <div className="w-full border-t border-slate-900 pt-1">
                   <p className="text-[10px] text-slate-500 font-semibold tracking-wider">Authorized Signatory</p>
                </div>
             </div>
          </div>

        </div>

        {/* Bottom Edge Accent */}
        <div className="w-full h-[30px] bg-slate-800 relative mt-auto flex justify-end items-end">
           <div className="w-[60%] h-full flex items-end justify-end">
              <div className="w-[200px] h-[15px] bg-[#dc2626] skew-x-12 translate-x-4 mb-[15px] mr-10"></div>
           </div>
        </div>

      </div>
    </div>
  );
});

export default Template3;
