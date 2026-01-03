export interface WorkEditionLanguageDto {
  key: string;
}

export interface WorkEditionDto {
  languages?: WorkEditionLanguageDto[];
  number_of_pages?: number;
  pagination?: string;
  publish_date?: string;
}

export interface WorkEditionsResponseDto {
  entries: WorkEditionDto[];
}
