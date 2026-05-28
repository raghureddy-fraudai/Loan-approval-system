export interface Liability {
  source: string;
  monthly_payment: number;
  total_amount: number;
}

export interface VerificationItem {
  status: 'Verified' | 'Unclear' | 'Missing';
  details: string;
}

export interface Step1Profile {
  name: string;
  employment_details: string;
  salary: number;
  employer_name: string;
  account_details: string;
  monthly_income: number;
  liabilities: Liability[];
  loan_amount_requested: number;
  repayment_tenure_months: number;
}

export interface Step2Analysis {
  salary_consistency: string;
  monthly_inflow: number;
  monthly_outflow: number;
  emi_burden_percentage: number;
  debt_to_income_ratio_percentage: number;
  spending_behavior: string;
  savings_pattern: string;
  suspicious_transactions: string[];
}

export interface Step3Risks {
  financial_risks: string[];
  income_stability_risks: string[];
  excessive_liability_risks: string[];
  unusual_withdrawals: string[];
  fraud_risk_indicators: string[];
  missing_or_inconsistent_info: string[];
}

export interface Step4Validation {
  pan: VerificationItem;
  aadhaar: VerificationItem;
  address_proof: VerificationItem;
  salary_proof: VerificationItem;
  bank_verification: VerificationItem;
  employer_verification: VerificationItem;
  loan_declaration: VerificationItem;
}

export interface Step5Evaluation {
  risk_rating: 'Low Risk' | 'Medium Risk' | 'High Risk';
  reasoning: string[];
}

export interface Step6Recommendation {
  applicant_summary: string;
  financial_stability_assessment: string;
  risk_indicators_summary: string;
  missing_documents_remedy: string;
  fraud_risk_observations: string;
  loan_eligibility_assessment: string;
  max_eligible_loan: number;
  recommended_interest_rate_percentage: number;
  recommended_action: string;
  final_decision: 'Approve' | 'Approve with Conditions' | 'Manual Review Required' | 'Reject';
}

export interface LoanAssessmentReport {
  id: string;
  timestamp: string;
  applicant_name: string;
  step1_profile: Step1Profile;
  step2_analysis: Step2Analysis;
  step3_risks: Step3Risks;
  step4_validation: Step4Validation;
  step5_evaluation: Step5Evaluation;
  step6_recommendation: Step6Recommendation;
}

export interface UploadedFile {
  name: string;
  type: string; // e.g. 'application/pdf', 'image/png'
  content: string; // base64 representation or custom text
}
