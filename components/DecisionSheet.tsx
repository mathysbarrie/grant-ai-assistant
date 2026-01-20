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
    <div className="notion-card">
      {/* Header */}
      <div className="p-8 pb-0">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-semibold text-[--foreground]">{analysis.title}</h1>
          <div className="flex gap-2">
            {onCopyToClipboard && (
              <button
                onClick={onCopyToClipboard}
                className="p-2 hover:bg-[--hover] rounded transition-colors"
                title="Copier"
              >
                <svg className="w-5 h-5 text-[--muted]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            )}
            {onExportPDF && (
              <button
                onClick={onExportPDF}
                className="p-2 hover:bg-[--hover] rounded transition-colors"
                title="Exporter PDF"
              >
                <svg className="w-5 h-5 text-[--muted]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-[--muted]">
          Analysé le {new Date(analysis.uploadDate).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </div>

      <div className="notion-divider mx-8" />

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Section 1: Executive Summary */}
        <section>
          <h2 className="text-sm font-semibold text-[--foreground] mb-3">Résumé exécutif</h2>
          <p className="text-sm text-[--foreground] leading-relaxed whitespace-pre-wrap">
            {decisionSheet.executiveSummary}
          </p>
        </section>

        {/* Section 2: Eligibility */}
        <section>
          <h2 className="text-sm font-semibold text-[--foreground] mb-3">Éligibilité</h2>
          <span className={`notion-badge border ${getVerdictStyle(decisionSheet.eligibility.verdict)}`}>
            {getVerdictLabel(decisionSheet.eligibility.verdict)}
          </span>
          <p className="text-sm text-[--foreground] leading-relaxed mt-3 whitespace-pre-wrap">
            {decisionSheet.eligibility.justification}
          </p>
        </section>

        {/* Section 3: Financial Terms */}
        <section>
          <h2 className="text-sm font-semibold text-[--foreground] mb-3">Termes financiers</h2>
          <p className="text-sm text-[--foreground] leading-relaxed whitespace-pre-wrap">
            {decisionSheet.financialTerms}
          </p>
        </section>

        {/* Section 4: Deadlines & Workload */}
        <section>
          <h2 className="text-sm font-semibold text-[--foreground] mb-3">Délais & Charge de travail</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[--muted] mb-1">Deadline de dépôt</p>
                <p className="text-sm font-medium text-[--foreground]">{decisionSheet.deadlinesWorkload.deadline}</p>
              </div>
              <div>
                <p className="text-xs text-[--muted] mb-1">Période du projet</p>
                <p className="text-sm font-medium text-[--foreground]">{decisionSheet.deadlinesWorkload.projectPeriod}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-[--muted] mb-2">Complexité administrative</p>
              <span className={`notion-badge border ${getComplexityStyle(decisionSheet.deadlinesWorkload.complexity)}`}>
                {decisionSheet.deadlinesWorkload.complexity}
              </span>
              {decisionSheet.deadlinesWorkload.estimatedHours && (
                <span className="ml-2 text-sm text-[--muted]">
                  ~{decisionSheet.deadlinesWorkload.estimatedHours}h estimées
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Section 5: Blockers & Risks */}
        <section>
          <h2 className="text-sm font-semibold text-[--foreground] mb-3">Points bloquants & Risques</h2>
          <p className="text-sm text-[--foreground] leading-relaxed whitespace-pre-wrap">
            {decisionSheet.blockersRisks}
          </p>
        </section>

        {/* Section 6: Final Recommendation */}
        <section className="p-6 bg-[--hover] rounded-lg border border-[--border]">
          <h2 className="text-sm font-semibold text-[--foreground] mb-3">Recommandation finale</h2>
          <span className={`notion-badge border ${getRecommendationStyle(decisionSheet.finalRecommendation.decision)} text-base px-3 py-1`}>
            {getRecommendationLabel(decisionSheet.finalRecommendation.decision)}
          </span>
          <div className="mt-4">
            <p className="text-xs text-[--muted] mb-2">Raisons</p>
            <ul className="space-y-1.5">
              {decisionSheet.finalRecommendation.reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-[--foreground]">
                  <span className="text-[--muted] mt-0.5">•</span>
                  <span className="flex-1">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Personal Notes */}
        {onNotesChange && (
          <section>
            <h2 className="text-sm font-semibold text-[--foreground] mb-3">Notes personnelles</h2>
            <textarea
              className="notion-input min-h-[120px] resize-y text-sm"
              placeholder="Ajoutez vos notes ici..."
              defaultValue={personalNotes || ''}
              onBlur={(e) => onNotesChange(e.target.value)}
            />
          </section>
        )}
      </div>
    </div>
  );
}
