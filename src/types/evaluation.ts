export interface EvaluationResult {
  category: string;
  content: string;
  key?: string;
}

export interface PDFGenerationRequest {
  results: EvaluationResult[];
  transcript: string;
}