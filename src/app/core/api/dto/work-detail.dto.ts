export interface WorkDetailDescriptionDto {
  value: string;
}

export interface WorkDetailDto {
  title: string;
  description?: string | WorkDetailDescriptionDto;
}
