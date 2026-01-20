import { kv } from '@vercel/kv';
import { GrantAnalysis } from './types';

/**
 * Saves a grant analysis to Vercel KV storage
 * @param analysis - The complete grant analysis object
 */
export async function saveAnalysis(analysis: GrantAnalysis): Promise<void> {
  try {
    const key = `grant:analysis:${analysis.id}`;
    await kv.set(key, analysis);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erreur de sauvegarde: ${error.message}`);
    }
    throw new Error('Erreur inconnue lors de la sauvegarde.');
  }
}

/**
 * Retrieves a grant analysis by ID
 * @param id - The analysis ID
 * @returns The grant analysis or null if not found
 */
export async function getAnalysis(id: string): Promise<GrantAnalysis | null> {
  try {
    const key = `grant:analysis:${id}`;
    const analysis = await kv.get<GrantAnalysis>(key);
    return analysis;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erreur de récupération: ${error.message}`);
    }
    throw new Error('Erreur inconnue lors de la récupération.');
  }
}

/**
 * Retrieves all grant analyses, sorted by date (newest first)
 * @returns Array of all grant analyses
 */
export async function getAllAnalyses(): Promise<GrantAnalysis[]> {
  try {
    // Scan for all keys matching the pattern
    const keys: string[] = [];
    let cursor: string | number = 0;

    do {
      const result = await kv.scan(cursor, {
        match: 'grant:analysis:*',
        count: 100,
      });
      const [newCursor, scanKeys] = result as [string | number, string[]];
      cursor = newCursor;
      keys.push(...scanKeys);
    } while (cursor !== 0 && cursor !== '0');

    // Fetch all analyses
    if (keys.length === 0) {
      return [];
    }

    const analyses: GrantAnalysis[] = [];
    for (const key of keys) {
      const analysis = await kv.get<GrantAnalysis>(key);
      if (analysis) {
        analyses.push(analysis);
      }
    }

    // Sort by upload date (newest first)
    analyses.sort((a, b) => {
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    });

    return analyses;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erreur de récupération de l'historique: ${error.message}`);
    }
    throw new Error('Erreur inconnue lors de la récupération de l\'historique.');
  }
}

/**
 * Deletes a grant analysis by ID
 * @param id - The analysis ID to delete
 */
export async function deleteAnalysis(id: string): Promise<void> {
  try {
    const key = `grant:analysis:${id}`;
    await kv.del(key);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erreur de suppression: ${error.message}`);
    }
    throw new Error('Erreur inconnue lors de la suppression.');
  }
}

/**
 * Updates the personal notes for a grant analysis
 * @param id - The analysis ID
 * @param notes - The new personal notes
 */
export async function updateAnalysisNotes(id: string, notes: string): Promise<void> {
  try {
    const analysis = await getAnalysis(id);
    if (!analysis) {
      throw new Error('Analyse non trouvée');
    }

    analysis.personalNotes = notes;
    await saveAnalysis(analysis);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erreur de mise à jour des notes: ${error.message}`);
    }
    throw new Error('Erreur inconnue lors de la mise à jour des notes.');
  }
}
