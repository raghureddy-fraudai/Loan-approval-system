import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Setup JSON parsing limit for handling uploaded documents (which can be large PDF/Image files)
app.use(express.json({ limit: '20mb' }));

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured. Please supply an API key in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Define the response schema explicitly to enforce structured JSON output matching Step 1 to Step 6
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    timestamp: { type: Type.STRING },
    applicant_name: { type: Type.STRING },
    step1_profile: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        employment_details: { type: Type.STRING },
        salary: { type: Type.NUMBER },
        employer_name: { type: Type.STRING },
        account_details: { type: Type.STRING },
        monthly_income: { type: Type.NUMBER },
        liabilities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              source: { type: Type.STRING },
              monthly_payment: { type: Type.NUMBER },
              total_amount: { type: Type.NUMBER }
            },
            required: ['source', 'monthly_payment', 'total_amount']
          }
        },
        loan_amount_requested: { type: Type.NUMBER },
        repayment_tenure_months: { type: Type.NUMBER }
      },
      required: [
        'name',
        'employment_details',
        'salary',
        'employer_name',
        'account_details',
        'monthly_income',
        'liabilities',
        'loan_amount_requested',
        'repayment_tenure_months'
      ]
    },
    step2_analysis: {
      type: Type.OBJECT,
      properties: {
        salary_consistency: { type: Type.STRING },
        monthly_inflow: { type: Type.NUMBER },
        monthly_outflow: { type: Type.NUMBER },
        emi_burden_percentage: { type: Type.NUMBER },
        debt_to_income_ratio_percentage: { type: Type.NUMBER },
        spending_behavior: { type: Type.STRING },
        savings_pattern: { type: Type.STRING },
        suspicious_transactions: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: [
        'salary_consistency',
        'monthly_inflow',
        'monthly_outflow',
        'emi_burden_percentage',
        'debt_to_income_ratio_percentage',
        'spending_behavior',
        'savings_pattern',
        'suspicious_transactions'
      ]
    },
    step3_risks: {
      type: Type.OBJECT,
      properties: {
        financial_risks: { type: Type.ARRAY, items: { type: Type.STRING } },
        income_stability_risks: { type: Type.ARRAY, items: { type: Type.STRING } },
        excessive_liability_risks: { type: Type.ARRAY, items: { type: Type.STRING } },
        unusual_withdrawals: { type: Type.ARRAY, items: { type: Type.STRING } },
        fraud_risk_indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
        missing_or_inconsistent_info: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: [
        'financial_risks',
        'income_stability_risks',
        'excessive_liability_risks',
        'unusual_withdrawals',
        'fraud_risk_indicators',
        'missing_or_inconsistent_info'
      ]
    },
    step4_validation: {
      type: Type.OBJECT,
      properties: {
        pan: {
          type: Type.OBJECT,
          properties: { status: { type: Type.STRING }, details: { type: Type.STRING } },
          required: ['status', 'details']
        },
        aadhaar: {
          type: Type.OBJECT,
          properties: { status: { type: Type.STRING }, details: { type: Type.STRING } },
          required: ['status', 'details']
        },
        address_proof: {
          type: Type.OBJECT,
          properties: { status: { type: Type.STRING }, details: { type: Type.STRING } },
          required: ['status', 'details']
        },
        salary_proof: {
          type: Type.OBJECT,
          properties: { status: { type: Type.STRING }, details: { type: Type.STRING } },
          required: ['status', 'details']
        },
        bank_verification: {
          type: Type.OBJECT,
          properties: { status: { type: Type.STRING }, details: { type: Type.STRING } },
          required: ['status', 'details']
        },
        employer_verification: {
          type: Type.OBJECT,
          properties: { status: { type: Type.STRING }, details: { type: Type.STRING } },
          required: ['status', 'details']
        },
        loan_declaration: {
          type: Type.OBJECT,
          properties: { status: { type: Type.STRING }, details: { type: Type.STRING } },
          required: ['status', 'details']
        }
      },
      required: [
        'pan',
        'aadhaar',
        'address_proof',
        'salary_proof',
        'bank_verification',
        'employer_verification',
        'loan_declaration'
      ]
    },
    step5_evaluation: {
      type: Type.OBJECT,
      properties: {
        risk_rating: { type: Type.STRING },
        reasoning: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['risk_rating', 'reasoning']
    },
    step6_recommendation: {
      type: Type.OBJECT,
      properties: {
        applicant_summary: { type: Type.STRING },
        financial_stability_assessment: { type: Type.STRING },
        risk_indicators_summary: { type: Type.STRING },
        missing_documents_remedy: { type: Type.STRING },
        fraud_risk_observations: { type: Type.STRING },
        loan_eligibility_assessment: { type: Type.STRING },
        max_eligible_loan: { type: Type.NUMBER },
        recommended_interest_rate_percentage: { type: Type.NUMBER },
        recommended_action: { type: Type.STRING },
        final_decision: { type: Type.STRING }
      },
      required: [
        'applicant_summary',
        'financial_stability_assessment',
        'risk_indicators_summary',
        'missing_documents_remedy',
        'fraud_risk_observations',
        'loan_eligibility_assessment',
        'max_eligible_loan',
        'recommended_interest_rate_percentage',
        'recommended_action',
        'final_decision'
      ]
    }
  },
  required: [
    'id',
    'timestamp',
    'applicant_name',
    'step1_profile',
    'step2_analysis',
    'step3_risks',
    'step4_validation',
    'step5_evaluation',
    'step6_recommendation'
  ]
};

// API Route to analyze files using Gemini (with full fallback if API key is not yet set)
app.post('/api/analyze-loan-documents', async (req, res) => {
  try {
    const { profileName, files, customData } = req.body;

    // Check if Gemini API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY missing - returning elegant high-fidelity mock audit reports for preview.');
      // Construct realistic simulated responses based on the chosen profile for graceful previewing.
      const simulatedResult = generateSimulatedReport(profileName || 'low-risk', customData);
      return res.json({ success: true, report: simulatedResult, mode: 'simulated' });
    }

    const ai = getGeminiClient();

    // Prepare content parts for Gemini
    const contents: any[] = [];

    // System instruction explaining the exact sequential multi-step task
    const systemInstruction = `You are a Senior Banking Loan Risk Assessment Officer working in a leading private bank. Your goal is to generate a structured, highly quantitative, enterprise-level loan assessment report.

Analyze the documents provided carefully (which can include loan application forms, salary slips, and bank statements). If no actual documents are uploaded, analyze the rich textual fields provided.

You must perform the following steps sequentially inside your evaluation logic:
STEP 1 — Applicant Profile Extraction: Extract applicant name, employment details, salary, employer name, account details, monthly income, liabilities, loan amount requested, and repayment tenure.
STEP 2 — Financial Analysis: Analyze salary consistency, monthly inflow/outflow balance, EMI burden ratio, spending behavior, savings patterns, suspicious transactions (e.g. repeated cash withdrawals, unrecognized outgoings), and debt-to-income (DTI) ratio.
STEP 3 — Risk Identification: Identify specific financial risks, unstable earning patterns, excessive liabilities or overdrafts, unrequested cash-out activities, fraud risk indicators, or inconsistent details in document values.
STEP 4 — Missing Document Validation: Check status ("Verified", "Unclear", or "Missing") and details for PAN, Aadhaar, address proof, salary proof, bank verification, employer verification, and loan declaration.
STEP 5 — Creditworthiness Evaluation: Classify the applicant strictly into either "Low Risk", "Medium Risk", or "High Risk" with concrete analytical rationale.
STEP 6 — Final Structured Recommendation: Create a clear executive summary, financial stability assessment, risk indicator summary, missing document status, fraud observations, loan eligibility, maximum allowed loan amount, interest rate adjustment, recommended action, and a final bank decision (either "Approve", "Approve with Conditions", "Manual Review Required", or "Reject").

You MUST return the output strictly as a JSON object matching the requested schema. Ensure all numbers are calculated accurately and reasonably.`;

    let userPrompt = `Generate a comprehensive loan assessment audit.
Applicant / Profile Reference: ${profileName || 'Custom Evaluation'}`;

    if (customData) {
      userPrompt += `\n\nProvided Form Specifications:\n${JSON.stringify(customData, null, 2)}`;
    }

    contents.push({ text: userPrompt });

    // Attach any user-uploaded files as base64 parts directly (Gemini 3.5 Flash supports PDFs/Images beautifully)
    if (files && Array.isArray(files)) {
      for (const file of files) {
        if (file.content && file.type) {
          // base64 format contains data prefix, extract it
          let base64Data = file.content;
          if (base64Data.includes(';base64,')) {
            base64Data = base64Data.split(';base64,')[1];
          }
          contents.push({
            inlineData: {
              data: base64Data,
              mimeType: file.type
            }
          });
        }
      }
    }

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema as any,
        temperature: 0.2, // Low temperature for high-precision analytical reports
      }
    });

    const parsedText = response.text || '{}';
    try {
      const parsedReport = JSON.parse(parsedText);
      return res.json({ success: true, report: parsedReport, mode: 'live' });
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON. Response was:', parsedText);
      throw new Error('Gemini response did not conform to JSON output specifications. Retrying or loading high-fidelity fallback.');
    }

  } catch (error: any) {
    console.error('Core assessment handler error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Verification Error during document extraction. Please check api configuration.'
    });
  }
});

