import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { extractTextFromPDF } from '@/lib/pdf-processor';
import { analyzeGrant } from '@/lib/ai-service';
import { saveAnalysis } from '@/lib/storage';
import { GrantAnalysis } from '@/lib/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    // Get the uploaded file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Le fichier doit être un PDF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Le fichier ne doit pas dépasser 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    let pdfText: string;
    try {
      pdfText = await extractTextFromPDF(buffer);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Erreur lors de l\'extraction du texte' },
        { status: 422 }
      );
    }

    // Extract title from PDF text or filename
    const title = extractTitle(pdfText, file.name);

    // Analyze with AI
    let decisionSheet;
    try {
      decisionSheet = await analyzeGrant(pdfText);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'analyse';

      // Check for rate limiting
      if (errorMessage.includes('Limite de requêtes')) {
        return NextResponse.json(
          { error: errorMessage },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Create analysis object
    const analysis: GrantAnalysis = {
      id: uuidv4(),
      title,
      uploadDate: new Date().toISOString(),
      pdfText,
      decisionSheet,
      recommendation: decisionSheet.finalRecommendation.decision,
    };

    // Save to storage
    try {
      await saveAnalysis(analysis);
    } catch (error) {
      console.error('Storage error:', error);
      // Continue even if storage fails - return the analysis anyway
      // This allows the app to work even without KV configured
      return NextResponse.json(analysis);
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erreur inattendue lors du traitement' },
      { status: 500 }
    );
  }
}

/**
 * Extracts a title from PDF text or falls back to filename
 * @param pdfText - The extracted PDF text
 * @param filename - The original filename
 * @returns A clean title for the grant
 */
function extractTitle(pdfText: string, filename: string): string {
  // Try to extract the first meaningful line from the PDF
  const lines = pdfText.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

  if (lines.length > 0) {
    // Get first line, limit to 100 characters
    const firstLine = lines[0].substring(0, 100);
    if (firstLine.length > 10) {
      return firstLine;
    }
  }

  // Fallback to filename without extension
  return filename.replace('.pdf', '').replace(/[_-]/g, ' ');
}
