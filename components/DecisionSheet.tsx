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
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      {/* Header */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{analysis.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {new Date(analysis.uploadDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {onCopyToClipboard && (
              <button
                onClick={onCopyToClipboard}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copier"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            )}
            {onExportPDF && (
              <button
                onClick={onExportPDF}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Exporter PDF"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Section 1: Executive Summary */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Résumé exécutif
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {decisionSheet.executiveSummary}
          </p>
        </section>

        <div className="border-t border-gray-200" />

        {/* Section 2: Eligibility */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Éligibilité
          </h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getVerdictStyle(decisionSheet.eligibility.verdict)}`}>
            {getVerdictLabel(decisionSheet.eligibility.verdict)}
          </span>
          <p className="text-gray-700 leading-relaxed mt-4 whitespace-pre-wrap">
            {decisionSheet.eligibility.justification}
          </p>
        </section>

        <div className="border-t border-gray-200" />

        {/* Section 3: Financial Terms */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Termes financiers
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {decisionSheet.financialTerms}
          </p>
        </section>

        <div className="border-t border-gray-200" />

        {/* Section 4: Deadlines & Workload */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Délais & Charge de travail
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1">Deadline de dépôt</p>
                <p className="text-base font-semibold text-gray-900">{decisionSheet.deadlinesWorkload.deadline}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1">Période du projet</p>
                <p className="text-base font-semibold text-gray-900">{decisionSheet.deadlinesWorkload.projectPeriod}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Complexité administrative</p>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getComplexityStyle(decisionSheet.deadlinesWorkload.complexity)}`}>
                  {decisionSheet.deadlinesWorkload.complexity}
                </span>
                {decisionSheet.deadlinesWorkload.estimatedHours && (
                  <span className="text-sm text-gray-600">
                    ~{decisionSheet.deadlinesWorkload.estimatedHours}h estimées
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-gray-200" />

        {/* Section 5: Blockers & Risks */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Points bloquants & Risques
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {decisionSheet.blockersRisks}
          </p>
        </section>

        <div className="border-t border-gray-200" />

        {/* Section 6: Final Recommendation */}
        <section className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Recommandation finale
          </h2>
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-base font-medium border ${getRecommendationStyle(decisionSheet.finalRecommendation.decision)}`}>
            {getRecommendationLabel(decisionSheet.finalRecommendation.decision)}
          </span>
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Raisons principales</p>
            <ul className="space-y-2">
              {decisionSheet.finalRecommendation.reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="flex-1 leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Personal Notes */}
        {onNotesChange && (
          <>
            <div className="border-t border-gray-200" />
            <section>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Notes personnelles
              </h2>
              <textarea
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[120px]"
                placeholder="Ajoutez vos notes et remarques personnelles..."
                defaultValue={personalNotes || ''}
                onBlur={(e) => onNotesChange(e.target.value)}
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
