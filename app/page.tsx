'use client';

import { useState, useRef } from 'react';
import { GrantAnalysis } from '@/lib/types';
import DecisionSheet from '@/components/DecisionSheet';
import HistorySidebar from '@/components/HistorySidebar';
import { exportToPDF, copyToClipboard } from '@/lib/export';

export default function Home() {
  const [currentAnalysis, setCurrentAnalysis] = useState<GrantAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Le fichier doit être un PDF');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 10MB');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setCurrentAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'analyse');
      }

      const analysis: GrantAnalysis = await response.json();
      setCurrentAnalysis(analysis);
      setRefreshHistory(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSelectAnalysis = (analysis: GrantAnalysis) => {
    setCurrentAnalysis(analysis);
    setError(null);
  };

  const handleNotesChange = async (notes: string) => {
    if (!currentAnalysis) return;

    try {
      const response = await fetch(`/api/history/${currentAnalysis.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ personalNotes: notes }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde des notes');
      }

      setCurrentAnalysis({
        ...currentAnalysis,
        personalNotes: notes,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="flex h-screen bg-[--background]">
      {/* Sidebar */}
      <div className="w-64 border-r border-[--border] flex-shrink-0">
        <HistorySidebar
          onSelectAnalysis={handleSelectAnalysis}
          refreshTrigger={refreshHistory}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-12 py-16">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-semibold text-[--foreground] mb-2">
              Grant AI Assistant
            </h1>
            <p className="text-[--muted] text-base">
              Analysez vos appels à projets en 2 minutes
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-lg">⚠</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-xs text-red-600 hover:text-red-700 mt-1 underline"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upload zone - shown when no analysis */}
          {!currentAnalysis && !isAnalyzing && (
            <div
              className={`notion-card p-12 text-center transition-all ${
                isDragging
                  ? 'border-[--accent] bg-blue-50/30'
                  : 'hover:border-[--muted]'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-16 h-16 mx-auto bg-[--hover] rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[--muted]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-medium text-[--foreground] mb-1">
                    Glissez votre PDF ici
                  </p>
                  <p className="text-sm text-[--muted]">
                    ou{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[--accent] hover:underline font-medium"
                    >
                      parcourez vos fichiers
                    </button>
                  </p>
                </div>
                <p className="text-xs text-[--muted]">
                  PDF uniquement • Maximum 10MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}

          {/* Analyzing state */}
          {isAnalyzing && (
            <div className="notion-card p-12 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-16 h-16 mx-auto bg-[--hover] rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[--accent] border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <p className="text-base font-medium text-[--foreground] mb-1">
                    Analyse en cours...
                  </p>
                  <p className="text-sm text-[--muted]">
                    L'IA analyse votre document
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Decision sheet */}
          {currentAnalysis && !isAnalyzing && (
            <div className="space-y-4">
              {/* Action bar */}
              <div className="flex items-center justify-between pb-4">
                <button
                  onClick={() => {
                    setCurrentAnalysis(null);
                    setError(null);
                  }}
                  className="text-sm text-[--muted] hover:text-[--foreground] flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Retour
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="notion-button-secondary text-sm"
                >
                  Nouvelle analyse
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              <DecisionSheet
                analysis={currentAnalysis}
                onExportPDF={() => exportToPDF(currentAnalysis)}
                onCopyToClipboard={() => copyToClipboard(currentAnalysis.decisionSheet)}
                onNotesChange={handleNotesChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
