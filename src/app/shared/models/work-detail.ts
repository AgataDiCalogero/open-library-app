export interface WorkDetail {
  id: string;
  title: string;
  description: string;
  coverId?: number;
  publishYear?: number;
  languages?: string[];
  subjects?: string[];
  pages?: number;
  openLibraryUrl: string;
}
