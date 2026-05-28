import React, { useState, useRef } from 'react';
import { Upload, FileUp, FileCheck2, Trash2, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { UploadedFile } from '../types';

interface DocumentUploadCardProps {
  onFilesReady: (files: UploadedFile[]) => void;
  onRunAudit: () => void;
  isLoading: boolean;
  selectedPreset: string | null;
}

export default function DocumentUploadCard({ onFilesReady, onRunAudit, isLoading, selectedPreset }: DocumentUploadCardProps) {
  const [loanAppFile, setLoanAppFile] = useState<UploadedFile | null>(null);
  const [salarySlipFile, setSalarySlipFile] = useState<UploadedFile | null>(null);
  const [bankStatementFile, setBankStatementFile] = useState<UploadedFile | null>(null);

  const [dragActive1, setDragActive1] = useState(false);
  const [dragActive2, setDragActive2] = useState(false);
  const [dragActive3, setDragActive3] = useState(false);

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);

  const processFile = (file: File, type: 'loan' | 'salary' | 'bank') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const uploadedFile: UploadedFile = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        content: result
      };

      if (type === 'loan') {
        setLoanAppFile(uploadedFile);
        updateFilesTrigger(uploadedFile, salarySlipFile, bankStatementFile);
      } else if (type === 'salary') {
        setSalarySlipFile(uploadedFile);
        updateFilesTrigger(loanAppFile, uploadedFile, bankStatementFile);
      } else if (type === 'bank') {
        setBankStatementFile(uploadedFile);
        updateFilesTrigger(loanAppFile, salarySlipFile, uploadedFile);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateFilesTrigger = (l: UploadedFile | null, s: UploadedFile | null, b: UploadedFile | null) => {
    const arr: UploadedFile[] = [];
    if (l) arr.push(l);
    if (s) arr.push(s);
    if (b) arr.push(b);
    onFilesReady(arr);
  };

  const clearFile = (type: 'loan' | 'salary' | 'bank') => {
    if (type === 'loan') {
      setLoanAppFile(null);
      updateFilesTrigger(null, salarySlipFile, bankStatementFile);
    } else if (type === 'salary') {
      setSalarySlipFile(null);
      updateFilesTrigger(loanAppFile, null, bankStatementFile);
    } else if (type === 'bank') {
      setBankStatementFile(null);
      updateFilesTrigger(loanAppFile, salarySlipFile, null);
    }
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setter(true);
    } else if (e.type === "dragleave") {
      setter(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'loan' | 'salary' | 'bank', setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    setter(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], type);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'loan' | 'salary' | 'bank') => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0], type);
    }
  };

  const isAnyFileUploaded = !!(loanAppFile || salarySlipFile || bankStatementFile);

  return (
    <div id="document-upload-manager" className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 id="doc-upload-heading" className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileUp className="h-5 w-5 text-slate-500" />
            Sequential Document Extraction Queue
          </h3>
          <p id="doc-upload-desc" className="text-xs text-slate-500">
            Upload custom PDFs, Salary Slips or CSV bank statements to run an active analysis with Gemini AI.
          </p>
        </div>
        {selectedPreset && (
          <span className="text-[11px] bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-md border border-slate-200">
            Template: <strong className="text-slate-800">{selectedPreset === 'low-risk' ? 'Johnathan Harris' : selectedPreset === 'medium-risk' ? 'Priya Sharma' : 'Vikram Rathore'}</strong> loaded
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Document 1: Loan Application */}
        <div
          id="upload-zone-loan"
          onDragEnter={(e) => handleDrag(e, setDragActive1)}
          onDragOver={(e) => handleDrag(e, setDragActive1)}
          onDragLeave={(e) => handleDrag(e, setDragActive1)}
          onDrop={(e) => handleDrop(e, 'loan', setDragActive1)}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 text-center transition-all ${
            loanAppFile ? 'border-emerald-500 bg-emerald-50/10' : dragActive1 ? 'border-slate-800 bg-slate-50' : 'border-slate-200 bg-slate-50/20 hover:border-slate-300'
          }`}
        >
          {loanAppFile ? (
            <div className="w-full">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 justify-between mb-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileCheck2 className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-semibold truncate text-left">{loanAppFile.name}</span>
                </div>
                <button onClick={() => clearFile('loan')} className="text-slate-400 hover:text-slate-600 p-1">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500">Loan Application ready for entity extraction.</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm mb-3">
                <FileText className="h-5 w-5 text-slate-500" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">1. Loan Application PDF</h4>
              <p className="text-[10px] text-slate-400 mt-1 mb-3">Drag & drop or click to upload applicant form.</p>
              <button
                type="button"
                onClick={() => fileInputRef1.current?.click()}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] hover:bg-slate-50 transition font-medium text-slate-700"
              >
                Choose File
              </button>
              <input
                type="file"
                ref={fileInputRef1}
                onChange={(e) => handleInputChange(e, 'loan')}
                accept=".pdf,image/*,.txt"
                className="hidden"
              />
            </>
          )}
        </div>

        {/* Document 2: Salary Slip */}
        <div
          id="upload-zone-salary"
          onDragEnter={(e) => handleDrag(e, setDragActive2)}
          onDragOver={(e) => handleDrag(e, setDragActive2)}
          onDragLeave={(e) => handleDrag(e, setDragActive2)}
          onDrop={(e) => handleDrop(e, 'salary', setDragActive2)}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 text-center transition-all ${
            salarySlipFile ? 'border-emerald-500 bg-emerald-50/10' : dragActive2 ? 'border-slate-800 bg-slate-50' : 'border-slate-200 bg-slate-50/20 hover:border-slate-300'
          }`}
        >
          {salarySlipFile ? (
            <div className="w-full">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 justify-between mb-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileCheck2 className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-semibold truncate text-left">{salarySlipFile.name}</span>
                </div>
                <button onClick={() => clearFile('salary')} className="text-slate-400 hover:text-slate-600 p-1">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500">Payslip record registered for net earnings validation.</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm mb-3">
                <FileText className="h-5 w-5 text-slate-500" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">2. Salary Slip (Payslips)</h4>
              <p className="text-[10px] text-slate-400 mt-1 mb-3">Drag & drop or click to upload income proof.</p>
              <button
                type="button"
                onClick={() => fileInputRef2.current?.click()}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] hover:bg-slate-50 transition font-medium text-slate-700"
              >
                Choose File
              </button>
              <input
                type="file"
                ref={fileInputRef2}
                onChange={(e) => handleInputChange(e, 'salary')}
                accept=".pdf,image/*,.txt"
                className="hidden"
              />
            </>
          )}
        </div>

        {/* Document 3: Bank Statement */}
        <div
          id="upload-zone-bank"
          onDragEnter={(e) => handleDrag(e, setDragActive3)}
          onDragOver={(e) => handleDrag(e, setDragActive3)}
          onDragLeave={(e) => handleDrag(e, setDragActive3)}
          onDrop={(e) => handleDrop(e, 'bank', setDragActive3)}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 text-center transition-all ${
            bankStatementFile ? 'border-emerald-500 bg-emerald-50/10' : dragActive3 ? 'border-slate-800 bg-slate-50' : 'border-slate-200 bg-slate-50/20 hover:border-slate-300'
          }`}
        >
          {bankStatementFile ? (
            <div className="w-full">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 justify-between mb-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileCheck2 className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-semibold truncate text-left">{bankStatementFile.name}</span>
                </div>
                <button onClick={() => clearFile('bank')} className="text-slate-400 hover:text-slate-600 p-1">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500">Bank ledger registered for transaction audit.</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm mb-3">
                <FileText className="h-5 w-5 text-slate-500" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">3. Bank statement / Ledger</h4>
              <p className="text-[10px] text-slate-400 mt-1 mb-3">Drag & drop or click to upload transactions list.</p>
              <button
                type="button"
                onClick={() => fileInputRef3.current?.click()}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] hover:bg-slate-50 transition font-medium text-slate-700"
              >
                Choose File
              </button>
              <input
                type="file"
                ref={fileInputRef3}
                onChange={(e) => handleInputChange(e, 'bank')}
                accept=".pdf,image/*,.txt,.csv"
                className="hidden"
              />
            </>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-slate-500">
          <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-[11px] text-left">
            {isAnyFileUploaded
              ? 'Using custom uploaded documents alongside template profile specifications.'
              : 'Using selected default corporate template documents structure.'}
          </span>
        </div>

        <button
          type="button"
          id="btn-trigger-audit"
          onClick={onRunAudit}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl text-xs hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-700 disabled:opacity-50 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          {isLoading ? 'Processing Enterprise Audit...' : 'Execute Sequenced Risk Audit'}
        </button>
      </div>
    </div>
  );
}
