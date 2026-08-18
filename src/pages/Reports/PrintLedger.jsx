import React, { forwardRef } from 'react';

const PrintLedger = forwardRef(({ data, filters }, ref) => {
  if (!data) return null;

  const totalPurchases = data.reduce((sum, c) => sum + c.totalPurchases, 0);
  const totalReturns = data.reduce((sum, c) => sum + c.totalReturns, 0);
  const totalPaid = data.reduce((sum, c) => sum + c.totalPaid, 0);
  const totalBalance = data.reduce((sum, c) => sum + c.balanceDue, 0);

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
      <div className="text-center pb-4 border-b-2 border-black mb-4">
        <h1 className="text-2xl font-extrabold uppercase tracking-widest text-[#2a2a2a] mb-1">DOLPHIN PUBLICATIONS</h1>
        <p className="font-semibold text-xs text-[#333]">239, Keelapatti Street, Srivilliputtur - 626 125. Virudhunagar District</p>
        <p className="font-semibold text-xs text-[#333]">Mob. No 98653-06197, 89256-77710</p>
        <h2 className="text-lg font-bold mt-3 border border-black inline-block px-4 py-1 rounded bg-[#d9d9d9]/30">
          LEDGER REPORT
        </h2>
      </div>

      {/* Filters Summary */}
      <div className="flex justify-between items-start mb-6 text-xs font-semibold px-2">
        <div>
          <p>Group: <span className="uppercase font-normal">{filters.group}</span></p>
          <p>City: <span className="uppercase font-normal">{filters.city}</span></p>
          {(filters.fromDate || filters.toDate) && (
            <p>Period: <span className="font-normal">{filters.fromDate ? new Date(filters.fromDate).toLocaleDateString('en-GB') : 'Start'} to {filters.toDate ? new Date(filters.toDate).toLocaleDateString('en-GB') : 'Today'}</span></p>
          )}
        </div>
        <div className="text-right">
          <p>Party Type: <span className="uppercase font-normal">{filters.partyType}</span></p>
          <p>Ledger Name: <span className="uppercase font-normal">{filters.ledgerName || 'ALL'}</span></p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left border-collapse border border-black text-xs mb-8">
        <thead>
          <tr className="bg-[#d9d9d9]/50 border-b border-black">
            <th className="border-r border-black p-2 font-bold w-10 text-center">S.No</th>
            <th className="border-r border-black p-2 font-bold">Ledger Name</th>
            <th className="border-r border-black p-2 font-bold w-24">City</th>
            <th className="border-r border-black p-2 font-bold w-20 text-center">Party Type</th>
            <th className="border-r border-black p-2 font-bold w-24 text-right">Total Purchases</th>
            <th className="border-r border-black p-2 font-bold w-24 text-right">Total Returns</th>
            <th className="border-r border-black p-2 font-bold w-24 text-right">Total Paid</th>
            <th className="p-2 font-bold w-24 text-right">Balance Due</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => (
            <tr key={i} className="border-b border-black page-break">
              <td className="border-r border-black p-2 text-center">{i + 1}</td>
              <td className="border-r border-black p-2 font-semibold uppercase">{c.ledgerName}</td>
              <td className="border-r border-black p-2 uppercase">{c.city || '-'}</td>
              <td className="border-r border-black p-2 text-center">{c.partyType || '-'}</td>
              <td className="border-r border-black p-2 text-right">₹{c.totalPurchases.toFixed(2)}</td>
              <td className="border-r border-black p-2 text-right">₹{c.totalReturns.toFixed(2)}</td>
              <td className="border-r border-black p-2 text-right">₹{c.totalPaid.toFixed(2)}</td>
              <td className="p-2 text-right font-bold">₹{c.balanceDue.toFixed(2)}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan="8" className="p-4 text-center italic">No data available for selected filters.</td>
            </tr>
          )}
        </tbody>
        {data.length > 0 && (
          <tfoot>
            <tr className="bg-[#d9d9d9]/50 border-t-2 border-black font-bold">
              <td colSpan="4" className="border-r border-black p-2 text-right">GRAND TOTAL:</td>
              <td className="border-r border-black p-2 text-right">₹{totalPurchases.toFixed(2)}</td>
              <td className="border-r border-black p-2 text-right">₹{totalReturns.toFixed(2)}</td>
              <td className="border-r border-black p-2 text-right">₹{totalPaid.toFixed(2)}</td>
              <td className="p-2 text-right">₹{totalBalance.toFixed(2)}</td>
            </tr>
          </tfoot>
        )}
      </table>

      {/* Footer */}
      <div className="mt-8 flex justify-end px-4">
        <div className="text-center font-bold">
          <p className="mb-8">For DOLPHIN PUBLICATIONS</p>
          <p>Authorised Signatory</p>
        </div>
      </div>

    </div>
  );
});

export default PrintLedger;
