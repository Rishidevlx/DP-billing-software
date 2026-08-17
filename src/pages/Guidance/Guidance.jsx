import React, { useState } from 'react';
import { BookOpen, Users, FileText, Keyboard, Printer, Info, CheckCircle2, ArrowRight, MousePointer2 } from 'lucide-react';

export default function Guidance() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Software Overview', icon: <Info size={18} /> },
    { id: 'clients', name: 'Managing Clients', icon: <Users size={18} /> },
    { id: 'books', name: 'Managing Books', icon: <BookOpen size={18} /> },
    { id: 'billing', name: 'Creating Bills', icon: <FileText size={18} /> },
    { id: 'shortcuts', name: 'Keyboard Shortcuts', icon: <Keyboard size={18} /> },
    { id: 'print', name: 'Print & Save', icon: <Printer size={18} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex bg-white dark:bg-[#151521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
      
      {/* Sidebar Tabs */}
      <div className="w-64 bg-slate-50 dark:bg-[#1a1a2e] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase">User Guide</h2>
          <p className="text-xs text-slate-500 mt-1">Dolphin Billing Software</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors border-l-2 ${
                activeTab === tab.id 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold' 
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
                {tab.icon}
              </span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-[#151521]">
        
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Welcome to Dolphin Billing Software</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              This software is designed specifically for Dolphin Publications to manage books, clients, and generate GST compliant tax invoices efficiently. It is highly optimized for keyboard usage to ensure fast billing operations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-[#1a1a2e]">
                <Users className="text-blue-500 mb-3" size={24} />
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">1. Add Clients First</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Before creating bills, ensure your customers (schools, bookstores) are added in the system so they auto-populate during billing.</p>
              </div>
              <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-[#1a1a2e]">
                <BookOpen className="text-blue-500 mb-3" size={24} />
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">2. Manage Book Inventory</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Keep your book list updated with the correct HSN codes and rates. This helps in automatic calculation.</p>
              </div>
              <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-[#1a1a2e] md:col-span-2">
                <FileText className="text-blue-500 mb-3" size={24} />
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">3. Lightning Fast Billing</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">The billing module is split into two sections: Customer Search & Invoice Details. Use your keyboard to navigate seamlessly without touching the mouse.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Client Workflow</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-8">Follow this simple 3-step process to add a client and use them in billing.</p>
            
            <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
              
              {/* Step 1 */}
              <div className="flex-1 bg-white dark:bg-[#1E1E2D] p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm relative w-full">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3 text-center border-b pb-2">Clients Menu - Add Client</h3>
                <div className="space-y-2">
                  <input type="text" disabled placeholder="Ledger Name" className="w-full text-xs p-1.5 border rounded bg-slate-50 dark:bg-[#151521]" defaultValue="Siva Bookstore" />
                  <input type="text" disabled placeholder="Mobile No" className="w-full text-xs p-1.5 border rounded border-blue-400 bg-blue-50 dark:bg-blue-900/20" defaultValue="9876543210" />
                  <div className="flex justify-center mt-2">
                    <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1"><MousePointer2 size={12}/> Save Client</button>
                  </div>
                </div>
              </div>

              <ArrowRight className="text-slate-400 hidden md:block" size={32} />
              <div className="md:hidden h-8 w-1 bg-slate-200 dark:bg-slate-700 rounded"></div>

              {/* Step 2 */}
              <div className="flex-1 bg-white dark:bg-[#1E1E2D] p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm relative w-full">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3 text-center border-b pb-2">Client Details (Verified)</h3>
                <div className="text-xs space-y-2 border border-slate-100 dark:border-slate-700 p-2 rounded">
                  <div className="flex justify-between border-b border-dashed pb-1">
                    <span className="text-slate-500">Name</span>
                    <span className="font-bold dark:text-white">Siva Bookstore</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mobile</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">9876543210</span>
                  </div>
                </div>
              </div>

              <ArrowRight className="text-slate-400 hidden md:block" size={32} />
              <div className="md:hidden h-8 w-1 bg-slate-200 dark:bg-slate-700 rounded"></div>

              {/* Step 3 */}
              <div className="flex-1 bg-white dark:bg-[#1E1E2D] p-5 rounded-lg border border-blue-400 shadow-md relative w-full">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3 text-center border-b pb-2">Create Bill (Auto-fill)</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Type Mobile No</span>
                    <div className="relative">
                      <input type="text" disabled className="w-full text-xs p-1.5 border border-blue-400 rounded bg-blue-50 dark:bg-blue-900/20" defaultValue="9876543210" />
                      <MousePointer2 className="absolute right-2 top-1.5 text-slate-400" size={12} />
                    </div>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-[10px] leading-tight">
                    <p className="font-bold text-sm dark:text-white">Siva Bookstore</p>
                    <p className="text-slate-500">THIYAGARAJA HR SEC SCHOOL</p>
                    <p className="text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 size={10}/> Details fetched automatically!</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'books' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Book Workflow</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-8">Just like clients, adding books correctly makes the billing process instant.</p>
            
            <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
              
              {/* Step 1 */}
              <div className="flex-1 bg-white dark:bg-[#1E1E2D] p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm relative w-full">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3 text-center border-b pb-2">Books Menu - Add Book</h3>
                <div className="space-y-2">
                  <input type="text" disabled placeholder="Item Code" className="w-full text-xs p-1.5 border rounded bg-slate-50 dark:bg-[#151521]" defaultValue="BK001" />
                  <input type="text" disabled placeholder="Book Name" className="w-full text-xs p-1.5 border rounded border-blue-400 bg-blue-50 dark:bg-blue-900/20" defaultValue="10 அமுதாசுரபி தமிழ்" />
                  <input type="text" disabled placeholder="Rate" className="w-full text-xs p-1.5 border rounded bg-slate-50 dark:bg-[#151521]" defaultValue="₹ 120.00" />
                  <div className="flex justify-center mt-2">
                    <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1"><MousePointer2 size={12}/> Save Book</button>
                  </div>
                </div>
              </div>

              <ArrowRight className="text-slate-400 hidden md:block" size={32} />
              <div className="md:hidden h-8 w-1 bg-slate-200 dark:bg-slate-700 rounded"></div>

              {/* Step 2 */}
              <div className="flex-[1.5] bg-white dark:bg-[#1E1E2D] p-5 rounded-lg border border-blue-400 shadow-md relative w-full">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3 text-center border-b pb-2">Create Bill (Smart Search)</h3>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b text-slate-500">
                        <th className="pb-1">Item Code</th>
                        <th className="pb-1">Item Name</th>
                        <th className="pb-1">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="pt-2">
                           <input type="text" disabled className="w-16 p-1 border rounded bg-green-50 dark:bg-green-900/20 text-green-700 font-bold" defaultValue="BK001" />
                        </td>
                        <td className="pt-2 relative">
                           <input type="text" disabled className="w-full p-1 border border-blue-400 rounded bg-blue-50 dark:bg-blue-900/20" defaultValue="அமுதா..." />
                           <div className="absolute top-full left-0 mt-1 w-full bg-white border shadow text-[10px] p-1 rounded z-10 dark:bg-slate-800 dark:border-slate-700 text-blue-600 font-bold">
                             ✓ 10 அமுதாசுரபி தமிழ்
                           </div>
                        </td>
                        <td className="pt-2">
                           <input type="text" disabled className="w-16 p-1 border rounded bg-green-50 dark:bg-green-900/20 text-green-700 font-bold" defaultValue="120.00" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-[10px] text-center mt-6 text-slate-500">Type book name <ArrowRight size={10} className="inline"/> Code and Rate auto-fills!</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Creating Bills - UI Structure</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-6">The Create Bill page is divided into two major columns to speed up entry.</p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="border-2 border-blue-500/30 rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/10">
                <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-2">LEFT SIDE: Customer Search</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Type the Mobile Number or select the Client Name from the dropdown. The full details will instantly show up in a box below.</p>
                <div className="p-3 bg-white dark:bg-[#1E1E2D] rounded border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-400">Mobile No</span><br/>
                  <strong className="text-slate-800 dark:text-white">9876543210</strong>
                </div>
              </div>
              <div className="border-2 border-purple-500/30 rounded-lg p-4 bg-purple-50/50 dark:bg-purple-900/10">
                <h3 className="font-bold text-purple-700 dark:text-purple-400 mb-2">RIGHT SIDE: Invoice Details</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Fill in Transport, Destination, Bundles, and LR Details here. Press Enter to jump between fields easily.</p>
                <div className="p-3 bg-white dark:bg-[#1E1E2D] rounded border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-400">Transport</span><br/>
                  <strong className="text-slate-800 dark:text-white">DIRECT SALES</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shortcuts' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Keyboard Shortcuts</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-6">Master these shortcuts to create bills 10x faster without using your mouse.</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-[#1a1a2e]">
                <div className="flex gap-2">
                  <kbd className="px-3 py-1.5 bg-white dark:bg-[#1E1E2D] border border-slate-300 dark:border-slate-600 shadow-sm rounded-md font-mono text-sm font-bold text-slate-700 dark:text-slate-300">Enter</kbd>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Move to Next Field</h4>
                  <p className="text-sm text-slate-500">Pressing Enter will automatically jump to the next logical input box. In the last column (Amount), pressing Enter creates a new row!</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-[#1a1a2e]">
                <div className="flex gap-2">
                  <kbd className="px-3 py-1.5 bg-white dark:bg-[#1E1E2D] border border-slate-300 dark:border-slate-600 shadow-sm rounded-md font-mono text-sm font-bold text-slate-700 dark:text-slate-300">F2</kbd>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Save / Print Invoice</h4>
                  <p className="text-sm text-slate-500">Instantly triggers the Save prompt from anywhere on the billing page.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-[#1a1a2e]">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 justify-center">
                    <kbd className="px-3 py-1.5 bg-white dark:bg-[#1E1E2D] border border-slate-300 dark:border-slate-600 shadow-sm rounded-md font-mono text-sm font-bold text-slate-700 dark:text-slate-300">↑</kbd>
                  </div>
                  <div className="flex gap-2">
                    <kbd className="px-3 py-1.5 bg-white dark:bg-[#1E1E2D] border border-slate-300 dark:border-slate-600 shadow-sm rounded-md font-mono text-sm font-bold text-slate-700 dark:text-slate-300">←</kbd>
                    <kbd className="px-3 py-1.5 bg-white dark:bg-[#1E1E2D] border border-slate-300 dark:border-slate-600 shadow-sm rounded-md font-mono text-sm font-bold text-slate-700 dark:text-slate-300">↓</kbd>
                    <kbd className="px-3 py-1.5 bg-white dark:bg-[#1E1E2D] border border-slate-300 dark:border-slate-600 shadow-sm rounded-md font-mono text-sm font-bold text-slate-700 dark:text-slate-300">→</kbd>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Navigate Table Cells</h4>
                  <p className="text-sm text-slate-500">Use arrow keys to freely move around the items table (Up/Down between rows, Left/Right between columns).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'print' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Print & Save to PDF</h1>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
              <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-1">Native Print Dialog</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">Dolphin Billing uses the highly reliable Browser Print system to generate 100% crisp, vector-quality PDF invoices.</p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg">Press F2 or Click Save</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">A popup will confirm if you want to generate the PDF.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg">Select "Save as PDF"</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">In the print window that opens, look for the <strong>Destination</strong> dropdown and change it from your physical printer to <strong>Save as PDF</strong>.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
