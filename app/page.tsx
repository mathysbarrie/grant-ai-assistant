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

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Le fichier doit être un PDF');
      return;
    }

    // Validate file size (10MB max)
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
      setRefreshHistory(prev => prev + 1); // Trigger history refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag events
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

  // Handle selecting analysis from history
  const handleSelectAnalysis = (analysis: GrantAnalysis) => {
    setCurrentAnalysis(analysis);
    setError(null);
  };

  // Handle updating notes
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

      // Update local state
      setCurrentAnalysis({
        ...currentAnalysis,
        personalNotes: notes,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <HistorySidebar
          onSelectAnalysis={handleSelectAnalysis}
          refreshTrigger={refreshHistory}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Grant AI Assistant</h1>
            <p className="text-gray-600 mt-2">
              Analysez vos appels à projets en 2 minutes grâce à l'IA
            </p>
          </div>

          {/* Upload zone - shown when no analysis is displayed or when analyzing */}
          {!currentAnalysis && !isAnalyzing && (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="text-6xl">📄</div>
                <div>
                  <p className="text-lg font-semibold text-gray-700">
                    Glissez-déposez votre PDF ici
                  </p>
                  <p className="text-sm text-gray-500 mt-1">ou</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                >
                  Choisir un fichier
                </button>
                <p className="text-xs text-gray-500">
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
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
              <p className="mt-6 text-lg font-semibold text-gray-700">
                Analyse en cours...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                L'IA analyse votre document, cela peut prendre 10-30 secondes
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold">❌ Erreur</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-3 text-red-600 hover:text-red-800 text-sm underline"
              >
                Fermer
              </button>
            </div>
          )}

          {/* Decision sheet */}
          {currentAnalysis && !isAnalyzing && (
            <div className="space-y-4">
              {/* New analysis button */}
              <div className="flex justify-end">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
                >
                  ➕ Nouvelle analyse
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
