import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, User, DollarSign, Calendar, Briefcase } from 'lucide-react';

interface PresetSelectorProps {
  onSelectPreset: (presetKey: 'low-risk' | 'medium-risk' | 'high-risk') => void;
  selectedPreset: string | null;
}

export default function PresetSelector({ onSelectPreset, selectedPreset }: PresetSelectorProps) {
  const presets = [
    {
      key: 'low-risk' as const,
      name: 'Johnathan Harris',
      employer: 'AlphaTech Solutions Global',
      role: 'Lead Principal Engineer',
      salary: '$14,500 / mo',
      requested: '$75,000',
      tenure: '36 months',
      risk: 'Low Risk' as const,
      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: ShieldCheck,
      desc: 'Pristine salary direct deposits, established tenure, zero returned checks, low outstanding leverage.'
    },
    {
      key: 'medium-risk' as const,
      name: 'Priya Sharma',
      employer: 'Studio Bloom Design LLC',
      role: 'Creative Director (Self-Employed)',
      salary: '$8,200 / mo',
      requested: '$40,000',
      tenure: '24 months',
      risk: 'Medium Risk' as const,
      color: 'border-amber-500 bg-amber-50/50 text-amber-700 hover:bg-amber-50',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertTriangle,
      desc: 'Significant freelance contracts, elevated outstanding credit card leverage, minor PayPal inflow validation gaps.'
    },
    {
      key: 'high-risk' as const,
      name: 'Vikram Rathore',
      employer: 'Casual Labor Subcontractor',
      role: 'Unstructured Contractor',
      salary: '$2,900 / mo',
      requested: '$25,000',
      tenure: '12 months',
      risk: 'High Risk' as const,
      color: 'border-rose-500 bg-rose-50/50 text-rose-700 hover:bg-rose-50',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: AlertOctagon,
      desc: 'Multiple cash-out drawdowns, regular payday lender usage, NSF overdraft alarms, unrecorded PAN file.'
    }
  ];

  return (
    <div id="preset-selector-container" className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <div>
          <h2 id="preset-selector-title" className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <User className="h-5 w-5 text-slate-500" />
            Select Corporate Applicant Profile Template
          </h2>
          <p id="preset-selector-subtitle" className="text-sm text-slate-500">
            Choose a mock profile below to instantly load their bank statement records, salary slips, and run the sequential audit.
          </p>
        </div>
      </div>

      <div id="presets-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const IconComponent = preset.icon;
          const isSelected = selectedPreset === preset.key;

          return (
            <button
              key={preset.key}
              id={`preset-card-${preset.key}`}
              onClick={() => onSelectPreset(preset.key)}
              className={`flex flex-col text-left p-5 rounded-xl border transition-all duration-200 cursor-pointer h-full ${
                isSelected
                  ? `ring-2 ring-slate-800 shadow-md ${preset.key === 'low-risk' ? 'bg-emerald-50/30' : preset.key === 'medium-risk' ? 'bg-amber-50/20' : 'bg-rose-50/20'} border-slate-700`
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between w-full mb-3">
                <span id={`preset-badge-${preset.key}`} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${preset.badgeColor}`}>
                  {preset.risk}
                </span>
                <IconComponent className={`h-5 w-5 ${
                  preset.key === 'low-risk' ? 'text-emerald-600' : preset.key === 'medium-risk' ? 'text-amber-600' : 'text-rose-600'
                }`} />
              </div>

              <h3 id={`preset-name-${preset.key}`} className="font-bold text-slate-900 text-base leading-tight">
                {preset.name}
              </h3>
              
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600">
                <Briefcase className="h-3 w-3" />
                <span className="truncate max-w-[180px]">{preset.role}</span>
              </div>

              <p id={`preset-desc-${preset.key}`} className="text-xs text-slate-500 mt-2 flex-grow line-clamp-3">
                {preset.desc}
              </p>

              <div className="border-t border-slate-100 mt-4 pt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Salary</span>
                  <span className="font-semibold text-slate-700">{preset.salary}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Request</span>
                  <span className="font-semibold text-slate-700">{preset.requested}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Tenure</span>
                  <span className="font-semibold text-slate-700">{preset.tenure}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
