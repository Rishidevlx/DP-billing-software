import React, { forwardRef } from 'react';

const PrintReceipt = forwardRef(({ receiptData }, ref) => {
  if (!receiptData) return null;

  const {
    voucherNo,
    date,
    customerName,
    amount,
    narrationSno,
    narrationPg,
    narrationDate
  } = receiptData;

  const numberToWords = (num) => {
    const a = ['', 'ONE ', 'TWO ', 'THREE ', 'FOUR ', 'FIVE ', 'SIX ', 'SEVEN ', 'EIGHT ', 'NINE ', 'TEN ', 'ELEVEN ', 'TWELVE ', 'THIRTEEN ', 'FOURTEEN ', 'FIFTEEN ', 'SIXTEEN ', 'SEVENTEEN ', 'EIGHTEEN ', 'NINETEEN '];
    const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    
    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'CRORE ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'LAKH ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'THOUSAND ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'HUNDRED ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'AND ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim() || 'ZERO';
  };

  const amountInWords = numberToWords(parseInt(amount || 0));

  return (
    <div ref={ref} className="p-4 bg-white text-black font-sans w-[210mm] mx-auto">
      <style>{`
        @media print {
          @page { margin: 10mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      
      {/* Outer Border */}
      <div className="border-[1.5px] border-black h-[140mm] flex flex-col relative text-[15px]">
        
        {/* HEADER SECTION */}
        <div className="text-center pt-3 pb-2 border-b-[1.5px] border-black px-4 relative bg-[#d9d9d9]/30">
          <h1 className="text-2xl font-extrabold uppercase tracking-widest text-[#2a2a2a]">DOLPHIN PUBLICATIONS</h1>
          <p className="font-semibold text-[13px] mt-1 tracking-wide text-[#333]">239, Keelapatti Street,</p>
          <p className="font-semibold text-[13px] tracking-wide text-[#333]">Srivilliputtur - 626 125. Virudhunagar District</p>
          <p className="font-semibold text-[13px] tracking-wide text-[#333]">Mob. No 98653-06197, 89256-77710, GST No: 33CAEPK4827P1ZC</p>
        </div>

        {/* TITLE ROW */}
        <div className="flex border-b-[1.5px] border-black font-bold items-center bg-[#d9d9d9]/50">
          <div className="w-[50%] p-2 px-8 border-r-[1.5px] border-black tracking-wide text-lg text-[#2a2a2a]">
            RECEIPT VOUCHER
          </div>
          <div className="w-[50%] p-2 px-4 flex gap-6 text-[#2a2a2a]">
            <span>No : {voucherNo}</span>
            <span>Date : {date}</span>
          </div>
        </div>

        {/* BODY PARAGRAPH */}
        <div className="p-8 pb-4 font-medium leading-[2.2] text-[15px] text-[#2a2a2a] text-justify">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Received with thanks from M/s. <span className="uppercase font-semibold">{customerName}</span>
          <br/>
          the sum of Rupess <span className="uppercase font-semibold">{amountInWords} ONLY</span> by sno <span className="font-semibold">{narrationSno || '___'}</span> pg <span className="font-semibold">{narrationPg || '___'}</span> dated <span className="font-semibold">{narrationDate || '___'}</span> towards payment of Books.
        </div>

        {/* AMOUNT */}
        <div className="px-8 mt-6">
          <span className="font-bold inline-block w-32">Amount(Rs.)</span>
          <span className="font-bold">: &nbsp;&nbsp;{parseFloat(amount || 0).toFixed(2)}</span>
        </div>

        {/* FOOTER SECTION */}
        <div className="absolute bottom-0 w-full">
          <div className="border-t-[1.5px] border-black p-4 px-8 pb-6 flex justify-end h-28 relative">
            <div className="text-right flex flex-col justify-between items-end">
              <span className="font-bold text-[#2a2a2a] tracking-wide">For DOLPHIN PUBLICATIONS</span>
              <span className="font-semibold text-[#2a2a2a]">Authorised Signatory</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default PrintReceipt;
