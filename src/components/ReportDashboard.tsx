import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  FileCheck2,
  Scale,
  DollarSign,
  TrendingUp,
  TrendingDown,
  User,
  Briefcase,
  AlertCircle,
  CheckCircle,
  XCircle,
  Printer,
  Copy,
  Check,
  Award,
  BookOpen,
  Sliders,
  FileText,
  Building,
  Calendar
} from 'lucide-react';
import { LoanAssessmentReport } from '../types';

interface ReportDashboardProps {
  report: LoanAssessmentReport;
  mode: 'live' | 'simulated';
}

export default function ReportDashboard({ report, mode }: ReportDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dossier' | 'finance' | 'risk' | 'kyc'>('dossier');
  
  // Underwriter manual overrides state
  const [isOverridden, setIsOverridden] = useState(false);
  const [overrideDecision, setOverrideDecision] = useState<typeof report.step6_recommendation.final_decision>(
    report.step6_recommendation.final_decision
  );
  const [underwriterNotes, setUnderwriterNotes] = useState('');
  const [authorizingOfficer, setAuthorizingOfficer] = useState('Senior Underwriter Officer');
  const [isSignedOff, setIsSignedOff] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Extract variables
  const profile = report.step1_profile;
  const analysis = report.step2_analysis;
  const risks = report.step3_risks;
  const validation = report.step4_validation;
  const evaluation = report.step5_evaluation;
  const recommendation = report.step6_recommendation;

  // Custom visual indicator colors
  const getDecisionStyles = (decision: typeof report.step6_recommendation.final_decision) => {
    switch (decision) {
      case 'Approve':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          indicator: 'bg-emerald-500',
          icon: ShieldCheck,
        };
      case 'Approve with Conditions':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          indicator: 'bg-amber-500',
          icon: AlertTriangle,
        };
      case 'Manual Review Required':
        return {
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          indicator: 'bg-indigo-500',
          icon: Scale,
        };
      case 'Reject':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          indicator: 'bg-rose-500',
          icon: AlertOctagon,
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-800',
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          indicator: 'bg-slate-500',
          icon: AlertCircle,
        };
    }
  };

  const getRiskRatingStyles = (rating: string) => {
    switch (rating) {
      case 'Low Risk':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Medium Risk':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'High Risk':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const currentDecision = isOverridden ? overrideDecision : recommendation.final_decision;
  const styles = getDecisionStyles(currentDecision);
  const decisionIcon = styles.icon;

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  // Copy report to clipboard as formatted text
  const handleCopyReport = () => {
    const text = `
=============================================
LOAN RISK ASSESSMENT SCHEMATIC REINFORCEMENT
=============================================
Report Active ID: ${report.id}
Generated on: ${report.timestamp}
Audit Mode: ${mode === 'live' ? 'Live AI Underwriting' : 'Simulated Assessment'}
Applicant Name: ${profile.name}
Employer: ${profile.employer_name} (${profile.employment_details})

---------------------------------------------
CREDIT APPRAISAL EXECUTIVE ASSESSMENT
---------------------------------------------
Global Risk Classification: ${evaluation.risk_rating}
Final Advisory Action: ${currentDecision}
Max Credible Loan Allocation: ${formatCurrency(recommendation.max_eligible_loan)}
Interest Rate Level: ${recommendation.recommended_interest_rate_percentage}% p.a.

Applicant Summary:
${recommendation.applicant_summary}

Financial Stability Analysis:
${recommendation.financial_stability_assessment}

Risk Registry Anomalies:
${recommendation.risk_indicators_summary}

KYC Verification Summary:
- PAN status: ${validation.pan.status}
- Aadhaar status: ${validation.aadhaar.status}
- Employer verified: ${validation.employer_verification.status}

Authorized Officer Signature: ${authorizingOfficer}
Sign-off Status: ${isSignedOff ? 'COMPLETED' : 'PENDING APPROVAL'}
`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const triggerPrint = () => {
    window.print();
  };

  // Calculations for custom SVG diagrams
  const totalOutflows = analysis.monthly_outflow;
  const totalInflows = analysis.monthly_inflow;
  const flowRatio = Math.min((totalOutflows / Math.max(totalInflows, 1)) * 100, 100);
  const savingsRatio = Math.max(100 - flowRatio, 0);

  // DTI calculation for gage meter
  const dti = analysis.debt_to_income_ratio_percentage;
  // Arc logic for progress dial
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(dti, 100) / 100) * circumference;

  return (
    <div id="underwriter-report-dashboard" className="transition-all duration-300">
      {/* Top Dossier Command Header */}
      <div id="report-ribbon" className="bg-slate-900 text-white rounded-2xl p-6 mb-8 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                AUDIT METRICS SYSTEM
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${
                mode === 'live' 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-900' 
                  : 'bg-indigo-950/80 text-indigo-300 border-indigo-900'
              }`}>
                {mode === 'live' ? 'Live AI Underwrite' : 'Audit Mock Sandbox'}
              </span>
              <span className="text-xs text-slate-400">ID: {report.id}</span>
            </div>
            <h2 id="report-main-applicant" className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <User className="h-6 w-6 text-slate-400" />
              {profile.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Building className="h-3.5 w-3.5 text-slate-500" />
              {profile.employer_name} &bull; {profile.employment_details}
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch lg:self-auto justify-end">
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              {isCopied ? <Check className="h-4.5 w-4.5 text-emerald-400" /> : <Copy className="h-4.5 w-4.5 text-slate-400" />}
              {isCopied ? 'Copied' : 'Copy Text'}
            </button>
            <button
              onClick={triggerPrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <Printer className="h-4.5 w-4.5 text-slate-400" />
              Print File
            </button>
          </div>
        </div>
      </div>

      {/* Credit Risk Board Overview */}
      <div id="credit-decision-matrix" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Metric 1: Risk Rating badge */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Risk Score Level</span>
            <Award className="h-5 w-5 text-slate-400" />
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className={`px-4 py-1.5 rounded-xl font-extrabold text-lg border ${getRiskRatingStyles(evaluation.risk_rating)}`}>
              {evaluation.risk_rating}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-normal">
            Calculated across default risk algorithms, liabilities ledger, and employer validation vectors.
          </p>
        </div>

        {/* Metric 2: Credit Decision Band */}
        <div className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${styles.bg}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-wider uppercase opacity-80">Credit Decision Decision</span>
            <styles.icon className="h-5 w-5 opacity-80" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight">{currentDecision}</span>
            {isOverridden && (
              <span className="block text-[10px] mt-1 font-semibold text-indigo-700">
                (MANUALLY OVERRIDDEN BY EXECUTIVE)
              </span>
            )}
          </div>
          <p className="text-xs opacity-75 mt-4 leading-normal">
            Adjusted by senior credit audit parameters relative to financial coverage formulas.
          </p>
        </div>

        {/* Metric 3: Credit limits allotment */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Risk-Adjusted Limits</span>
            <DollarSign className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{formatCurrency(recommendation.max_eligible_loan)}</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Max Allowed</span>
            </div>
            <div className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1">
              <span>Pricing Rate:</span>
              <strong className="text-slate-800">{recommendation.recommended_interest_rate_percentage}% p.a.</strong>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-normal">
            Adjusted interest risk buffer according to debt surplus ratios.
          </p>
        </div>
      </div>

      {/* Tabs Layout Bar */}
      <div id="dashboard-tab-bar" className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('dossier')}
          className={`px-4 py-2.5 text-xs font-bold tracking-wide rounded-t-lg transition shrink-0 cursor-pointer ${
            activeTab === 'dossier'
              ? 'border-b-2 border-slate-800 text-slate-900 bg-slate-50'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
          }`}
        >
          STEP 5 & 6 &bull; Executive Dossier
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={`px-4 py-2.5 text-xs font-bold tracking-wide rounded-t-lg transition shrink-0 cursor-pointer ${
            activeTab === 'finance'
              ? 'border-b-2 border-slate-800 text-slate-900 bg-slate-50'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
          }`}
        >
          STEP 1 & 2 &bull; Income & Outflows Audit
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`px-4 py-2.5 text-xs font-bold tracking-wide rounded-t-lg transition shrink-0 cursor-pointer ${
            activeTab === 'risk'
              ? 'border-b-2 border-slate-800 text-slate-900 bg-slate-50'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
          }`}
        >
          STEP 3 &bull; Fraud & Risk Registry
        </button>
        <button
          onClick={() => setActiveTab('kyc')}
          className={`px-4 py-2.5 text-xs font-bold tracking-wide rounded-t-lg transition shrink-0 cursor-pointer ${
            activeTab === 'kyc'
              ? 'border-b-2 border-slate-800 text-slate-900 bg-slate-50'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
          }`}
        >
          STEP 4 &bull; KYC Document Audit
        </button>
      </div>

      {/* Main Tab Panel Frame */}
      <div id="active-tab-panel" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[400px]">
        {/* Tab 1: Executive Dossier Panel */}
        {activeTab === 'dossier' && (
          <div id="executive-dossier-tab" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Appraisal Summary Info card */}
              <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  Applicant Synthesis Appraisal
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                  {recommendation.applicant_summary}
                </p>
              </div>

              {/* Financial Integrity assessment */}
              <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Financial Stability Audit
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                  {recommendation.financial_stability_assessment}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Threat register section */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase mb-2">Risk Observations</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{recommendation.risk_indicators_summary}</p>
              </div>

              {/* Fraud and Authenticity observation */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase mb-2">Fraud Verification Observations</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{recommendation.fraud_risk_observations}</p>
              </div>

              {/* Missing compliance adjustments */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase mb-2">Missing/Unclear Documents Remediation</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{recommendation.missing_documents_remedy}</p>
              </div>
            </div>

            {/* Recommendation parameters */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-left">
                <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">Underwriting Advisory</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{recommendation.recommended_action}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">{recommendation.loan_eligibility_assessment}</p>
              </div>

              <div className="flex border-l border-slate-800 pl-4 py-2 gap-4 shrink-0 text-center">
                <div className="text-center">
                  <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold">Allocation Max</span>
                  <span className="text-base font-black text-white">{formatCurrency(recommendation.max_eligible_loan)}</span>
                </div>
                <div className="text-center">
                  <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold">pricing APR</span>
                  <span className="text-base font-black text-white">{recommendation.recommended_interest_rate_percentage}%</span>
                </div>
              </div>
            </div>

            {/* Senior Officer Manual Override panel */}
            <div className="border border-slate-200 rounded-xl p-5 bg-indigo-50/40 border-indigo-100 mt-6 md:p-6">
              <h3 className="text-xs font-bold text-indigo-900 tracking-wider uppercase mb-3 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-700" />
                Senior Banking Officer Manual Adjustments & Decisive overrides
              </h3>
              <p className="text-xs text-indigo-700 leading-normal mb-4">
                As a credentialed credit assessment supervisor, you hold structural authority to manually override algorithmic assessments or supplement underwriting sign-off remarks.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Decisive Operational Action Override</label>
                  <div className="flex flex-wrap gap-2">
                    {(['Approve', 'Approve with Conditions', 'Manual Review Required', 'Reject'] as const).map((dec) => {
                      const isOptionSelected = overrideDecision === dec && isOverridden;
                      return (
                        <button
                          key={dec}
                          type="button"
                          onClick={() => {
                            setIsOverridden(true);
                            setOverrideDecision(dec);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                            isOptionSelected
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {dec}
                        </button>
                      );
                    })}
                  </div>
                  {isOverridden && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOverridden(false);
                        setOverrideDecision(recommendation.final_decision);
                      }}
                      className="text-[10px] text-indigo-700 underline font-semibold mt-1 hover:text-indigo-900"
                    >
                      Reset to AI Underwrite Advisory
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Authorizing Officer Name (Sign-off Signature)</label>
                  <input
                    type="text"
                    value={authorizingOfficer}
                    onChange={(e) => setAuthorizingOfficer(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <label className="block text-xs font-bold text-slate-700">Audit Docket Underwriter Comments</label>
                <textarea
                  value={underwriterNotes}
                  onChange={(e) => setUnderwriterNotes(e.target.value)}
                  placeholder="Record formal assessment reasoning, risk mitigation overrides, or specific covenants regarding terms of loan disbursements..."
                  className="w-full h-20 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-slate-700 outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSignedOff(!isSignedOff)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer ${
                    isSignedOff
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-indigo-900 text-white hover:bg-indigo-800'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {isSignedOff ? 'Dossier Signoff Signed' : 'Authorize Official Docket Sign-off'}
                </button>
              </div>

              {isSignedOff && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2.5 text-emerald-800 animate-fadeIn">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-[11px] font-bold">
                    Audit docket has been verified and registered by authorizing official &quot;{authorizingOfficer}&quot;. Standard audit compliance checks satisfied.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Financial Balance Sheet Tab */}
        {activeTab === 'finance' && (
          <div id="financial-balance-sheet-tab" className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-indigo-50 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Applicant Income Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Details Listing */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Core Identity Extractions</h4>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Applicant legal Name</span>
                    <span className="font-bold text-slate-800">{profile.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Employer Name Identification</span>
                    <span className="font-bold text-slate-800">{profile.employer_name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Occupation & Employment type</span>
                    <span className="font-bold text-slate-800">{profile.employment_details}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Stated Gross Monthly Salary</span>
                    <span className="font-bold text-slate-800">{formatCurrency(profile.salary)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Linked primary account ledger</span>
                    <span className="font-bold text-slate-800">{profile.account_details}</span>
                  </div>
                </div>
              </div>

              {/* DTI Gauge Custom SVG */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 flex flex-col items-center justify-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 text-center w-full">
                  Underwriter DTI Ledger Ratio
                </h4>
                <div className="relative flex items-center justify-center h-32 w-32">
                  <svg className="transform -rotate-90 h-full w-full">
                    <circle
                      cx="64"
                      cy="64"
                      r="50"
                      className="stroke-slate-200 fill-none"
                      strokeWidth="10"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="50"
                      className={`fill-none stroke-current ${
                        dti < 36 ? 'text-emerald-500' : dti <= 45 ? 'text-amber-500' : 'text-rose-500'
                      }`}
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="block text-2xl font-black text-slate-800">{dti}%</span>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Total DTI</span>
                  </div>
                </div>
                <div className="text-center mt-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    dti < 36 ? 'bg-emerald-100 text-emerald-800' : dti <= 45 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {dti < 36 ? 'Prime tier' : dti <= 45 ? 'Mid Tier Warning' : 'Critical Credit Burden'}
                  </span>
                </div>
              </div>
            </div>

            {/* Income balance sheet bars */}
            <div className="bg-slate-50/20 border border-slate-100 rounded-xl p-5 mt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Statement Ledger Flow (Step 2)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <div className="text-xs flex justify-between">
                    <span className="text-slate-500">Salary Deposit Consistency:</span>
                    <strong className="text-slate-800">{analysis.salary_consistency}</strong>
                  </div>
                  <div className="text-xs flex justify-between">
                    <span className="text-slate-500">Identified Spending Profile:</span>
                    <strong className="text-slate-800">{analysis.spending_behavior}</strong>
                  </div>
                  <div className="text-xs flex justify-between">
                    <span className="text-slate-500">Savings Rate Behavior:</span>
                    <strong className="text-slate-800">{analysis.savings_pattern}</strong>
                  </div>
                </div>

                {/* custom dynamic progress visual metrics */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>Monthly Inflow ({formatCurrency(analysis.monthly_inflow)}):</span>
                      <span className="text-emerald-600">100% Inflow</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>Monthly Outflow ({formatCurrency(analysis.monthly_outflow)}):</span>
                      <span className="text-slate-700 font-bold">{flowRatio.toFixed(1)}% Usage</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${flowRatio > 80 ? 'bg-rose-500' : flowRatio > 50 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                        style={{ width: `${flowRatio}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1 Profile: liabilities table */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">
                Extracted Active Obligations & Credit Liabilities
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full border-collapse text-left text-xs bg-white">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase">
                      <th className="p-3">Obligation Source</th>
                      <th className="p-3 text-right">Estimated EMI payment</th>
                      <th className="p-3 text-right">Outstanding balances outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {profile.liabilities.map((liab, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-800 font-bold">{liab.source}</td>
                        <td className="p-3 text-right text-slate-700 font-bold">{formatCurrency(liab.monthly_payment)} / mo</td>
                        <td className="p-3 text-right text-slate-600 font-mono">
                          {liab.total_amount > 0 ? formatCurrency(liab.total_amount) : 'Corporate Lease / Variable'}
                        </td>
                      </tr>
                    ))}
                    {profile.liabilities.length === 0 && (
                      <tr>
                        <td className="p-3 text-center text-slate-400" colSpan={3}>
                          No existing liabilities identified from applicant credit declarations.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50/80 font-black border-t border-slate-200 text-slate-800">
                      <td className="p-3 text-right">Total Monthly Credit Burden:</td>
                      <td className="p-3 text-right text-emerald-700">
                        {formatCurrency(profile.liabilities.reduce((sum, item) => sum + item.monthly_payment, 0))}
                      </td>
                      <td className="p-3 text-right text-slate-700 text-xs">
                        {formatCurrency(profile.liabilities.reduce((sum, item) => sum + item.total_amount, 0))} Total
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Risk & Fraud Registry */}
        {activeTab === 'risk' && (
          <div id="risk-registry-tab" className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-indigo-50 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              Comprehensive Red Flags & Fraud Threat Register
            </h3>

            {/* Suspicious statements register alerts */}
            {analysis.suspicious_transactions && analysis.suspicious_transactions.length > 0 && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-rose-800 flex items-start gap-3">
                <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase text-rose-900 mb-1.5">
                    Critical transaction anomalies recorded in statement history
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                    {analysis.suspicious_transactions.map((tr, idx) => (
                      <li key={idx} className="font-medium leading-normal">{tr}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Risk profiling checks */}
              <div className="border border-slate-100 bg-slate-50/20 rounded-xl p-5">
                <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 tracking-wide">
                  1. Financial risks & Credit Stress
                </h4>
                {risks.financial_risks.length > 0 ? (
                  <ul className="space-y-2">
                    {risks.financial_risks.map((item, id) => (
                      <li key={id} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-500 mt-1 shrink-0">&bull;</span>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-emerald-700 font-bold">No significant financial credit stress indicators.</span>
                )}
              </div>

              {/* Income Stability threats */}
              <div className="border border-slate-100 bg-slate-50/20 rounded-xl p-5">
                <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 tracking-wide">
                  2. Income Stability & Earnings Risk
                </h4>
                {risks.income_stability_risks.length > 0 ? (
                  <ul className="space-y-2">
                    {risks.income_stability_risks.map((item, id) => (
                      <li key={id} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed font-medium">
                        <span className="text-amber-500 mt-1 shrink-0">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-emerald-700 font-bold">Income displays verified monthly consistency.</span>
                )}
              </div>

              {/* Excessive Liability warnings */}
              <div className="border border-slate-100 bg-slate-50/20 rounded-xl p-5">
                <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 tracking-wide">
                  3. Outstanding Liabilities exposure
                </h4>
                {risks.excessive_liability_risks.length > 0 ? (
                  <ul className="space-y-2">
                    {risks.excessive_liability_risks.map((item, id) => (
                      <li key={id} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed font-medium">
                        <span className="text-rose-500 mt-1 shrink-0">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-emerald-700 font-bold">Outstanding leverage margins well within safety boundaries.</span>
                )}
              </div>

              {/* Cash out drawer anomalies */}
              <div className="border border-slate-100 bg-slate-50/20 rounded-xl p-5">
                <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 tracking-wide">
                  4. ATM / Sudden Cash Depletions
                </h4>
                {risks.unusual_withdrawals.length > 0 ? (
                  <ul className="space-y-2">
                    {risks.unusual_withdrawals.map((item, id) => (
                      <li key={id} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed font-medium">
                        <span className="text-rose-500 mt-1 shrink-0">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-emerald-700 font-bold">ATM activity consistent with standard retail cash metrics.</span>
                )}
              </div>
            </div>

            {/* Compliance details */}
            <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-5 flex items-start gap-3 mt-4">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  Underwriter Compliance Note: Incomplete, Blur or Missing indicators
                </h4>
                <div className="space-y-2 mt-2">
                  <p className="text-xs text-slate-600 leading-normal font-medium">
                    The audit ledger cross-checks metadata for document manipulation. Check results:
                  </p>
                  <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1 font-medium">
                    {risks.fraud_risk_indicators.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                    {risks.missing_or_inconsistent_info.map((item, idx) => (
                      <li key={idx} className="text-rose-700 font-bold">{item}</li>
                    ))}
                    {risks.fraud_risk_indicators.length === 0 && risks.missing_or_inconsistent_info.length === 0 && (
                      <li className="text-emerald-700 font-bold">Zero documentation anomalies or metadata manipulation flags detected.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: KYC & Document Verification */}
        {activeTab === 'kyc' && (
          <div id="kyc-verification-tab" className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-indigo-50 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-emerald-600" />
              KYC Document Audit & Verification Matrix
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="grid grid-cols-1 divide-y divide-slate-100">
                {/* Aadhaar Row */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4 text-xs hover:bg-slate-50/50 transition">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-slate-700 rounded-full"></span>
                    Biometric Aadhaar Identity
                  </div>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      validation.aadhaar.status === 'Verified' ? 'bg-emerald-100 border-emerald-200 text-emerald-800' :
                      validation.aadhaar.status === 'Unclear' ? 'bg-amber-100 border-amber-200 text-amber-800' :
                      'bg-rose-100 border-rose-200 text-rose-800'
                    }`}>
                      {validation.aadhaar.status}
                    </span>
                  </div>
                  <div className="md:col-span-2 text-slate-600 leading-normal font-medium">
                    {validation.aadhaar.details}
                  </div>
                </div>

                {/* PAN Row */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4 text-xs hover:bg-slate-50/50 transition">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-slate-700 rounded-full"></span>
                    PAN Taxpayer identity (NSDL)
                  </div>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      validation.pan.status === 'Verified' ? 'bg-emerald-100 border-emerald-200 text-emerald-800' :
                      validation.pan.status === 'Unclear' ? 'bg-amber-100 border-amber-200 text-amber-800' :
                      'bg-rose-100 border-rose-200 text-rose-800'
                    }`}>
                      {validation.pan.status}
                    </span>
                  </div>
                  <div className="md:col-span-2 text-slate-600 leading-normal font-medium">
                    {validation.pan.details}
                  </div>
                </div>

                {/* Address Row */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4 text-xs hover:bg-slate-50/50 transition">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-slate-700 rounded-full"></span>
                    Physical Address Proof
                  </div>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      validation.address_proof.status === 'Verified' ? 'bg-emerald-100 border-emerald-200 text-emerald-800' :
                      validation.address_proof.status === 'Unclear' ? 'bg-amber-100 border-amber-200 text-amber-800' :
                      'bg-rose-100 border-rose-200 text-rose-800'
                    }`}>
                      {validation.address_proof.status}
                    </span>
                  </div>
                  <div className="md:col-span-2 text-slate-600 leading-normal font-medium">
                    {validation.address_proof.details}
                  </div>
                </div>

                {/* Salary Row */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4 text-xs hover:bg-slate-50/50 transition">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-slate-700 rounded-full"></span>
                    Gross Salary Proof (TDS/Form-16)
                  </div>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      validation.salary_proof.status === 'Verified' ? 'bg-emerald-100 border-emerald-200 text-emerald-800' :
                      validation.salary_proof.status === 'Unclear' ? 'bg-amber-100 border-amber-200 text-amber-800' :
                      'bg-rose-100 border-rose-200 text-rose-800'
                    }`}>
                      {validation.salary_proof.status}
                    </span>
                  </div>
                  <div className="md:col-span-2 text-slate-600 leading-normal font-medium">
                    {validation.salary_proof.details}
                  </div>
                </div>

                {/* Bank status Row */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4 text-xs hover:bg-slate-50/50 transition">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-slate-700 rounded-full"></span>
                    Bank account Verification
                  </div>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      validation.bank_verification.status === 'Verified' ? 'bg-emerald-100 border-emerald-200 text-emerald-800' :
                      validation.bank_verification.status === 'Unclear' ? 'bg-amber-100 border-amber-200 text-amber-800' :
                      'bg-rose-100 border-rose-200 text-rose-800'
                    }`}>
                      {validation.bank_verification.status}
                    </span>
                  </div>
                  <div className="md:col-span-2 text-slate-600 leading-normal font-medium">
                    {validation.bank_verification.details}
                  </div>
                </div>

                {/* Employer verified Row */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4 text-xs hover:bg-slate-50/50 transition">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-slate-700 rounded-full"></span>
                    Employer domain Verification
                  </div>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      validation.employer_verification.status === 'Verified' ? 'bg-emerald-100 border-emerald-200 text-emerald-800' :
                      validation.employer_verification.status === 'Unclear' ? 'bg-amber-100 border-amber-200 text-amber-800' :
                      'bg-rose-100 border-rose-200 text-rose-800'
                    }`}>
                      {validation.employer_verification.status}
                    </span>
                  </div>
                  <div className="md:col-span-2 text-slate-600 leading-normal font-medium">
                    {validation.employer_verification.details}
                  </div>
                </div>

                {/* Loan declaration */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4 text-xs hover:bg-slate-50/50 transition">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-slate-700 rounded-full"></span>
                    Signed Loan declaration
                  </div>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      validation.loan_declaration.status === 'Verified' ? 'bg-emerald-100 border-emerald-200 text-emerald-800' :
                      validation.loan_declaration.status === 'Unclear' ? 'bg-amber-100 border-amber-200 text-amber-800' :
                      'bg-rose-100 border-rose-200 text-rose-800'
                    }`}>
                      {validation.loan_declaration.status}
                    </span>
                  </div>
                  <div className="md:col-span-2 text-slate-600 leading-normal font-medium">
                    {validation.loan_declaration.details}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
