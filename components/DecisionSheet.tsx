'use client';

import { GrantAnalysis } from '@/lib/types';

interface DecisionSheetProps {
  analysis: GrantAnalysis;
  onExportPDF?: () => void;
  onCopyToClipboard?: () => void;
  onNotesChange?: (notes: string) => void;
}

export default function DecisionSheet({
  analysis,
  onExportPDF,
  onCopyToClipboard,
  onNotesChange,
}: DecisionSheetProps) {
  const { decisionSheet, personalNotes } = analysis;

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'YES':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'NO':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'UNCERTAIN':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getComplexityStyle = (complexity: string) => {
    switch (complexity) {
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Heavy':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRecommendationStyle = (decision: string) => {
    switch (decision) {
      case 'worth-pursuing':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'needs-verification':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'skip':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRecommendationLabel = (decision: string) => {
    switch (decision) {
      case 'worth-pursuing':
        return 'À creuser';
      case 'needs-verification':
        return 'À vérifier';
      case 'skip':
        return 'À ignorer';
      default:
        return decision;
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'YES':
        return 'Éligible';
      case 'NO':
        return 'Non éligible';
      case 'UNCERTAIN':
        return 'Incertain';
      default:
        return verdict;
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="p-10 pb-0">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-[--foreground] mb-2">{analysis.title}</h1>
            <div className="flex items-center gap-2 text-sm text-[--muted]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Analysé le {new Date(analysis.uploadDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {onCopyToClipboard && (
              <button
                onClick={onCopyToClipboard}
                className="p-3 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 rounded-lg transition-all border border-transparent hover:border-[--border]"
                title="Copier"
              >
                <svg className="w-5 h-5 text-[--muted] hover:text-[--accent]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            )}
            {onExportPDF && (
              <button
                onClick={onExportPDF}
                className="p-3 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 rounded-lg transition-all border border-transparent hover:border-[--border]"
                title="Exporter PDF"
              >
                <svg className="w-5 h-5 text-[--muted] hover:text-[--accent]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="divider mx-10" />

      {/* Content */}
      <div className="p-10 space-y-10">
        {/* Section 1: Executive Summary */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[--accent]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-[--foreground]">Résumé exécutif</h2>
          </div>
          <p className="text-[--foreground] leading-relaxed whitespace-pre-wrap text-[15px]">
            {decisionSheet.executiveSummary}
          </p>
        </section>

        {/* Section 2: Eligibility */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-[--foreground]">Éligibilité</h2>
          </div>
          <span className={`badge ${getVerdictStyle(decisionSheet.eligibility.verdict)}`}>
            {getVerdictLabel(decisionSheet.eligibility.verdict)}
          </span>
          <p className="text-[--foreground] leading-relaxed mt-4 whitespace-pre-wrap text-[15px]">
            {decisionSheet.eligibility.justification}
          </p>
        </section>

        {/* Section 3: Financial Terms */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-[--foreground]">Termes financiers</h2>
          </div>
          <p className="text-[--foreground] leading-relaxed whitespace-pre-wrap text-[15px]">
            {decisionSheet.financialTerms}
          </p>
        </section>

        {/* Section 4: Deadlines & Workload */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-[--foreground]">Délais & Charge de travail</h2>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-2">Deadline de dépôt</p>
                <p className="text-base font-semibold text-[--foreground]">{decisionSheet.deadlinesWorkload.deadline}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <p className="text-xs font-medium text-purple-600 mb-2">Période du projet</p>
                <p className="text-base font-semibold text-[--foreground]">{decisionSheet.deadlinesWorkload.projectPeriod}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[--muted] mb-3">Complexité administrative</p>
              <div className="flex items-center gap-3">
                <span className={`badge ${getComplexityStyle(decisionSheet.deadlinesWorkload.complexity)}`}>
                  {decisionSheet.deadlinesWorkload.complexity}
                </span>
                {decisionSheet.deadlinesWorkload.estimatedHours && (
                  <span className="text-sm text-[--muted]">
                    ~{decisionSheet.deadlinesWorkload.estimatedHours}h estimées
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Blockers & Risks */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-[--foreground]">Points bloquants & Risques</h2>
          </div>
          <p className="text-[--foreground] leading-relaxed whitespace-pre-wrap text-[15px]">
            {decisionSheet.blockersRisks}
          </p>
        </section>

        {/* Section 6: Final Recommendation */}
        <section className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[--foreground]">Recommandation finale</h2>
          </div>
          <span className={`badge ${getRecommendationStyle(decisionSheet.finalRecommendation.decision)} text-base px-4 py-2 shadow-sm`}>
            {getRecommendationLabel(decisionSheet.finalRecommendation.decision)}
          </span>
          <div className="mt-6">
            <p className="text-sm font-medium text-[--muted] mb-3">Raisons principales</p>
            <ul className="space-y-3">
              {decisionSheet.finalRecommendation.reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-3 text-[15px] text-[--foreground]">
                  <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm border border-indigo-100">
                    <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="flex-1 leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Personal Notes */}
        {onNotesChange && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-[--foreground]">Notes personnelles</h2>
            </div>
            <textarea
              className="input min-h-[140px] resize-y"
              placeholder="Ajoutez vos notes et remarques personnelles..."
              defaultValue={personalNotes || ''}
              onBlur={(e) => onNotesChange(e.target.value)}
            />
          </section>
        )}
      </div>
    </div>
  );
}
