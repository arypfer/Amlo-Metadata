export interface ShutterstockMetadata {
  title: string;
  description: string;
  keywords: string[];
}

export interface AnalysisItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'analyzing' | 'success' | 'error';
  data: ShutterstockMetadata | null;
  error: string | null;
  timestamp?: number; // Added for history
}

export interface AppSettings {
  customInstructions: string;
  imgQuality: 'balanced' | 'high';
  csvHeader: boolean;
}
