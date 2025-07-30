export interface EvaluationResult {
  category: string;
  content: string;
  key?: string;
}

export interface EvaluationResults {
  title?: string;
  impactfulStatement?: string;
  scorecard?: string;
  talkListenRatio?: string;
  applicationInvitation?: string;
  growthPlan?: string;
  coachingNotes?: string;
  enrollmentLikelihood?: string;
  emailBlast?: string;
}

export interface PDFGenerationRequest {
  results: EvaluationResult[];
  transcript: string;
}