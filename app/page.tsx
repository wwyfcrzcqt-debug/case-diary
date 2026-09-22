'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [role, setRole] = useState('associate');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-neutral-800">
      
      {/* Header Navigation */}
      <header className="flex justify-between items-center p-6 md:px-12 border-b border-neutral-900">
        <div className="text-[10px] tracking-widest text-neutral-500 uppercase font-semibold">
          Chamber Portal
        </div>
        <div className="text-[10px] tracking-widest text-neutral-500 uppercase font-semibold border border-neutral-800 px-3 py-1">
          Restricted Access
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          
          {/* Left Column: Branding & Disclosure */}
          <div className="space-y-6">
            <div className="inline-block border border-neutral-800 px-3 py-1 text-[10px] tracking-widest text-neutral-500 uppercase font-semibold">
              Chamber Name
            </div>
            <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Lister AI -<br />
              <span className="whitespace-nowrap">Extract. Arrange. Assign.</span>
            </h1>
            <p className="text-neutral-500 text-xs leading-relaxed max-w-sm mt-4">
              Restricted to designated advocates, associates, and chamber clerks. Unauthorized entry or data extraction is prohibited under chamber security protocol.
            </p>
          </div>

          {/* Right Column: Authentication Form */}
          <div className="border border-neutral-800 bg-[#030303] p-8 md:p-10 w-full max-w-md ml-auto">
            <h2 className="text-base font-semibold text-white mb-1">Staff Authentication</h2>
            <p className="text-neutral-500 text-xs mb-8">Enter assigned chamber credentials</p>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Chamber Email / Identifier</label>
                <input 
                  type="text" 
                  defaultValue="test@test.com"
                  className="w-full bg-black border border-neutral-800 text-neutral-300 p-3 text-sm focus:border-neutral-500 focus:outline-none transition-colors" 
                />
              </div>
              
              <div className="space-y-2 relative">
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Password</label>
                <input 
                  type="password" 
                  defaultValue="password"
                  className="w-full bg-black border border-neutral-800 text-neutral-300 p-3 text-sm focus:border-neutral-500 focus:outline-none transition-colors" 
                />
                <div className="absolute right-3 top-[28px] text-neutral-500 cursor-pointer hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Simulated Permission Tier</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-black border border-neutral-800 text-neutral-300 p-3 text-xs focus:border-neutral-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="associate">Associate Counsel (Limited Case Actions)</option>
                  <option value="lead">Lead Counsel (Full Access)</option>
                  <option value="admin">Super Admin</option>
                </select>
              </div>

              <Link 
                href={`/dashboard?role=${role}`}
                className="block w-full text-center bg-white text-black font-bold px-4 py-3 hover:bg-neutral-200 transition-colors uppercase tracking-widest text-[11px] mt-6"
              >
                Authenticate & Enter
              </Link>

              <div className="text-center mt-6">
                <p className="text-[9px] text-neutral-600">
                  Lost access credentials? Contact the Chamber Lead Counsel.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-[10px] text-neutral-700">
        Indian Courts Case Register - Supreme Court, High Courts & District Tribunals
      </footer>
      
    </div>
  );
}