export interface WorkDetailDescriptionDto {
  type?: string;
  value: string;
}

export interface WorkDetailLanguageDto {
  key: string;
}

export interface WorkDetailCreatedDto {
  value: string;
}

export interface WorkDetailTypeDto {
  key?: string;
}

export interface WorkDetailDto {
  key: string;
  title: string;
  covers?: number[];
  description?: string | WorkDetailDescriptionDto;
  first_publish_date?: string;
  created?: WorkDetailCreatedDto;
  type?: WorkDetailTypeDto;
  languages?: WorkDetailLanguageDto[];
  subjects?: string[];
  number_of_pages?: number;
  pages?: number;
}
