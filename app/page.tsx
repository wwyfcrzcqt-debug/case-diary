'use client';
import React, { useState } from 'react';

export default function ChamberLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('associate'); // Default demo toggle

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-8 font-sans">
      {/* Top Header */}
      <div className="flex justify-between items-center text-xs tracking-widest text-neutral-400 uppercase">
        <span>Chamber Portal</span>
        <span className="border border-neutral-700 px-3 py-1">Restricted Access</span>
      </div>

      {/* Main Split Layout */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center my-12">
        {/* Chamber Information */}
        <div className="space-y-6">
          <span className="inline-block border border-neutral-800 text-neutral-400 text-xs px-3 py-1 uppercase tracking-wider">
            CHAMBER NAME 
          </span>
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            Lister AI - <br /> Extract. Arrange. Assign.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
            Restricted to designated advocates, associates, and chamber clerks. Unauthorized entry or data extraction is prohibited under chamber security protocol.
          </p>
        </div>

        {/* Auth Box */}
        <div className="border border-neutral-800 bg-[#080808] p-8 rounded-none max-w-md w-full mx-auto">
          <h2 className="text-xl font-bold mb-1">Staff Authentication</h2>
          <p className="text-xs text-neutral-500 mb-6">Enter assigned chamber credentials</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-neutral-400 uppercase tracking-wider block mb-1">
                Chamber Email / Identifier
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@test.com"
                className="w-full bg-black border border-neutral-700 text-white p-2.5 text-sm focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-400 uppercase tracking-wider block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="test123"
                className="w-full bg-black border border-neutral-700 text-white p-2.5 text-sm focus:border-white focus:outline-none"
              />
            </div>

            {/* Role Switcher (For Judges / Live Demo Testing) */}
            <div className="pt-2">
              <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">
                Simulated Permission Tier
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black border border-neutral-700 text-xs text-neutral-300 p-2 focus:border-white focus:outline-none"
              >
                <option value="super_admin">Super Admin (Head of Chamber - Master Key)</option>
                <option value="associate">Associate Counsel (Limited Case Actions)</option>
                <option value="clerk">Court Clerk / Munshi (Logistics Only)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-white text-black font-semibold py-2.5 text-sm hover:bg-neutral-200 transition-colors uppercase tracking-wider"
            >
              Authenticate & Enter
            </button>
          </form>

          <p className="text-[11px] text-neutral-600 mt-6 text-center">
            Lost access credentials? Contact the Chamber Lead Counsel.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-neutral-600 border-t border-neutral-900 pt-4">
        Indian Courts Case Register · Supreme Court, High Courts & District Tribunals
      </div>
    </div>
  );
}