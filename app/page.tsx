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
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex-shrink-0">
        <HistorySidebar
          onSelectAnalysis={handleSelectAnalysis}
          refreshTrigger={refreshHistory}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-12">
          {/* Hero Section - Only when no analysis */}
          {!currentAnalysis && !isAnalyzing && !error && (
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Propulsé par l'IA
              </div>

              <h1 className="text-6xl font-bold tracking-tight text-gray-900 mb-6">
                Analysez vos appels à projet
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  en 2 minutes
                </span>
              </h1>

              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
                Transformez 60 minutes de lecture en une fiche de décision claire et actionnelle.
                Notre IA analyse votre PDF et extrait toutes les informations clés.
              </p>

              {/* Stats */}
              <div className="flex justify-center gap-12 mb-16">
                <div>
                  <div className="text-3xl font-bold text-gray-900">2 min</div>
                  <div className="text-sm text-gray-600">Temps d'analyse</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600">Précision</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">6</div>
                  <div className="text-sm text-gray-600">Sections analysées</div>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-sm text-red-700 hover:text-red-800 mt-1 font-medium"
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
              className={`relative group border-2 border-dashed rounded-2xl p-16 text-center transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50 scale-105'
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <svg className="w-16 h-16 mx-auto text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Glissez-déposez votre PDF
                </h3>
                <p className="text-gray-600 mb-6">
                  ou{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    parcourez vos fichiers
                  </button>
                </p>

                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF uniquement
                  </span>
                  <span>•</span>
                  <span>Max 10 MB</span>
                </div>
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
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analyse en cours...
              </h3>
              <p className="text-gray-600">
                Notre IA examine votre document
              </p>
            </div>
          )}

          {/* Decision sheet */}
          {currentAnalysis && !isAnalyzing && (
            <div className="space-y-6">
              {/* Action bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setCurrentAnalysis(null);
                    setError(null);
                  }}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Retour
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
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
