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

  // Fetch history from API
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

  // Fetch on mount and when refreshTrigger changes
  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  // Delete an analysis
  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent selection when clicking delete

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette analyse ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/history?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Refresh the list
      await fetchHistory();

      // Clear selection if the deleted item was selected
      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  // Handle selection
  const handleSelect = (analysis: GrantAnalysis) => {
    setSelectedId(analysis.id);
    onSelectAnalysis(analysis);
  };

  // Get badge styling for recommendation
  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'worth-pursuing':
        return { label: '✅ À creuser', class: 'bg-green-100 text-green-800' };
      case 'needs-verification':
        return { label: '⚠️ À vérifier', class: 'bg-yellow-100 text-yellow-800' };
      case 'skip':
        return { label: '❌ À ignorer', class: 'bg-red-100 text-red-800' };
      default:
        return { label: recommendation, class: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Historique</h2>
        <p className="text-sm text-gray-500 mt-1">
          {analyses.length} analyse{analyses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm">Chargement...</p>
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchHistory}
              className="mt-2 text-blue-500 hover:text-blue-700 text-sm underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && analyses.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">Aucune analyse pour le moment</p>
            <p className="text-xs mt-1">Uploadez un PDF pour commencer</p>
          </div>
        )}

        {!loading && !error && analyses.length > 0 && (
          <div className="divide-y divide-gray-200">
            {analyses.map((analysis) => {
              const badge = getRecommendationBadge(analysis.recommendation);
              const isSelected = selectedId === analysis.id;

              return (
                <div
                  key={analysis.id}
                  onClick={() => handleSelect(analysis)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {analysis.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(analysis.uploadDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(analysis.id, e)}
                      className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${badge.class}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
