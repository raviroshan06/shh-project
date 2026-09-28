import React from 'react';
import { AlertTriangle, Info, CheckCircle, Database } from 'lucide-react';

export default function DemoBanner({ onSelectPersona, currentPersonaId }) {
  const personas = [
    { id: 'MH-CIT-1001', name: 'Ravi Kumar', label: 'Name Mismatch', color: 'border-amber-400 bg-amber-50' },
    { id: 'MH-CIT-1002', name: 'Anita Patil', label: 'Address Mismatch', color: 'border-blue-400 bg-blue-50' },
    { id: 'MH-CIT-1003', name: 'Suresh Jadhav', label: 'Missing Record', color: 'border-purple-400 bg-purple-50' },
    { id: 'MH-CIT-1004', name: 'Priya Deshmukh', label: 'All Matched', color: 'border-emerald-400 bg-emerald-50' },
    { id: 'MH-CIT-1005', name: 'Amit Shinde', label: 'Multiple Mismatches', color: 'border-rose-400 bg-rose-50' },
  ];

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[11px] tracking-wide uppercase">
            SIH 2026 DEMO PROTOTYPE
          </span>
          <span className="text-slate-300 font-medium hidden sm:inline">
            Fictional Citizen Data • Mock Government Integrations
          </span>
        </div>

        {onSelectPersona && (
          <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
            <span className="text-slate-400 font-semibold uppercase text-[10px] mr-1 flex items-center">
              <Database className="w-3 h-3 mr-1 text-amber-400" /> Switch Demo:
            </span>
            {personas.map((p) => {
              const active = currentPersonaId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPersona(p.id)}
                  className={`px-2 py-1 rounded transition text-[11px] font-medium whitespace-nowrap ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={p.label}
                >
                  {p.name} <span className="opacity-75 text-[9px]">({p.label})</span>
                </button>
              );
            })}
            <button
              onClick={() => onSelectPersona('OFFICER-PUNE-01')}
              className={`px-2 py-1 rounded transition text-[11px] font-medium whitespace-nowrap ${
                currentPersonaId === 'OFFICER-PUNE-01'
                  ? 'bg-orange-600 text-white font-bold shadow'
                  : 'bg-slate-800 text-orange-300 hover:bg-slate-700'
              }`}
            >
              Desk Officer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
