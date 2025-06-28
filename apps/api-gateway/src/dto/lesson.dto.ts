import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateLessonRequestDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  durationMinutes!: number;
}

export class LessonResponseDto {
  id!: string;
  title!: string;
  description?: string;
  durationMinutes!: number;
  createdAt!: string;
  updatedAt!: string;
}

export class LessonsListResponseDto {
  lessons!: LessonResponseDto[];
  pagination!: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class ApiResponseDto<T> {
  data!: T;
  timestamp!: string;
  message?: string;
} 