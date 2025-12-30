export interface SubjectWorkAuthorDto {
  name: string;
}

export interface SubjectWorkDto {
  key: string;
  title: string;
  authors: SubjectWorkAuthorDto[];
}

export interface SubjectResponseDto {
  works: SubjectWorkDto[];
}
