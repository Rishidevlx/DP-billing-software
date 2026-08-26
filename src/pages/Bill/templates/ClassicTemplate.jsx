import React, { forwardRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const ClassicTemplate = forwardRef(({ billData }, ref) => {
  if (!billData) return null;

  const {
    customer,
    billInfo,
    items,
    totals
  } = billData;

  const digitalSignature = localStorage.getItem('digitalSignature');
  
  const creatorName = billData?.billInfo?.created_by || JSON.parse(localStorage.getItem('currentUser') || '{}').name || 'Admin';
  const formattedTime = billData?.billInfo?.created_at 
    ? new Date(billData.billInfo.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

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

      {/* Outer Border */}
      <div className="border-2 border-slate-800 flex flex-col" style={{ height: '271mm', pageBreakInside: 'avoid' }}>

        {/* HEADER SECTION */}
        <div className="flex border-b-2 border-slate-800 h-[170px]">
          <div className="flex-1 flex border-r-2 border-slate-800 p-1">
            <div className="w-[190px] flex justify-center items-center shrink-0">
              <img src="/DP-logo.png" alt="Logo" className="w-[180px] h-auto object-contain max-h-[145px]" />
            </div>
            <div className="flex-1 text-center flex flex-col justify-center">
              <h3 className="font-bold text-sm tracking-widest uppercase text-red-700">Tax Invoice</h3>
              <h1 className="text-2xl font-extrabold text-blue-800 uppercase tracking-wider" style={{ fontFamily: 'Arial, sans-serif', transform: 'scaleY(1.1)' }}>Dolphin Publications</h1>
              <div className="border-b border-slate-800 my-0.5 mx-2"></div>
              <div className="text-[12px] font-bold leading-tight text-slate-900 flex flex-col justify-center gap-0.5 pb-2">
                <p>239, Keelapatti Street,</p>
                <p>Srivilliputtur - 626 125. Virudhunagar District</p>
                <p>Tamil Nadu (Code : 33)</p>
                <p className="text-[13px]">GSTIN : 33CAEPK4827P1ZC</p>
                <p>Mobile : 98653-06197, 89256-77710</p>
                <p className="text-[11px] whitespace-nowrap overflow-hidden text-ellipsis">E-Mail : dolphin.pub2005@gmail.com <span className="ml-2">Website : www.kalvidolphin.com</span></p>
              </div>
            </div>
          </div>
          <div className="w-[155px] flex justify-center items-center shrink-0">
            {billInfo?.isEbill && billInfo?.qrCode ? (
              <QRCodeCanvas value={billInfo.qrCode} size={110} level={"M"} />
            ) : (
              <div className="w-[110px] h-[110px]"></div>
            )}
          </div>
        </div>

        {/* IRN & ACK SECTION (Only if E-Bill is enabled) */}
        {billInfo?.isEbill && (
          <div className="flex border-b-2 border-slate-800 text-xs font-semibold p-1">
            <div className="w-[60%] border-r-2 border-slate-800 px-2 flex items-center break-all">
              <span className="mr-2 whitespace-nowrap">IRN :</span>
              <span className="font-normal">{billInfo?.irn || ''}</span>
            </div>
            <div className="w-[40%] px-2 flex flex-col justify-center">
              <div className="flex mb-1">
                <span className="w-20">Ack No</span><span className="mr-2">:</span>
                <span className="font-normal">{billInfo?.ackNo || ''}</span>
              </div>
              <div className="flex">
                <span className="w-20">Ack Date</span><span className="mr-2">:</span>
                <span className="font-normal">{billInfo?.ackDate || ''}</span>
              </div>
            </div>
          </div>
        )}

        {/* DETAILS SECTION */}
        <div className="flex border-b-2 border-slate-800">
          {/* Bill To (Left) */}
          <div className="w-3/6 border-r-2 border-slate-800 p-1 px-2 text-sm leading-tight font-bold">
            <div className="flex justify-between">
              <span className="text-blue-800">BILL TO :</span>
            </div>
            <div className="mt-2 text-slate-900 uppercase">
              <p>{customer?.school || "THIYAGARAJA HR SEC SCHOOL"}</p>
              <p>{customer?.address1 || "N.G.G. O. COLONY"}</p>
              <p>{customer?.address2 || "Srivilliputtur Taluk - 626125"}</p>
              <p>{customer?.district || "Virudhunagar District"}</p>
              <p>Tamil Nadu (Code : 33)</p>
              {customer?.mobile && <p>Mob. No : {customer.mobile}</p>}
            </div>
          </div>

          {/* Bill Info (Right) */}
          <div className="w-3/5 flex flex-col text-sm font-bold">
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

            <div className="flex flex-1">
              <div className="w-1/2 p-1 border-r border-slate-800 flex items-center">LR NO</div>
              <div className="w-1/2 p-1 flex items-center font-normal uppercase">{billInfo?.lrNo || ""}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <table className="w-full text-sm font-semibold flex-1 flex flex-col" style={{ tableLayout: 'fixed' }}>
            <thead className="w-full table" style={{ tableLayout: 'fixed' }}>
              <tr className="border-b-2 border-slate-800 bg-slate-100 text-blue-800">
                <th className="w-12 border-r-2 border-slate-800 px-1 py-1">S.No</th>
                <th className="border-r-2 border-slate-800 px-2 py-1 text-left">DESCRIPTION</th>
                <th className="w-20 border-r-2 border-slate-800 px-1 py-1">HSN<br/>CODE</th>
                <th className="w-20 border-r-2 border-slate-800 px-1 py-1">QTY<br/>Nos</th>
                <th className="w-24 border-r-2 border-slate-800 px-1 py-1">RATE<br/>Rs.</th>
                <th className="w-32 px-2 py-1 text-right">AMOUNT<br/>Rs. P.</th>
              </tr>
            </thead>
            <tbody className="text-slate-900 flex-1 flex flex-col w-full">
              {items && items.map((item, index) => (
                <tr key={index} className="w-full table" style={{ tableLayout: 'fixed' }}>
                  <td className="w-12 border-r-2 border-slate-800 px-1 py-1 text-center">{index + 1}</td>
                  <td className="border-r-2 border-slate-800 px-2 py-1">{item.itemName || item.particulars || item.itemDetails || ""}</td>
                  <td className="w-20 border-r-2 border-slate-800 px-1 py-1 text-center">{item.hsnCode || "4901"}</td>
                  <td className="w-20 border-r-2 border-slate-800 px-1 py-1 text-center">{item.qty}</td>
                  <td className="w-24 border-r-2 border-slate-800 px-1 py-1 text-center">{Number(item.rate).toFixed(2)}</td>
                  <td className="w-32 text-right px-2 py-1">{Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="flex-1 w-full table" style={{ tableLayout: 'fixed' }}>
                <td className="w-12 border-r-2 border-slate-800 h-full"></td>
                <td className="border-r-2 border-slate-800 h-full"></td>
                <td className="w-20 border-r-2 border-slate-800 h-full"></td>
                <td className="w-20 border-r-2 border-slate-800 h-full"></td>
                <td className="w-24 border-r-2 border-slate-800 h-full"></td>
                <td className="w-32 h-full"></td>
              </tr>
              {/* Totals Rows inside the table */}
              <tr className="w-full table" style={{ tableLayout: 'fixed' }}>
                <td className="w-12 border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800 px-2 py-1 text-right">Sub Total</td>
                <td className="w-20 border-r-2 border-slate-800"></td>
                <td className="w-20 border-r-2 border-slate-800 text-center font-bold">{totals?.qty || "0"}</td>
                <td className="w-24 border-r-2 border-slate-800"></td>
                <td className="w-32 text-right px-2 py-1 font-bold">{Number(totals?.grossAmount || totals?.amount || 0).toFixed(2)}</td>
              </tr>
              
              {(billData.billSettings?.discountAmount > 0) && (
              <tr className="w-full table" style={{ tableLayout: 'fixed' }}>
                <td className="w-12 border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800 px-2 py-1 text-right">
                  Discount {billData.billSettings.discountPercent ? `(${billData.billSettings.discountPercent}%)` : ''}
                </td>
                <td className="w-20 border-r-2 border-slate-800"></td>
                <td className="w-20 border-r-2 border-slate-800"></td>
                <td className="w-24 border-r-2 border-slate-800"></td>
                <td className="w-32 text-right px-2 py-1 font-bold">{Number(billData.billSettings.discountAmount || 0).toFixed(2)}</td>
              </tr>
              )}
              
              {(billData.billSettings?.freight > 0) && (
              <tr className="w-full table" style={{ tableLayout: 'fixed' }}>
                <td className="w-12 border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800 px-2 py-1 text-right">Packing & Forwarding</td>
                <td className="w-20 border-r-2 border-slate-800"></td>
                <td className="w-20 border-r-2 border-slate-800"></td>
                <td className="w-24 border-r-2 border-slate-800"></td>
                <td className="w-32 text-right px-2 py-1 font-bold">{Number(billData.billSettings.freight).toFixed(2)}</td>
              </tr>
              )}

              {(billData.billSettings?.roundOff && Number(billData.billSettings.roundOff) !== 0) && (
              <tr className="w-full table" style={{ tableLayout: 'fixed' }}>
                <td className="w-12 border-r-2 border-slate-800"></td>
                <td className="border-r-2 border-slate-800 px-2 py-1 text-right">Round Off</td>
                <td className="w-20 border-r-2 border-slate-800"></td>
                <td className="w-20 border-r-2 border-slate-800"></td>
                <td className="w-24 border-r-2 border-slate-800"></td>
                <td className="w-32 text-right px-2 py-1 font-bold">{Number(billData.billSettings.roundOff).toFixed(2)}</td>
              </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex border-t-2 border-b-2 border-slate-800 font-bold text-sm bg-slate-100">
          <div className="flex-1 px-2 py-1">GST EXEMPTED GOODS</div>
          <div className="w-40 border-l-2 border-r-2 border-slate-800 text-center py-1 text-blue-800">Net Amount</div>
          <div className="w-32 text-right px-2 py-1">{Number(totals?.netAmount || totals?.amount || 0).toFixed(2)}</div>
        </div>

        {/* FOOTER SECTION */}
        <div className="px-2 py-1 font-bold text-sm border-b-2 border-slate-800">
          <span className="text-blue-800">Amount (Words) : </span>
          <span className="uppercase">{numberToWords(Math.round(totals?.netAmount || totals?.amount || 0))}</span>
        </div>

        <div className="flex justify-between p-2 pb-4 h-24 relative">
          <div className="w-1/2">
            <h4 className="text-blue-800 font-bold text-sm underline mb-1">Terms and Conditions</h4>
            <p className="text-xs font-semibold">1. If you wish to return the books, you must return them within a month.</p>
          </div>
          <div className="w-1/2 flex flex-col justify-between items-end">
            <h4 className="text-blue-800 font-bold text-sm">For DOLPHIN PUBLICATIONS</h4>
            <div className="flex flex-col items-center relative mt-8">
              {digitalSignature && (
                <img src={digitalSignature} alt="Digital Signature" className="absolute bottom-4 left-1/2 -translate-x-1/2 max-h-[60px] max-w-[150px] object-contain opacity-90" style={{ pointerEvents: 'none' }} />
              )}
              <span className="font-bold text-sm mt-8 relative z-10">Authorised Signatory</span>
            </div>
          </div>
        </div>

        <div className="text-left text-[10px] text-gray-500 mt-2 italic px-2">
          Prepared By: {creatorName} | Date & Time: {formattedTime}
        </div>

      </div>

      {/* CUT LINE */}
      <div className="relative flex items-center justify-center opacity-50" style={{ height: '5mm', marginTop: '1mm', marginBottom: '1mm' }}>
        <div className="absolute w-full border-t-2 border-dashed border-slate-600"></div>
        <span className="bg-white px-2 text-slate-600 text-lg relative z-10" style={{ transform: 'rotate(180deg)' }}>✂️</span>
      </div>

      {/* TEAR-OFF SLIP (Below Authorised Signatory) */}
      <div className="border-2 border-b-4 border-slate-800 flex font-bold text-sm bg-slate-100 tear-off" style={{ height: '53mm' }}>
        {/* Left Side: Address */}
        <div className="w-1/2 border-r-2 border-slate-800 pt-2 pb-1 px-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between text-blue-800 mb-1">
              <span>To :</span>
              {customer?.mobile && <span className="text-slate-800">Mob. No : {customer.mobile}</span>}
            </div>
            <div className="text-slate-900 uppercase leading-snug">
              <p>{customer?.school || "THIYAGARAJA HR SEC SCHOOL"}</p>
              <p>{customer?.address1 || "N.G.G. O. COLONY"}</p>
              <p>{customer?.address2 || "Srivilliputtur Taluk - 626125"}</p>
              <p>{customer?.district || "Virudhunagar District"}</p>
              <p>Tamil Nadu (Code : 33)</p>
            </div>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="w-1/2 pt-2 pb-1 px-4 relative text-blue-800 flex flex-col gap-0 leading-snug">
          <div className="flex">
            <span className="w-28">Bill No</span>
            <span className="mr-2">:</span>
            <span className="text-slate-900">{billInfo?.billNo || "8199"}</span>
          </div>
          <div className="flex">
            <span className="w-28">Transport</span>
            <span className="mr-2">:</span>
            <span className="text-slate-900 uppercase">{billInfo?.transport || "DIRECT SALES"}</span>
          </div>
          <div className="flex">
            <span className="w-28">Destination</span>
            <span className="mr-2">:</span>
            <span className="text-slate-900 uppercase">{billInfo?.destination || ""}</span>
          </div>
          <div className="flex">
            <span className="w-28">No. of Bundles</span>
            <span className="mr-2">:</span>
            <span className="text-slate-900">{billInfo?.bundles || "0"}</span>
          </div>
          <div className="flex">
            <span className="w-28">LR No</span>
            <span className="mr-2">:</span>
            <span className="text-slate-900 uppercase">{billInfo?.lrNo || ""}</span>
          </div>
          <div className="flex">
            <span className="w-28">LR Date</span>
            <span className="mr-2">:</span>
            <span className="text-slate-900">{billInfo?.lrDate || ""}</span>
          </div>
          <div className="flex mt-1">
            <span className="w-28">Booking</span>
            <span className="mr-2">:</span>
            <span className="text-slate-900 font-extrabold">PAID / <span className="text-red-600">TO PAY</span></span>
          </div>

          <div className="absolute right-2" style={{ top: '' }}>
            <img src="/DP-logo.png" alt="Logo" className="w-[180px] h-auto object-contain max-h-[145px]" />
          </div>
        </div>
      </div>
    </div>
  );
});

export default ClassicTemplate;