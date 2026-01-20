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
}
