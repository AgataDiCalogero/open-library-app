export interface SubjectWorkAuthorDto {
  name: string;
}

export interface SubjectWorkDto {
  key: string;
  title: string;
  authors: SubjectWorkAuthorDto[];
  cover_id: number;
}

export interface SubjectResponseDto {
  works: SubjectWorkDto[];
}
