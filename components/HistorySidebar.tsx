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
    <div className="h-full flex flex-col bg-white border-r border-[--border]">
      {/* Header */}
      <div className="p-6 border-b border-[--border] bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-[--foreground]">Historique</h2>
        </div>
        <p className="text-sm text-[--muted]">
          {analyses.length} analyse{analyses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-8 flex flex-col items-center">
            <div className="w-10 h-10 border-3 border-[--accent] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-[--muted]">Chargement...</p>
          </div>
        )}

        {error && (
          <div className="p-4 m-4 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <button
              onClick={fetchHistory}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && analyses.length === 0 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[--muted]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-[--muted]">Aucune analyse</p>
            <p className="text-xs text-[--muted] mt-1">Commencez par uploader un PDF</p>
          </div>
        )}

        {!loading && !error && analyses.length > 0 && (
          <div className="p-3 space-y-2">
            {analyses.map((analysis) => {
              const badge = getRecommendationBadge(analysis.recommendation);
              const isSelected = selectedId === analysis.id;

              return (
                <button
                  key={analysis.id}
                  onClick={() => handleSelect(analysis)}
                  className={`group w-full p-3 text-left transition-all rounded-xl border ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-sm'
                      : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-slate-50 border-transparent hover:border-[--border] hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-[--foreground] line-clamp-2 flex-1">
                      {analysis.title}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(analysis.id, e)}
                      className="p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-200"
                      title="Supprimer"
                    >
                      <svg className="w-3.5 h-3.5 text-[--muted] hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-3.5 h-3.5 text-[--muted]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-[--muted]">
                      {new Date(analysis.uploadDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${badge.class}`}>
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
