'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import extractedMatters from './chamber_matters.json';

export default function Dashboard() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [isWeekend, setIsWeekend] = useState(false);

  // Generates real-time clock, prevents Next.js hydration mismatch, and checks for weekends
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }));
      // 0 is Sunday, 6 is Saturday
      setIsWeekend(now.getDay() === 0 || now.getDay() === 6);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    window.print();
  };

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        window.location.reload(); 
      } else {
        alert("Failed to sync: " + data.error);
      }
    } catch (error) {
      alert("Server error occurred.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans print:bg-white print:text-black print:p-0">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-end border-b border-neutral-800 pb-4 print:border-black print:pb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight print:text-black print:text-2xl">Lister AI Dashboard</h1>
            <p className="text-neutral-500 text-sm mt-1 print:text-neutral-700">Chamber Management System</p>
            <p className="text-neutral-400 text-xs font-mono mt-3 print:text-black print:font-bold print:mt-2">
              {currentDateTime || "Loading time..."}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-3">
            <Link 
              href="/" 
              className="text-xs text-red-500 hover:text-white transition-colors uppercase tracking-widest font-bold print:hidden"
            >
              ← Log Out
            </Link>
            <div className="text-xs tracking-widest text-neutral-400 uppercase border border-neutral-700 px-3 py-1 bg-[#080808] print:bg-white print:border-black print:text-black">
              Super Admin Active
            </div>
          </div>
        </header>

        <section>
          <div className="flex justify-between items-center mb-4 print:hidden">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Daily Cause List - Live Sync</h2>
            <div className="space-x-3">
              <button onClick={handleExport} className="text-xs bg-white text-black font-semibold px-4 py-2 hover:bg-neutral-200 transition-colors uppercase tracking-wider">
                Export Printable Docket
              </button>
              <button 
                onClick={handleSync} 
                disabled={isSyncing}
                className={`text-xs border border-neutral-700 px-4 py-2 uppercase tracking-wider transition-colors ${
                  isSyncing ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'hover:bg-white hover:text-black'
                }`}
              >
                {isSyncing ? 'Syncing...' : 'Sync Latest Docket'}
              </button>
            </div>
          </div>
          
          <h2 className="hidden print:block text-lg font-bold mb-4 border-b border-black pb-2">Daily Cause List</h2>

          <div className="w-full border border-neutral-800 bg-[#080808] p-4 print:bg-white print:border-black print:p-0">
            {isWeekend || extractedMatters.length === 0 ? (
              <div className="w-full text-center py-12 text-sm text-neutral-500 font-medium tracking-wide">
                No cases listed for today or tomorrow.
              </div>
            ) : (
              <table className="w-full text-left text-sm print:text-black">
                <thead className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider text-[10px] print:border-black print:text-black">
                  <tr>
                    <th className="p-4 font-normal w-16 print:p-2">Item</th>
                    <th className="p-4 font-normal print:p-2">Case Details & Court</th>
                    <th className="p-4 font-normal w-48 print:p-2">Assign Associate</th>
                    <th className="p-4 font-normal w-40 print:p-2">Status</th>
                    <th className="p-4 font-normal w-64 print:p-2">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 print:divide-black">
                  {extractedMatters.map((matter, index) => (
                    <tr key={index}>
                      <td className="p-4 align-top font-bold text-lg print:p-2 print:text-black">
                        {matter.item_no}
                      </td>
                      <td className="p-4 align-top print:p-2">
                        <div className="font-bold text-blue-400 print:text-black">{matter.case_no}</div>
                        <div className="text-xs text-neutral-400 mt-1 print:text-neutral-700">{matter.judge}</div>
                        {matter.vc_link && (
                          <a 
                            href={matter.vc_link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs text-green-500 hover:text-green-400 underline mt-3 block print:hidden"
                          >
                            ↗ Join VC Room
                          </a>
                        )}
                      </td>
                      <td className="p-4 align-top print:p-2">
                        <select 
                          defaultValue={matter.advocate_matched}
                          className="w-full bg-black border border-neutral-700 text-neutral-300 p-2 text-xs focus:border-white focus:outline-none rounded-none appearance-none print:bg-white print:border-none print:text-black print:p-0"
                        >
                          <option value="GAURAV MOHUNTA">Adv. Gaurav</option>
                          <option value="AKSHAY BHAN">Adv. Akshay</option>
                          <option value="ASHISH KAPOOR">Adv. Ashish</option>
                          <option value="Unassigned">Unassigned</option>
                        </select>
                      </td>
                      <td className="p-4 align-top print:p-2">
                        <select 
                          defaultValue={matter.status}
                          className="w-full bg-black border border-neutral-700 text-neutral-300 p-2 text-xs focus:border-white focus:outline-none rounded-none appearance-none print:bg-white print:border-none print:text-black print:p-0"
                        >
                          <option value="Pending Assignment">Pending Assignment</option>
                          <option value="Argued">Argued</option>
                          <option value="Adjourned">Adjourned</option>
                        </select>
                      </td>
                      <td className="p-4 align-top print:p-2">
                        <input type="text" placeholder="Add note..." className="w-full bg-black border border-neutral-700 text-neutral-300 p-2 text-xs focus:border-white focus:outline-none rounded-none print:bg-white print:border-none print:text-black print:p-0 print:placeholder-transparent" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}