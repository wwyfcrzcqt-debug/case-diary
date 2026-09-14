'use client';
import Link from 'next/link';

export default function Login() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8 font-sans">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Lister AI</h1>
          <p className="text-neutral-500 text-lg mb-8">Extract. Arrange. Assign.</p>
          <p className="text-sm text-neutral-400">
            Daily cause list extraction and chamber assignment system. Restricted access.
          </p>
        </div>
        <div className="border border-neutral-800 bg-[#080808] p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300 mb-6">Staff Authentication</h2>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Chamber ID" 
              className="w-full bg-black border border-neutral-700 text-neutral-300 p-3 text-sm focus:border-white focus:outline-none" 
            />
            <input 
              type="password" 
              placeholder="Passcode" 
              className="w-full bg-black border border-neutral-700 text-neutral-300 p-3 text-sm focus:border-white focus:outline-none" 
            />
            <Link 
              href="/dashboard" 
              className="block w-full text-center bg-white text-black font-semibold px-4 py-3 hover:bg-neutral-200 transition-colors uppercase tracking-wider text-sm mt-4"
            >
              Access Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}