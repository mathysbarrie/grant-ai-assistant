import { GrantAnalysis, DecisionSheet } from './types';

/**
 * Exports a grant analysis to PDF using the browser's print functionality
 * @param analysis - The grant analysis to export
 */
export function exportToPDF(analysis: GrantAnalysis): void {
  // Create a new window with the decision sheet content
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez que les popups sont autorisées.');
    return;
  }

  const { decisionSheet, title, uploadDate } = analysis;

  // Build HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #1a1a1a;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 10px;
        }
        h2 {
          color: #2563eb;
          margin-top: 30px;
          border-left: 4px solid #2563eb;
          padding-left: 10px;
        }
        .badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: bold;
          margin: 10px 0;
        }
        .badge-green { background-color: #dcfce7; color: #166534; }
        .badge-yellow { background-color: #fef3c7; color: #854d0e; }
        .badge-red { background-color: #fee2e2; color: #991b1b; }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .meta {
          color: #666;
          font-size: 14px;
          margin-bottom: 20px;
        }
        ul {
          margin: 10px 0;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="meta">Analysé le ${new Date(uploadDate).toLocaleDateString('fr-FR')}</p>

      <div class="section">
        <h2>1. Résumé exécutif</h2>
        <p>${decisionSheet.executiveSummary.replace(/\n/g, '<br>')}</p>
      </div>

      <div class="section">
        <h2>2. Éligibilité</h2>
        <span class="badge badge-${getBadgeColor(decisionSheet.eligibility.verdict)}">
          ${getVerdictLabel(decisionSheet.eligibility.verdict)}
        </span>
        <p>${decisionSheet.eligibility.justification.replace(/\n/g, '<br>')}</p>
      </div>

      <div class="section">
        <h2>3. Termes financiers</h2>
        <p>${decisionSheet.financialTerms.replace(/\n/g, '<br>')}</p>
      </div>

      <div class="section">
        <h2>4. Délais & Charge de travail</h2>
        <p><strong>Deadline:</strong> ${decisionSheet.deadlinesWorkload.deadline}</p>
        <p><strong>Période du projet:</strong> ${decisionSheet.deadlinesWorkload.projectPeriod}</p>
        <p><strong>Complexité:</strong>
          <span class="badge badge-${getBadgeColor(decisionSheet.deadlinesWorkload.complexity)}">
            ${decisionSheet.deadlinesWorkload.complexity}
          </span>
        </p>
        ${decisionSheet.deadlinesWorkload.estimatedHours
          ? `<p><strong>Heures estimées:</strong> ${decisionSheet.deadlinesWorkload.estimatedHours}h</p>`
          : ''}
      </div>

      <div class="section">
        <h2>5. Points bloquants & Risques</h2>
        <p>${decisionSheet.blockersRisks.replace(/\n/g, '<br>')}</p>
      </div>

      <div class="section">
        <h2>6. Recommandation finale</h2>
        <span class="badge badge-${getBadgeColor(decisionSheet.finalRecommendation.decision)}">
          ${getRecommendationLabel(decisionSheet.finalRecommendation.decision)}
        </span>
        <p><strong>Raisons:</strong></p>
        <ul>
          ${decisionSheet.finalRecommendation.reasons.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      ${analysis.personalNotes
        ? `<div class="section">
            <h2>Notes personnelles</h2>
            <p>${analysis.personalNotes.replace(/\n/g, '<br>')}</p>
           </div>`
        : ''}

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Copies the decision sheet to clipboard as formatted text
 * @param decisionSheet - The decision sheet to copy
 */
export function copyToClipboard(decisionSheet: DecisionSheet): void {
  const text = `
RÉSUMÉ EXÉCUTIF
${decisionSheet.executiveSummary}

ÉLIGIBILITÉ: ${decisionSheet.eligibility.verdict}
${decisionSheet.eligibility.justification}

TERMES FINANCIERS
${decisionSheet.financialTerms}

DÉLAIS & CHARGE DE TRAVAIL
Deadline: ${decisionSheet.deadlinesWorkload.deadline}
Période: ${decisionSheet.deadlinesWorkload.projectPeriod}
Complexité: ${decisionSheet.deadlinesWorkload.complexity}
${decisionSheet.deadlinesWorkload.estimatedHours ? `Heures estimées: ${decisionSheet.deadlinesWorkload.estimatedHours}h` : ''}

POINTS BLOQUANTS & RISQUES
${decisionSheet.blockersRisks}

RECOMMANDATION FINALE: ${getRecommendationLabel(decisionSheet.finalRecommendation.decision)}
Raisons:
${decisionSheet.finalRecommendation.reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}
  `.trim();

  navigator.clipboard.writeText(text).then(
    () => {
      alert('✅ Copié dans le presse-papiers !');
    },
    () => {
      alert('❌ Erreur lors de la copie. Veuillez réessayer.');
    }
  );
}

// Helper functions
function getBadgeColor(value: string): string {
  const greenValues = ['YES', 'Low', 'worth-pursuing'];
  const yellowValues = ['UNCERTAIN', 'Medium', 'needs-verification'];
  const redValues = ['NO', 'Heavy', 'skip'];

  if (greenValues.includes(value)) return 'green';
  if (yellowValues.includes(value)) return 'yellow';
  if (redValues.includes(value)) return 'red';
  return 'yellow';
}

function getVerdictLabel(verdict: string): string {
  switch (verdict) {
    case 'YES': return '✅ OUI';
    case 'NO': return '❌ NON';
    case 'UNCERTAIN': return '⚠️ INCERTAIN';
    default: return verdict;
  }
}

function getRecommendationLabel(decision: string): string {
  switch (decision) {
    case 'worth-pursuing': return '✅ À creuser';
    case 'needs-verification': return '⚠️ À vérifier';
    case 'skip': return '❌ À ignorer';
    default: return decision;
  }
}
