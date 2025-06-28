export interface CreateLessonEvent {
  lesson: {
    title: string;
    description?: string;
    durationMinutes: number;
  };
  user: {
    id: string;
    email: string;
  };
}

export interface GetLessonsEvent {
  page: number;
  limit: number;
  userId: string;
}

export interface GetLessonByIdEvent {
  id: string;
  userId: string;
}

export interface GetUserProgressEvent {
  userId: string;
} 