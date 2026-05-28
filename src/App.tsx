import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  History,
  Trash2,
  FileCheck,
  UserCheck,
  Building,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';
import PresetSelector from './components/PresetSelector';
import DocumentUploadCard from './components/DocumentUploadCard';
import AuditProgressBar from './components/AuditProgressBar';
import ReportDashboard from './components/ReportDashboard';
import { LoanAssessmentReport, UploadedFile } from './types';

export default function App() {
  const [selectedPreset, setSelectedPreset] = useState<'low-risk' | 'medium-risk' | 'high-risk'>('low-risk');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [report, setReport] = useState<LoanAssessmentReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'live' | 'simulated'>('simulated');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // History tracking stored in localStorage
  const [history, setHistory] = useState<LoanAssessmentReport[]>([]);

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('loan_audit_history_dockets');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history from local storage', e);
    }
  }, []);

  const saveToHistory = (newReport: LoanAssessmentReport) => {
    try {
      const updated = [newReport, ...history.filter(h => h.id !== newReport.id)].slice(0, 10);
      setHistory(updated);
      localStorage.setItem('loan_audit_history_dockets', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('loan_audit_history_dockets');
  };

  const loadPastReport = (pastReport: LoanAssessmentReport) => {
    setReport(pastReport);
    // Determine the preset key from past report
    if (pastReport.applicant_name.includes('Johnathan')) {
      setSelectedPreset('low-risk');
    } else if (pastReport.applicant_name.includes('Priya')) {
      setSelectedPreset('medium-risk');
    } else if (pastReport.applicant_name.includes('Vikram')) {
      setSelectedPreset('high-risk');
    }
    setErrorMsg(null);
  };

  const handleRunAudit = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setReport(null);

    try {
      // Small timeout to let the sequential progress bar cycle beautifully
      await new Promise((resolve) => setTimeout(resolve, 3600));

      const response = await fetch('/api/analyze-loan-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileName: selectedPreset,
          files: uploadedFiles,
          customData: {
            assessmentTimestamp: new Date().toISOString(),
            seniorReviewer: 'Senior Underwriting Desk'
          }
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server HTTP response status error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.report) {
        setReport(data.report);
        setMode(data.mode);
        saveToHistory(data.report);
      } else {
        throw new Error(data.error || 'The banking underwriting report returned empty of critical assessments.');
      }
    } catch (err: any) {
      console.error('Assessment execution failed:', err);
      setErrorMsg(err.message || 'Audit service failure. Please review API keys setup.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalSanctionedSum = history.reduce((sum, item) => {
    if (item.step6_recommendation.final_decision.startsWith('Approve')) {
      return sum + item.step6_recommendation.max_eligible_loan;
    }
    return sum;
  }, 0);

  return (
    <div id="full-app-root" className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200 text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Portal Header */}
        <header id="main-header" className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Layers className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Underwriting Command Desk</span>
            </div>
            <h1 id="portal-title" className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Loan Application & Risk Synthesis Portal
            </h1>
            <p id="portal-subtitle" className="text-xs text-slate-500 mt-1 max-w-2xl font-medium">
              Enterprise financial balance-sheet cross-examinations, KYC validation registers, and risk-adjusted pricing recommendations for senior credit team sign-offs.
            </p>
          </div>

          {/* Quick Metrics Badge Panel */}
          <div className="flex gap-4 shrink-0 bg-white p-3.5 border border-slate-200 rounded-xl shadow-sm">
            <div className="text-left border-r border-slate-100 pr-4">
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Total Approved</span>
              <span className="text-sm font-black text-slate-800">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalSanctionedSum)}
              </span>
            </div>
            <div className="text-left">
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Audit Dockets</span>
              <span className="text-sm font-black text-slate-800">{history.length} Files</span>
            </div>
          </div>
        </header>

        <main id="app-main-content">
          <AnimatePresence mode="wait">
            {/* Show Progress loader if analyzing */}
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <AuditProgressBar isLoading={isLoading} />
              </motion.div>
            )}

            {/* Error messaging state */}
            {errorMsg && !isLoading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-800 mb-6 flex items-start gap-3 shadow-sm max-w-2xl mx-auto"
              >
                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-grow">
                  <h4 className="text-xs font-bold uppercase text-rose-900 mb-1">Analytical System Error</h4>
                  <p className="text-xs text-slate-700 leading-normal font-medium">{errorMsg}</p>
                  <p className="text-[10px] text-rose-700 mt-2 font-semibold">
                    Tip: If running on cloud container, verify the GEMINI_API_KEY is saved inside your workspace Secrets list.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Main Interactive Controls */}
            {!isLoading && (
              <motion.div
                key="workspace"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* 1. Profile select widget */}
                <PresetSelector onSelectPreset={setSelectedPreset} selectedPreset={selectedPreset} />

                {/* 2. Drag & Drop file upload widget */}
                <DocumentUploadCard
                  onFilesReady={setUploadedFiles}
                  onRunAudit={handleRunAudit}
                  isLoading={isLoading}
                  selectedPreset={selectedPreset}
                />

                {/* Simulated mode warning banner */}
                {mode === 'simulated' && !report && (
                  <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-start gap-3 max-w-3xl mx-auto text-slate-700">
                    <HelpCircle className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Developer Sandbox Notice</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
                        To run live document extraction via <strong>Gemini 3.5 Flash Multimodal</strong> matching layout formats, please add your <code>GEMINI_API_KEY</code> within Settings &gt; Secrets menu. Sandbox mode will generate full risk-adjusted reports securely for review.
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Generated Report Dashboard */}
                {report && (
                  <motion.section
                    id="report-section-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 85, delay: 0.1 }}
                  >
                    {mode === 'simulated' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs font-semibold mb-4 text-center">
                        Report generated utilizing high-integrity sandbox simulator. Key identities and calculations mapped correctly.
                      </div>
                    )}
                    <ReportDashboard report={report} mode={mode} />
                  </motion.section>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Historical Audits list bottom banner */}
          {history.length > 0 && !isLoading && (
            <section id="historical-dockets-drawer" className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <History className="h-5 w-5 text-slate-400" />
                  Historical Credit Appraisal Dockets
                </h3>
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Reset Logs
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {history.map((past, idx) => {
                  const pastDecision = past.step6_recommendation.final_decision;
                  const isPastApprove = pastDecision.startsWith('Approve');
                  const isReject = pastDecision === 'Reject';

                  return (
                    <div
                      key={past.id}
                      onClick={() => loadPastReport(past)}
                      className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl hover:shadow-sm transition cursor-pointer text-left flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">
                            ID: {past.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                            isPastApprove ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            isReject ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {pastDecision}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 truncate">{past.applicant_name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{past.step1_profile.employer_name}</p>
                      </div>

                      <div className="border-t border-slate-100 mt-3 pt-2 text-[10px] text-slate-500 flex justify-between items-center font-medium">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-3 w-3" />
                          {new Date(past.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <strong className="text-slate-700">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(past.step6_recommendation.max_eligible_loan)}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
