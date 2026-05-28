import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Circle, Eye, ShieldCheck, FileCheck, ClipboardEdit, BrainCircuit, Activity } from 'lucide-react';

interface AuditProgressBarProps {
  isLoading: boolean;
}

export default function AuditProgressBar({ isLoading }: AuditProgressBarProps) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { label: 'STEP 1: Profile Extraction', desc: 'Parsing salary details, applicant identities, and employer registers.', icon: Eye },
    { label: 'STEP 2: Financial Analysis', desc: 'Evaluating salary consistency, debt-to-income balance, and cash margins.', icon: Activity },
    { label: 'STEP 3: Risk Identification', desc: 'Auditing credit anomalies, unusual outbound payments, and payday lenders.', icon: ShieldCheck },
    { label: 'STEP 4: Missing Document Validation', desc: 'Verifying active PAN records, biometric Aadhaar, and salary proof status.', icon: FileCheck },
    { label: 'STEP 5: Creditworthiness Assessment', desc: 'Computing bank rating models and credit default ratios.', icon: BrainCircuit },
    { label: 'STEP 6: Underwriting Recommendation', desc: 'Generating senior action advice and pricing metrics.', icon: ClipboardEdit }
  ];

  useEffect(() => {
    if (!isLoading) {
      setActiveStep(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isLoading, steps.length]);

  if (!isLoading) return null;

  return (
    <div id="loading-progress-curtain" className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 text-center shadow-md max-w-2xl mx-auto">
      <div className="flex flex-col items-center mb-6">
        <Loader2 className="animate-spin h-8 w-8 text-slate-800 mb-3" />
        <h3 id="loading-title" className="text-base font-bold text-slate-900">
          Senior Banking Underwriting Engine Active
        </h3>
        <p id="loading-desc" className="text-xs text-slate-500 mt-1">
          Reviewing provided bank statement deposits, payroll logs, and KYC registers sequentially.
        </p>
      </div>

      <div id="sequential-steps-log" className="text-left space-y-4 max-w-lg mx-auto">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx < activeStep;
          const isActive = idx === activeStep;

          return (
            <div
              key={idx}
              id={`audit-step-${idx}`}
              className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all duration-300 ${
                isActive
                  ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800'
                  : isCompleted
                  ? 'border-emerald-100 bg-emerald-50/20'
                  : 'border-slate-100 bg-white opacity-40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : isActive ? (
                  <Loader2 className="animate-spin h-5 w-5 text-slate-800" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300" />
                )}
              </div>

              <div className="flex-grow">
                <div className="flex items-center gap-1.5">
                  <StepIcon className={`h-4 w-4 ${isActive ? 'text-slate-800' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <h4 className={`text-xs font-bold leading-tight ${isActive ? 'text-slate-900' : isCompleted ? 'text-emerald-800' : 'text-slate-500'}`}>
                    {step.label}
                  </h4>
                </div>
                {isActive && (
                  <p className="text-[11px] text-slate-600 mt-1 font-medium motion-safe:animate-pulse">
                    {step.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
