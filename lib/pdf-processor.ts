/**
 * Extracts text content from a PDF buffer
 * @param buffer - The PDF file as a Buffer
 * @returns Promise<string> - The extracted text
 * @throws Error if PDF parsing fails
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Import canvas to provide DOM APIs for pdf-parse
    await import('canvas');

    // Dynamic import with type assertion for CommonJS module
    const pdfParse = (await import('pdf-parse')) as any;
    const parseFn = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
    const data = await parseFn(buffer);

    // Return cleaned text
    return data.text.trim();
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('encrypted')) {
        throw new Error('Le PDF est protégé par mot de passe. Veuillez fournir un PDF non chiffré.');
      }
      if (error.message.includes('Invalid PDF')) {
        throw new Error('Le fichier fourni n\'est pas un PDF valide.');
      }
      throw new Error(`Erreur lors de l'analyse du PDF: ${error.message}`);
    }

    throw new Error('Erreur inconnue lors de l\'analyse du PDF.');
  }
}
