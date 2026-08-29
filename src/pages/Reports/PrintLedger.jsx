import React, { forwardRef } from 'react';

const PrintLedger = forwardRef(({ data, filters, selectedClient, isLetterFormat }, ref) => {
  if (!data || data.length === 0 || !selectedClient) return null;

  if (isLetterFormat) {
    return (
      <div ref={ref} className="p-10 bg-white text-black font-serif mx-auto text-sm" style={{ width: '210mm', minHeight: '297mm' }}>
        <style>{`
          @media print {
            @page { margin: 15mm; size: A4 portrait; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page-break { page-break-inside: avoid; }
          }
        `}</style>

        {/* Header matching image exactly */}
        <div className="text-center mb-6">
          <h1 className="font-bold text-3xl mb-1 tracking-widest text-[#1e3a8a]" style={{ fontFamily: 'Arial, sans-serif' }}>DOLPHIN PUBLICATIONS</h1>
          <p className="font-semibold text-base mb-4">Cell No : 98653-06197, 89256-77710</p>
          <div className="border-b-[3px] border-black mb-6"></div>
        </div>

        {/* To Address Block */}
        <div className="mb-8">
          <p className="font-bold uppercase text-base">THE HEAD MISTRESS,</p>
          <p className="font-bold uppercase text-base">{selectedClient.ledgerName}</p>
          {selectedClient.address1 && <p className="font-bold uppercase text-base">{selectedClient.address1}</p>}
          {selectedClient.address2 && <p className="font-bold uppercase text-base">{selectedClient.address2}</p>}
          {(selectedClient.town || selectedClient.city) && <p className="font-bold uppercase text-base">{selectedClient.town || selectedClient.city}</p>}
          {selectedClient.district && <p className="font-bold uppercase text-base">{selectedClient.district}</p>}
          <p className="font-bold mt-1 text-base">
            {selectedClient.phoneNo ? `Phone No : ${selectedClient.phoneNo}` : ''}
            {selectedClient.phoneNo && selectedClient.mobileNo ? '  ' : ''}
            {selectedClient.mobileNo ? `Mobile No : ${selectedClient.mobileNo}` : ''}
          </p>
          
          <p className="font-bold mt-1 text-base text-blue-800">
            {filters.fromDate || filters.toDate ? (
               `Ledger for the Period of ${filters.fromDate ? new Date(filters.fromDate).toLocaleDateString('en-GB') : ''} - ${filters.toDate ? new Date(filters.toDate).toLocaleDateString('en-GB') : ''}`
            ) : (
               `Ledger Report`
            )}
          </p>
        </div>

        {/* Salutation & Opening Paragraph */}
        <div className="mb-6">
          <p className="font-bold text-base mb-3">Respected Sir / Madam,</p>
          <p className="text-base text-justify leading-relaxed">
            We convey own salutations and thankfulness for having kindly purchased our English Guide & Work Book. The details of your having purchased our Guide & Work Book are given below :
          </p>
        </div>

        {/* Table - Letter Format (Removed A/C Name) */}
        <div className="mb-6">
          <table className="w-full text-left border-collapse border border-black text-sm">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-black">
                <th className="border border-black p-2 font-bold text-center w-24">Date</th>
                <th className="border border-black p-2 font-bold text-center">Particulars</th>
                <th className="border border-black p-2 font-bold text-center w-28">Vch. Type</th>
                <th className="border border-black p-2 font-bold text-center w-20">Vch No</th>
                <th className="border border-black p-2 font-bold text-center w-24">Debit</th>
                <th className="border border-black p-2 font-bold text-center w-24">Credit</th>
                <th className="border border-black p-2 font-bold text-center w-28">Closing</th>
              </tr>
            </thead>
            <tbody>
              {data.map((t, i) => (
                <tr key={i} className="border-b border-black page-break">
                  <td className="border-r border-black p-2 text-center align-top font-semibold">{t.dateStr}</td>
                  <td className="border-r border-black p-2 font-bold uppercase align-top">
                    {t.particulars}
                    {t.narration && (
                       <div className="mt-1 normal-case font-semibold italic text-xs whitespace-pre-wrap">{t.narration}</div>
                    )}
                  </td>
                  <td className="border-r border-black p-2 font-semibold text-center align-top">{t.vchType}</td>
                  <td className="border-r border-black p-2 font-semibold text-center align-top">{t.vchNo}</td>
                  <td className="border-r border-black p-2 font-semibold text-right align-top">{t.debit ? t.debit.toFixed(2) : ''}</td>
                  <td className="border-r border-black p-2 font-semibold text-right align-top">{t.credit ? t.credit.toFixed(2) : ''}</td>
                  <td className="p-2 font-semibold text-right align-top">{t.closingAmt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Paragraphs */}
        <div className="mb-12">
          <p className="text-base mb-4 font-semibold text-gray-800">
            Please send us the amount mentioned above early.
          </p>
          <p className="text-base font-semibold leading-relaxed text-gray-800 italic">
            "We Request you to send your Demand Draft in favour of "DOLPHIN PUBLICATIONS" payable at Srivilliputtur at any nationalized bank."
          </p>
        </div>

        {/* Signatory */}
        <div className="flex justify-between items-start mt-20">
          <div className="font-semibold text-base">
            Thanking You
          </div>
          <div className="text-right font-semibold text-base">
            <p className="mb-16">For DOLPHIN PUBLICATIONS</p>
            <p>Proprietor</p>
          </div>
        </div>

      </div>
    );
  }

  // Normal Layout
  return (
    <div ref={ref} className="p-4 bg-white text-black font-sans w-[210mm] mx-auto text-sm">
      <style>{`
        @media print {
          @page { margin: 10mm; size: A4 portrait; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-inside: avoid; }
        }
      `}</style>
      
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="font-bold uppercase text-lg">THE HEAD MISTRESS,</h2>
        <h2 className="font-bold uppercase text-lg">{selectedClient.ledgerName}</h2>
        {selectedClient.address1 && <p className="font-semibold uppercase">{selectedClient.address1}</p>}
        {selectedClient.address2 && <p className="font-semibold uppercase">{selectedClient.address2}</p>}
        {(selectedClient.town || selectedClient.city) && <p className="font-semibold uppercase">{selectedClient.town || selectedClient.city}</p>}
        {selectedClient.district && <p className="font-semibold uppercase">{selectedClient.district}</p>}
        {selectedClient.mobileNo && <p className="font-semibold">Phone No : {selectedClient.mobileNo}</p>}
      </div>

      <div className="flex justify-between items-end mb-2">
        <div className="font-bold text-sm">
          {filters.fromDate || filters.toDate ? (
             `Ledger for the Period of ${filters.fromDate ? new Date(filters.fromDate).toLocaleDateString('en-GB') : ''} - ${filters.toDate ? new Date(filters.toDate).toLocaleDateString('en-GB') : ''}`
          ) : (
             `Ledger Report`
          )}
        </div>
      </div>

      <table className="w-full text-left border-collapse border border-black text-xs">
        <thead>
          <tr className="bg-[#e9e9e9]/30 border-t-2 border-b-2 border-black">
            <th className="border-r border-black p-2 font-bold w-20 text-center">Date</th>
            <th className="border-r border-black p-2 font-bold">Particulars</th>
            <th className="border-r border-black p-2 font-bold">A/C Name</th>
            <th className="border-r border-black p-2 font-bold w-20 text-center">Vch. Type</th>
            <th className="border-r border-black p-2 font-bold w-16 text-center">Vch No</th>
            <th className="border-r border-black p-2 font-bold w-20 text-right">Debit</th>
            <th className="border-r border-black p-2 font-bold w-20 text-right">Credit</th>
            <th className="p-2 font-bold w-24 text-right">Closing</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t, i) => (
            <tr key={i} className="border-b border-black page-break">
              <td className="border-r border-black p-2 text-center align-top font-semibold">{t.dateStr}</td>
              <td className="border-r border-black p-2 font-bold uppercase align-top">
                {t.particulars}
                {t.narration && (
                   <div className="mt-1 normal-case font-semibold italic text-xs whitespace-pre-wrap">{t.narration}</div>
                )}
              </td>
              <td className="border-r border-black p-2 font-semibold uppercase align-top">{t.acName}</td>
              <td className="border-r border-black p-2 font-semibold text-center align-top">{t.vchType}</td>
              <td className="border-r border-black p-2 font-semibold text-center align-top">{t.vchNo}</td>
              <td className="border-r border-black p-2 font-semibold text-right align-top">{t.debit ? t.debit.toFixed(2) : ''}</td>
              <td className="border-r border-black p-2 font-semibold text-right align-top">{t.credit ? t.credit.toFixed(2) : ''}</td>
              <td className="p-2 font-semibold text-right align-top">{t.closingAmt} <span className="font-bold italic">{t.closingType}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-8 flex justify-between px-2 text-sm font-bold">
        <p>Date : {new Date().toLocaleDateString('en-GB')}</p>
      </div>

    </div>
  );
});

export default PrintLedger;
