import { NextRequest, NextResponse } from 'next/server';
import { getAnalysis, updateAnalysisNotes } from '@/lib/storage';

/**
 * GET /api/history/[id]
 * Returns a single grant analysis by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const analysis = await getAnalysis(id);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analyse non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/history/[id]
 * Updates personal notes for a grant analysis
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { personalNotes } = body;

    if (personalNotes === undefined) {
      return NextResponse.json(
        { error: 'personalNotes manquant dans le body' },
        { status: 400 }
      );
    }

    const { id } = await params;
    await updateAnalysisNotes(id, personalNotes);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
