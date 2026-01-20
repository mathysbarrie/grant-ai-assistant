import { NextRequest, NextResponse } from 'next/server';
import { getAllAnalyses, deleteAnalysis } from '@/lib/storage';

/**
 * GET /api/history
 * Returns all grant analyses sorted by date (newest first)
 */
export async function GET() {
  try {
    const analyses = await getAllAnalyses();
    return NextResponse.json(analyses);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/history?id=xxx
 * Deletes a grant analysis by ID
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID manquant' },
        { status: 400 }
      );
    }

    await deleteAnalysis(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
