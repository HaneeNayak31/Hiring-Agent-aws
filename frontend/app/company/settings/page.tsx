'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { CompanyNav, Breadcrumbs } from '@/components/layout';

export default function CompanySettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CompanyNav />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <Breadcrumbs items={[{ label: 'SETTINGS' }]} />

        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 font-mono">
          <div>
            <span className="text-xs text-primary uppercase tracking-widest block mb-2 font-bold">
              // Control Room Configuration
            </span>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              SETTINGS
            </h1>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saved ? 'Saved Successfully ✓' : 'Save Changes'}</span>
          </button>
        </div>

        <div className="space-y-10 font-mono text-xs">
          <div className="border border-white/15 bg-black p-8">
            <h2 className="font-bold text-base text-primary uppercase mb-6 pb-3 border-b border-white/10">
              // COMPANY PROFILE
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/50 mb-2 uppercase">Company Name</label>
                <input
                  type="text"
                  defaultValue="Stripe, Inc."
                  className="w-full bg-white/[0.03] border border-white/20 p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-white/50 mb-2 uppercase">Primary Domain</label>
                <input
                  type="text"
                  defaultValue="stripe.com"
                  className="w-full bg-white/[0.03] border border-white/20 p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="border border-white/15 bg-black p-8">
            <h2 className="font-bold text-base text-primary uppercase mb-6 pb-3 border-b border-white/10">
              // MCP PROTOCOL CONFIGURATION
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-white/50 mb-2 uppercase">MCP Server Endpoint URL</label>
                <input
                  type="text"
                  defaultValue="https://h6aggmskk4.execute-api.ap-south-1.amazonaws.com/mcp"
                  className="w-full bg-white/[0.03] border border-white/20 p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-4">
                <input type="checkbox" id="requireSig" defaultChecked className="w-4 h-4 accent-primary" />
                <label htmlFor="requireSig" className="text-white font-sans">
                  Require cryptographic candidate delegation signatures for incoming applications
                </label>
              </div>
            </div>
          </div>

          <div className="border border-white/15 bg-black p-8">
            <h2 className="font-bold text-base text-primary uppercase mb-6 pb-3 border-b border-white/10">
              // VERIFICATION THRESHOLDS
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/50 mb-2 uppercase">Minimum Evidence Coverage %</label>
                <input
                  type="number"
                  defaultValue={80}
                  className="w-full bg-white/[0.03] border border-white/20 p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-white/50 mb-2 uppercase">Minimum Profile Fit Score %</label>
                <input
                  type="number"
                  defaultValue={85}
                  className="w-full bg-white/[0.03] border border-white/20 p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
