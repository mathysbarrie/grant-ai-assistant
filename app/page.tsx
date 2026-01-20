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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0">
        <HistorySidebar
          onSelectAnalysis={handleSelectAnalysis}
          refreshTrigger={refreshHistory}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-slate-50">
        <div className="max-w-4xl mx-auto px-12 py-16">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-full mb-6">
              <div className="w-2 h-2 bg-[--accent] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-[--accent]">Propulsé par l'IA</span>
            </div>
            <h1 className="text-5xl font-bold text-[--foreground] mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Grant AI Assistant
            </h1>
            <p className="text-[--muted] text-lg max-w-2xl mx-auto">
              Transformez 60 minutes de lecture en 2 minutes d'analyse claire et actionnelle
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-5 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 mb-2">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
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
              className={`card-hover p-16 text-center transition-all ${
                isDragging
                  ? 'border-[--accent] bg-gradient-to-br from-indigo-50 to-purple-50 scale-105'
                  : ''
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="max-w-lg mx-auto">
                <div className="upload-icon mb-8">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
                    <svg className="w-12 h-12 text-[--accent] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[--foreground] mb-2">
                      Déposez votre PDF d'appel à projet
                    </h3>
                    <p className="text-[--muted] text-base">
                      ou{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[--accent] hover:text-[--accent-hover] font-medium transition-colors underline decoration-2 underline-offset-2"
                      >
                        parcourez vos fichiers
                      </button>
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm text-[--muted] pt-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Format PDF</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Max. 10 MB</span>
                    </div>
                  </div>
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
            <div className="card p-16 text-center">
              <div className="max-w-md mx-auto space-y-8">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-2xl blur-xl animate-pulse"></div>
                    <div className="w-12 h-12 border-4 border-[--accent] border-t-transparent rounded-full animate-spin relative z-10" />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-semibold text-[--foreground] mb-2">
                    Analyse en cours...
                  </p>
                  <p className="text-[--muted]">
                    Notre IA examine votre document pour extraire les informations clés
                  </p>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <div className="w-2 h-2 bg-[--accent] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-[--accent] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[--accent] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Decision sheet */}
          {currentAnalysis && !isAnalyzing && (
            <div className="space-y-4">
              {/* Action bar */}
              <div className="flex items-center justify-between pb-6">
                <button
                  onClick={() => {
                    setCurrentAnalysis(null);
                    setError(null);
                  }}
                  className="text-sm text-[--muted] hover:text-[--foreground] flex items-center gap-2 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Retour
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary"
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
