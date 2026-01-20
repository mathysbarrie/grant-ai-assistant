export interface GrantAnalysis {
  id: string;
  title: string;
  uploadDate: string;
  pdfText: string;
  decisionSheet: DecisionSheet;
  recommendation: 'worth-pursuing' | 'needs-verification' | 'skip';
  personalNotes?: string;
}

export interface DecisionSheet {
  executiveSummary: string;
  eligibility: EligibilitySection;
  financialTerms: string;
  deadlinesWorkload: WorkloadSection;
  blockersRisks: string;
  finalRecommendation: RecommendationSection;
}

export interface EligibilitySection {
  verdict: 'YES' | 'NO' | 'UNCERTAIN';
  justification: string;
}

export interface WorkloadSection {
  deadline: string;
  projectPeriod: string;
  complexity: 'Low' | 'Medium' | 'Heavy';
  estimatedHours?: number;
}

export interface RecommendationSection {
  decision: 'worth-pursuing' | 'needs-verification' | 'skip';
  reasons: string[];
}
