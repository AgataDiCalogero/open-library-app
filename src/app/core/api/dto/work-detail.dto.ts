export interface WorkDetailDescriptionDto {
  type?: string;
  value: string;
}

export interface WorkDetailDto {
  key: string;
  title: string;
  covers?: number[];
  description?: string | WorkDetailDescriptionDto;
}
