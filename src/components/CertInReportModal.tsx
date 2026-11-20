/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Clock, ShieldCheck, Printer } from 'lucide-react';

interface CertInReportModalProps {
  incidentId: string;
  onClose: () => void;
}

export const CertInReportModal: React.FC<CertInReportModalProps> = ({ incidentId, onClose }) => {
  const [reportMd, setReportMd] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(18250);

  useEffect(() => {
    fetch(`/api/incidents/${incidentId}/report?format=md`)
      .then(res => res.text())
      .then(text => {
        setReportMd(text);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [incidentId]);

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    const blob = new Blob([reportMd], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CERT-In-Report-${incidentId}.md`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c222b] border border-slate-200 dark:border-[#2b3442] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-[#2b3442] flex flex-wrap items-center justify-between gap-4 bg-slate-50/70 dark:bg-[#171d25]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#edf4f8] dark:bg-[#22313f] flex items-center justify-center text-[#2c5f7c] dark:text-[#8ab8d6]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                CERT-In 6-Hour Statutory Report
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Incident: {incidentId}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#fef9ee] dark:bg-[#2c2419] border border-[#f2dfb6] dark:border-[#4e3e23] px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums text-[#9a6318] dark:text-[#dfb06a]">
              <Clock className="w-3.5 h-3.5" />
              <span>Window: {formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close report modal"
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-[#232b36] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto font-mono text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1c222b]">
          {loading ? (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400">
              Generating statutory compliance report...
            </div>
          ) : (
            <pre className="whitespace-pre-wrap leading-relaxed font-mono">{reportMd}</pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#2b3442] bg-slate-50/70 dark:bg-[#171d25] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#286b49] dark:text-[#72b893]" />
            <span>Formatted for Indian CERT-In 6-hour cybersecurity directive compliance.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-slate-100 dark:bg-[#232b36] dark:hover:bg-[#2d3745] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#323d4d] px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>
            <button
              onClick={handleDownload}
              className="bg-[#2c5f7c] hover:bg-[#234d65] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download Markdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
