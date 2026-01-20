'use client';

import { useState, useEffect } from 'react';
import { GrantAnalysis } from '@/lib/types';

interface HistorySidebarProps {
  onSelectAnalysis: (analysis: GrantAnalysis) => void;
  refreshTrigger?: number;
}

export default function HistorySidebar({ onSelectAnalysis, refreshTrigger }: HistorySidebarProps) {
  const [analyses, setAnalyses] = useState<GrantAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/history');

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique');
      }

      const data = await response.json();
      setAnalyses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!confirm('Supprimer cette analyse ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/history?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await fetchHistory();

      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleSelect = (analysis: GrantAnalysis) => {
    setSelectedId(analysis.id);
    onSelectAnalysis(analysis);
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'worth-pursuing':
        return { label: 'À creuser', class: 'bg-emerald-50 text-emerald-700' };
      case 'needs-verification':
        return { label: 'À vérifier', class: 'bg-amber-50 text-amber-700' };
      case 'skip':
        return { label: 'À ignorer', class: 'bg-red-50 text-red-700' };
      default:
        return { label: recommendation, class: 'bg-gray-50 text-gray-700' };
    }
  };

  return (
    <div className="h-full flex flex-col bg-[--background]">
      {/* Header */}
      <div className="p-4 border-b border-[--border]">
        <h2 className="text-sm font-semibold text-[--foreground]">Historique</h2>
        <p className="text-xs text-[--muted] mt-0.5">
          {analyses.length} analyse{analyses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-6 flex flex-col items-center">
            <div className="w-6 h-6 border-2 border-[--accent] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-xs text-[--muted]">Chargement...</p>
          </div>
        )}

        {error && (
          <div className="p-4">
            <p className="text-xs text-red-600 mb-2">{error}</p>
            <button
              onClick={fetchHistory}
              className="text-xs text-[--accent] hover:underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && analyses.length === 0 && (
          <div className="p-6 text-center">
            <svg className="w-12 h-12 mx-auto text-[--muted] opacity-30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xs text-[--muted]">Aucune analyse</p>
          </div>
        )}

        {!loading && !error && analyses.length > 0 && (
          <div className="py-2">
            {analyses.map((analysis) => {
              const badge = getRecommendationBadge(analysis.recommendation);
              const isSelected = selectedId === analysis.id;

              return (
                <button
                  key={analysis.id}
                  onClick={() => handleSelect(analysis)}
                  className={`w-full px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-[--hover]'
                      : 'hover:bg-[--hover]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-medium text-[--foreground] line-clamp-2 flex-1">
                      {analysis.title}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(analysis.id, e)}
                      className="p-0.5 hover:bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer"
                    >
                      <svg className="w-3.5 h-3.5 text-[--muted] hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-[--muted] mb-2">
                    {new Date(analysis.uploadDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs ${badge.class}`}>
                    {badge.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
