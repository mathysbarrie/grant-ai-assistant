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

  // Badge styles based on verdict/decision
  const getEligibilityBadgeClass = (verdict: string) => {
    switch (verdict) {
      case 'YES':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'NO':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'UNCERTAIN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getComplexityBadgeClass = (complexity: string) => {
    switch (complexity) {
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Heavy':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRecommendationBadgeClass = (decision: string) => {
    switch (decision) {
      case 'worth-pursuing':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'needs-verification':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'skip':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRecommendationLabel = (decision: string) => {
    switch (decision) {
      case 'worth-pursuing':
        return '✅ À creuser';
      case 'needs-verification':
        return '⚠️ À vérifier';
      case 'skip':
        return '❌ À ignorer';
      default:
        return decision;
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'YES':
        return '✅ OUI';
      case 'NO':
        return '❌ NON';
      case 'UNCERTAIN':
        return '⚠️ INCERTAIN';
      default:
        return verdict;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header with title and action buttons */}
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{analysis.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Analysé le {new Date(analysis.uploadDate).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="flex gap-2">
          {onCopyToClipboard && (
            <button
              onClick={onCopyToClipboard}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              📋 Copier
            </button>
          )}
          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 transition"
            >
              📄 Exporter PDF
            </button>
          )}
        </div>
      </div>

      {/* Section 1: Executive Summary */}
      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-blue-500 pl-3">
          1. Résumé exécutif
        </h3>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {decisionSheet.executiveSummary}
        </p>
      </section>

      {/* Section 2: Eligibility */}
      <section className="space-y-2 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-green-500 pl-3">
          2. Éligibilité
        </h3>
        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-2 rounded-full border font-semibold ${getEligibilityBadgeClass(
              decisionSheet.eligibility.verdict
            )}`}
          >
            {getVerdictLabel(decisionSheet.eligibility.verdict)}
          </span>
        </div>
        <p className="text-gray-700 mt-3 whitespace-pre-wrap leading-relaxed">
          {decisionSheet.eligibility.justification}
        </p>
      </section>

      {/* Section 3: Financial Terms */}
      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-purple-500 pl-3">
          3. Termes financiers
        </h3>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {decisionSheet.financialTerms}
        </p>
      </section>

      {/* Section 4: Deadlines & Workload */}
      <section className="space-y-2 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-orange-500 pl-3">
          4. Délais & Charge de travail
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <p className="text-sm text-gray-600">Deadline de dépôt</p>
            <p className="font-semibold text-gray-900">{decisionSheet.deadlinesWorkload.deadline}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Période du projet</p>
            <p className="font-semibold text-gray-900">{decisionSheet.deadlinesWorkload.projectPeriod}</p>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-2">Complexité administrative</p>
          <span
            className={`px-4 py-2 rounded-full border font-semibold inline-block ${getComplexityBadgeClass(
              decisionSheet.deadlinesWorkload.complexity
            )}`}
          >
            {decisionSheet.deadlinesWorkload.complexity}
          </span>
          {decisionSheet.deadlinesWorkload.estimatedHours && (
            <span className="ml-3 text-gray-700">
              (~{decisionSheet.deadlinesWorkload.estimatedHours}h estimées)
            </span>
          )}
        </div>
      </section>

      {/* Section 5: Blockers & Risks */}
      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-red-500 pl-3">
          5. Points bloquants & Risques
        </h3>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {decisionSheet.blockersRisks}
        </p>
      </section>

      {/* Section 6: Final Recommendation */}
      <section className="space-y-3 bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border-2 border-gray-300">
        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-indigo-500 pl-3">
          6. Recommandation finale
        </h3>
        <div className="flex items-center gap-3">
          <span
            className={`px-6 py-3 rounded-lg border-2 font-bold text-lg ${getRecommendationBadgeClass(
              decisionSheet.finalRecommendation.decision
            )}`}
          >
            {getRecommendationLabel(decisionSheet.finalRecommendation.decision)}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2 font-semibold">Raisons :</p>
          <ul className="list-disc list-inside space-y-1">
            {decisionSheet.finalRecommendation.reasons.map((reason, index) => (
              <li key={index} className="text-gray-700">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Personal Notes Section */}
      {onNotesChange && (
        <section className="space-y-2 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900">Notes personnelles</h3>
          <textarea
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            placeholder="Ajoutez vos notes personnelles ici..."
            defaultValue={personalNotes || ''}
            onBlur={(e) => onNotesChange(e.target.value)}
          />
        </section>
      )}
    </div>
  );
}
