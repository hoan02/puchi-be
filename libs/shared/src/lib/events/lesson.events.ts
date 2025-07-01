import { BaseEvent } from './base.event';

// ===================== LESSON EVENTS =====================
// Các event này chỉ dùng cho event bất đồng bộ (Kafka)
// Nếu service không dùng event qua Kafka thì không cần import file này

export interface CreateLessonData {
  title: string;
  description?: string;
  durationMinutes: number;
}

export interface UserData {
  id: string;
  email: string;
}

export class LessonCreatedEvent extends BaseEvent {
  constructor(
    public readonly lessonId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly durationMinutes: number,
    public readonly createdBy: string,
  ) {
    super();
  }

  override getEventName(): string {
    return 'lesson-created';
  }

  protected override getEventData(): Record<string, any> {
    return {
      lessonId: this.lessonId,
      title: this.title,
      description: this.description,
      durationMinutes: this.durationMinutes,
      createdBy: this.createdBy,
    };
  }

  protected static override fromData(data: any): LessonCreatedEvent {
    return new LessonCreatedEvent(
      data.lessonId,
      data.title,
      data.description,
      data.durationMinutes,
      data.createdBy,
    );
  }
}

export class LessonCompletedEvent extends BaseEvent {
  constructor(
    public readonly lessonId: string,
    public readonly userId: string,
    public readonly score: number,
    public readonly completedAt: Date,
  ) {
    super();
  }

  override getEventName(): string {
    return 'lesson-completed';
  }

  protected override getEventData(): Record<string, any> {
    return {
      lessonId: this.lessonId,
      userId: this.userId,
      score: this.score,
      completedAt: this.completedAt.toISOString(),
    };
  }

  protected static override fromData(data: any): LessonCompletedEvent {
    return new LessonCompletedEvent(
      data.lessonId,
      data.userId,
      data.score,
      new Date(data.completedAt),
    );
  }
}

export class LessonProgressUpdatedEvent extends BaseEvent {
  constructor(
    public readonly lessonId: string,
    public readonly userId: string,
    public readonly progress: number, // 0-100
    public readonly updatedAt: Date,
  ) {
    super();
  }

  override getEventName(): string {
    return 'lesson-progress-updated';
  }

  protected override getEventData(): Record<string, any> {
    return {
      lessonId: this.lessonId,
      userId: this.userId,
      progress: this.progress,
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  protected static override fromData(data: any): LessonProgressUpdatedEvent {
    return new LessonProgressUpdatedEvent(
      data.lessonId,
      data.userId,
      data.progress,
      new Date(data.updatedAt),
    );
  }
}
