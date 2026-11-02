import React, { useState } from 'react';
import { X, Database, CheckCircle, AlertCircle, ShieldCheck, Key } from 'lucide-react';
import { useRental } from '../context/RentalContext';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { isBackendConnected, updateBackendConfig } = useRental();

  const [url, setUrl] = useState(() => localStorage.getItem('renteasy_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '');
  const [anonKey, setAnonKey] = useState(() => localStorage.getItem('renteasy_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [status, setStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBackendConfig(url, anonKey);
    setStatus('Configuration saved. Verifying connection...');
    setTimeout(() => {
      setStatus(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#167B62] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Supabase Backend Configuration</h3>
            <p className="text-xs text-slate-500">Live PostgreSQL Database & Realtime Messaging</p>
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl mb-5 text-xs font-semibold flex items-center gap-2 ${
          isBackendConnected ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {isBackendConnected ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
          <span>
            {isBackendConnected 
              ? 'Status: Supabase backend is configured and active.' 
              : 'Status: Operating in local persistent mode. Provide Supabase credentials below to sync across devices.'}
          </span>
        </div>

        {status && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl">
            {status}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono outline-none focus:border-[#167B62] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Supabase Public Anon Key
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono outline-none focus:border-[#167B62] focus:bg-white"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p>
              <strong>SQL Migration:</strong> Run the complete schema script in <code className="bg-slate-200 px-1 py-0.5 rounded">src/services/supabaseSchema.sql</code> in your Supabase SQL Editor.
            </p>
            <p>
              Credentials can also be stored in your project's <code className="bg-slate-200 px-1 py-0.5 rounded">.env</code> as <code className="bg-slate-200 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="bg-slate-200 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#167B62] hover:bg-[#126550] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
