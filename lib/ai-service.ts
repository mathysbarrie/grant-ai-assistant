import Groq from 'groq-sdk';
import { DecisionSheet } from './types';

// Lazy initialization of Groq client to avoid build-time errors
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
}

const SYSTEM_PROMPT = `Tu es un expert senior en financements publics français pour collectivités territoriales.
Ta mission est d'aider un chargé de mission à décider rapidement si un appel à projets mérite d'être poursuivi.

Analyse le document fourni et produis une fiche décisionnelle structurée en JSON avec EXACTEMENT les champs suivants :

{
  "executiveSummary": "Résumé en 10 lignes maximum",
  "eligibility": {
    "verdict": "YES" | "NO" | "UNCERTAIN",
    "justification": "Justification détaillée de l'éligibilité"
  },
  "financialTerms": "Montants, taux de subvention et contraintes financières",
  "deadlinesWorkload": {
    "deadline": "Date limite de dépôt",
    "projectPeriod": "Période du projet",
    "complexity": "Low" | "Medium" | "Heavy",
    "estimatedHours": nombre d'heures estimées (optionnel)
  },
  "blockersRisks": "Points bloquants, risques ou ambiguïtés",
  "finalRecommendation": {
    "decision": "worth-pursuing" | "needs-verification" | "skip",
    "reasons": ["raison 1", "raison 2", "raison 3"]
  }
}

N'invente AUCUNE information.
Si une donnée est absente ou floue, indique-le explicitement dans le texte.
Utilise un ton administratif clair et professionnel.
Réponds UNIQUEMENT avec ce JSON, sans markdown ni texte supplémentaire.

Contexte: Commune de 100 000 habitants.`;

/**
 * Analyzes grant text and returns a structured decision sheet
 * @param pdfText - The extracted text from the PDF
 * @returns Promise<DecisionSheet> - The structured analysis
 * @throws Error if AI analysis fails or rate limit is exceeded
 */
export async function analyzeGrant(pdfText: string): Promise<DecisionSheet> {
  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Voici le texte de l'appel à projets à analyser :\n\n${pdfText}`,
        },
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('Aucune réponse reçue de l\'IA');
    }

    // Parse JSON response
    const parsedResponse = JSON.parse(responseContent);

    // Validate structure
    validateDecisionSheet(parsedResponse);

    return parsedResponse as DecisionSheet;
  } catch (error) {
    if (error instanceof Error) {
      // Handle Groq rate limiting
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        throw new Error('Limite de requêtes atteinte. Veuillez réessayer dans 1 minute.');
      }

      // Handle JSON parsing errors
      if (error.message.includes('JSON')) {
        throw new Error('L\'IA a renvoyé une réponse mal formatée. Veuillez réessayer.');
      }

      throw new Error(`Erreur d'analyse IA: ${error.message}`);
    }

    throw new Error('Erreur inconnue lors de l\'analyse IA.');
  }
}

/**
 * Validates that the AI response has the correct structure
 * @param data - The parsed JSON data
 * @throws Error if structure is invalid
 */
function validateDecisionSheet(data: any): void {
  const requiredFields = [
    'executiveSummary',
    'eligibility',
    'financialTerms',
    'deadlinesWorkload',
    'blockersRisks',
    'finalRecommendation',
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Champ manquant dans la réponse IA: ${field}`);
    }
  }

  // Validate nested structures
  if (!data.eligibility.verdict || !data.eligibility.justification) {
    throw new Error('Structure d\'éligibilité invalide');
  }

  if (!data.deadlinesWorkload.complexity || !data.deadlinesWorkload.deadline) {
    throw new Error('Structure de délais/charge invalide');
  }

  if (!data.finalRecommendation.decision || !Array.isArray(data.finalRecommendation.reasons)) {
    throw new Error('Structure de recommandation invalide');
  }
}