// Helper to provide realistic senior bank officer mock templates (Preloaded Profiles)
function generateSimulatedReport(profileKey: string, customData?: any) {
  const timestamp = new Date().toISOString();
  
  if (profileKey === 'low-risk') {
    return {
      id: 'LRA-2026-9042A',
      timestamp,
      applicant_name: 'Johnathan Harris',
      step1_profile: {
        name: 'Johnathan Harris',
        employment_details: 'Lead Principal Engineer (FTE)',
        salary: 14500,
        employer_name: 'AlphaTech Solutions Global',
        account_details: 'Chase Checking Account ****9014',
        monthly_income: 14500,
        liabilities: [
          { source: 'Car Loan (Toyota Financial)', monthly_payment: 380, total_amount: 14000 },
          { source: 'Credit Card Balance (Chase Sapphire)', monthly_payment: 150, total_amount: 1200 }
        ],
        loan_amount_requested: 75000,
        repayment_tenure_months: 36
      },
      step2_analysis: {
        salary_consistency: 'Excellent. Automated direct deposits hit on the 26th of every consecutive month without exception.',
        monthly_inflow: 14500,
        monthly_outflow: 5330,
        emi_burden_percentage: 3.6,
        debt_to_income_ratio_percentage: 18.5,
        spending_behavior: 'Highly conservative. Heavy expenditures are primarily recurring rent ($2,800) and utility bills. Zero micro-payment leaks.',
        savings_pattern: 'Extremely strong. Consistently transfers an average of 40% ($5,800) of net monthly salary directly to liquid index funds.',
        suspicious_transactions: []
      },
      step3_risks: {
        financial_risks: ['Virtually non-existent financial exposure. Asset-to-liability coverage exceeds 8x.'],
        income_stability_risks: ['Extremely low risk; employer exhibits steady quarterly growth and 1,200+ employees.'],
        excessive_liability_risks: ['Existing EMI coverage is less than 5% of monthly net income, leaving major disposal headroom.'],
        unusual_withdrawals: [],
        fraud_risk_indicators: [],
        missing_or_inconsistent_info: []
      },
      step4_validation: {
        pan: { status: 'Verified', details: 'Matches NSDL database active PAN record check.' },
        aadhaar: { status: 'Verified', details: 'UIDAI biometric OTP match passed.' },
        address_proof: { status: 'Verified', details: 'Lease agreement & electrical bills match.' },
        salary_proof: { status: 'Verified', details: 'Form-16, IT returns & official salary slips verified.' },
        bank_verification: { status: 'Verified', details: 'Plaid connection verified real-time account ledger.' },
        employer_verification: { status: 'Verified', details: 'Active corporate domain registration & email check completed.' },
        loan_declaration: { status: 'Verified', details: 'Legally signed declaration in application matches.' }
      },
      step5_evaluation: {
        risk_rating: 'Low Risk',
        reasoning: [
          'Monthly income is highly robust and displays absolute temporal consistency over 12 rolling months.',
          'Outstanding total liabilities are minor and present low leverage burden.',
          'Pristine transaction history showing no cash leakages, zero return charges, and strong savings build.',
          'All core KYC, employment details, and active address criteria are thoroughly cross-verified.'
        ]
      },
      step6_recommendation: {
        applicant_summary: 'Applicant Harris is a highly distinguished technical leader at an elite software enterprise, possessing stable cash reserves and an excellent credit history.',
        financial_stability_assessment: 'Finances are in exemplary standing. Debt ratios are comfortably below prime tier thresholds (18.5% compared to the 40% maximum allowable risk boundary).',
        risk_indicators_summary: 'No adverse credit findings, red flags, overdraft charges, or unstable patterns identified.',
        missing_documents_remedy: 'All compliance documentation is completely uploaded and validated.',
        fraud_risk_observations: 'No anomalies found. Document metadata, employer credentials, and bank statements demonstrate high integrity.',
        loan_eligibility_assessment: 'Exhibits maximum capacity for prime loan pricing. Eligible for full requested funding of $75,000.',
        max_eligible_loan: 120000,
        recommended_interest_rate_percentage: 6.25,
        recommended_action: 'Fast-track approval process. Pass directly through underwriting to credit disbursement within 24 hours.',
        final_decision: 'Approve'
      }
    };
  } else if (profileKey === 'medium-risk') {
    return {
      id: 'LRA-2026-4410M',
      timestamp,
      applicant_name: 'Priya Sharma',
      step1_profile: {
        name: 'Priya Sharma',
        employment_details: 'Creative Director & Independent Freelancer',
        salary: 8200,
        employer_name: 'Studio Bloom Design (Self-Employed LLC)',
        account_details: 'Wells Fargo Account ****3088',
        monthly_income: 8200,
        liabilities: [
          { source: 'Personal Loan (HDFC)', monthly_payment: 620, total_amount: 18000 },
          { source: 'Credit Cards (Amex & Citi)', monthly_payment: 850, total_amount: 11000 },
          { source: 'Co-working Office Rent', monthly_payment: 450, total_amount: 0 }
        ],
        loan_amount_requested: 40000,
        repayment_tenure_months: 24
      },
      step2_analysis: {
        salary_consistency: 'Variable. Income arrives from 3 discrete client invoices ranging between the 3rd and 18th of each month, fluctuating by +/- 22%.',
        monthly_inflow: 8200,
        monthly_outflow: 6800,
        emi_burden_percentage: 17.9,
        debt_to_income_ratio_percentage: 42.6,
        spending_behavior: 'High retail spending. Extensive card outgoings recorded for design subscriptions, creative software platforms, travel, and lifestyle merchant charges.',
        savings_pattern: 'Moderate. Liquid savings build slightly unevenly, depending heavily on seasonal retainer payments. Savings rate averages 15% ($1,230).',
        suspicious_transactions: ['Frequent PayPal transfers ($400-$700) labelled as miscellaneous expenses. Needs invoicing backup.']
      },
      step3_risks: {
        financial_risks: ['High recurring credit card utilization rate (>70% limit capacity used on Amex card).'],
        income_stability_risks: ['Freelancer earnings lack typical corporate employment backup; exposed to sudden contract cancellations.'],
        excessive_liability_risks: ['DTI ratio exceeds standard preferred 40% threshold due to aggregate active retail balances.'],
        unusual_withdrawals: ['PayPal drawdowns without clear recipient tracking.'],
        fraud_risk_indicators: [],
        missing_or_inconsistent_info: ['Minor variations in tax returns compared to monthly self-employment invoice statements.']
      },
      step4_validation: {
        pan: { status: 'Verified', details: 'Matches individual PAN record.' },
        aadhaar: { status: 'Verified', details: 'OTP authentication verified successfully.' },
        address_proof: { status: 'Verified', details: 'Utility bill matches current residence.' },
        salary_proof: { status: 'Unclear', details: 'Freelance receipts provide weaker earnings proof than conventional pay stubs.' },
        bank_verification: { status: 'Verified', details: '6 months bank ledger statements supplied and validated.' },
        employer_verification: { status: 'Unclear', details: 'Self-employed firm registration active but has small online profile.' },
        loan_declaration: { status: 'Verified', details: 'Duly completed and signed.' }
      },
      step5_evaluation: {
        risk_rating: 'Medium Risk',
        reasoning: [
          'Income is highly substantial but shows dynamic variance inherent to contract/freelance employment.',
          'Current debt-to-income margin is tight (42.6%) when including business expenses and existing card balances.',
          'High propensity for retail spending leaves minimal fallback margin in lean months.'
        ]
      },
      step6_recommendation: {
        applicant_summary: 'Self-employed design consultant displaying creative business drive and consistent boutique client invoice payments, paired with elevated overhead liabilities.',
        financial_stability_assessment: 'Finances are viable but close to bank threshold margins. High credit card utilization reduces immediate liquidity reserve capacity.',
        risk_indicators_summary: 'Invoice variability and PayPal transfers represent mild risk points that warrant tracking.',
        missing_documents_remedy: 'Request 3 previous months of invoice copies to crosscheck Wells Fargo PayPal transfers.',
        fraud_risk_observations: 'Tax filings appear authentic and match reported LLC operational parameters.',
        loan_eligibility_assessment: 'Eligible for loan approval but with conditional limits on funding amount and higher interest coverage.',
        max_eligible_loan: 30000,
        recommended_interest_rate_percentage: 9.85,
        recommended_action: 'Approve with modified amount of $30,000 (reduced from $40,000) and require additional invoice copies.',
        final_decision: 'Approve with Conditions'
      }
    };
  } else {
    // High Risk profile
    return {
      id: 'LRA-2026-0002H',
      timestamp,
      applicant_name: 'Vikram Rathore',
      step1_profile: {
        name: 'Vikram Rathore',
        employment_details: 'Casual Contract General Laborer',
        salary: 2900,
        employer_name: 'Independent Sub-contractors (Unstructured Cash Payments)',
        account_details: 'Unverified Union Account ****1102',
        monthly_income: 2900,
        liabilities: [
          { source: 'Micro-Finance Instant App', monthly_payment: 320, total_amount: 1500 },
          { source: 'Payday Loan Provider', monthly_payment: 550, total_amount: 2200 },
          { source: 'Private Creditor', monthly_payment: 400, total_amount: 8000 }
        ],
        loan_amount_requested: 25000,
        repayment_tenure_months: 12
      },
      step2_analysis: {
        salary_consistency: 'Highly erratic. No systematic automated employer deposits. Check clearings occur randomly, with frequent cash deposit variations.',
        monthly_inflow: 2900,
        monthly_outflow: 3150,
        emi_burden_percentage: 43.7,
        debt_to_income_ratio_percentage: 68.9,
        spending_behavior: 'Highly volatile. Significant, immediate cash-outs upon receiving funds. Extensive transactions at wagering/gaming sites and alternative lenders.',
        savings_pattern: 'Extremely weak or negative. Daily average balances rarely exceed $150. Running on overdraft lines regularly.',
        suspicious_transactions: [
          'Multiple sudden ATM cash withdrawals of $500 within minutes of payroll checks clearing.',
          'Frequent non-sufficient-fund (NSF) bounce charges ($35 each) indicating deep liquidity distress.'
        ]
      },
      step3_risks: {
        financial_risks: ['Severe cash flow insolvency. Outflows systematically exceed inflows.'],
        income_stability_risks: ['Extremely unstable temporary laboring gigs with no guaranteed hour assignments or formal contract tenure.'],
        excessive_liability_risks: ['DTI is at 68.9% which is catastrophic and represents serious debt-spiral traps.'],
        unusual_withdrawals: ['Immediate full cash depletion behavior indicates potential undisclosed secondary debts or high-risk spending.'],
        fraud_risk_indicators: ['Pay slips are generic, lack official corporation tax identifiers, and use non-standard formatting.'],
        missing_or_inconsistent_info: ['Employers name on the application form does not match the names written on check deposits.']
      },
      step4_validation: {
        pan: { status: 'Missing', details: 'No physical card uploaded; PAN checkup returning unrecorded error in bank database.' },
        aadhaar: { status: 'Unclear', details: 'Aadhaar copy displays blurry photo and fuzzy barcode validation.' },
        address_proof: { status: 'Missing', details: 'Supplied electricity bill is under another family member name without relation proof.' },
        salary_proof: { status: 'Unclear', details: 'Unofficial hand-written receipts do not provide formal proof of tax remittances.' },
        bank_verification: { status: 'Unclear', details: 'Frequent balance alerts and unverified deposit channels.' },
        employer_verification: { status: 'Missing', details: 'Employer contact phone calls went unanswered; firm lacks physical address registration.' },
        loan_declaration: { status: 'Verified', details: 'Duly signed but contains multiple whiteout corrections.' }
      },
      step5_evaluation: {
        risk_rating: 'High Risk',
        reasoning: [
          'Extreme DTI ratio of 68.9% leaves negligible room for sustaining mortgage or personal EMI obligations.',
          'Pervasive payday lender usage and microfinance apps signal immediate financial distress.',
          'Frequent overdrafts, NSF notifications, and high-velocity cash withdraw patterns represent extreme credit default probabilities.',
          'Core KYC and identification documents (PAN, Adhaar, and Employer Status) are missing or failed verification checks.'
        ]
      },
      step6_recommendation: {
        applicant_summary: 'Short-term laborer with high dependency on microfinance platforms, presenting extensive transaction anomalies and multi-point document verification failure.',
        financial_stability_assessment: 'Highly unstable. Negative ledger surplus. Under constant reliance on ultra high-cost external financing loops.',
        risk_indicators_summary: 'Severe combination of high-risk activities (casual jobs, NSF alerts, immediate ATM withdrawals, unverified employer status).',
        missing_documents_remedy: 'Applicant must supply official valid PAN, verified employer records, and 3 months tax-deducted salary slips before file can proceed.',
        fraud_risk_observations: 'Extremely high. High probability of fabricated or high-distortion payment receipts used to simulate steady income.',
        loan_eligibility_assessment: 'Completely ineligible for prime bank credit framework. Highly unsafe to disburse.',
        max_eligible_loan: 0,
        recommended_interest_rate_percentage: 0,
        recommended_action: 'Decline loan application outright to prevent immediate asset write-down. Retain record in high-risk risk registry.',
        final_decision: 'Reject'
      }
    };
  }
}

// -------------------------------------------------------------
// Vite Server Integration & Static Assets
// -------------------------------------------------------------
async function runServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Loan Risk Assessment Server running on http://0.0.0.0:${PORT}`);
  });
}

runServer();
