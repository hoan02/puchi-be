import { BaseEvent } from './base.event';

// ===================== USER EVENTS =====================
// Các event này chỉ dùng cho event bất đồng bộ (Kafka)
// Nếu service không dùng event qua Kafka thì không cần import file này

export class UserRegisteredEvent extends BaseEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
  ) {
    super();
  }

  override getEventName(): string {
    return 'user-registered';
  }

  protected override getEventData(): Record<string, any> {
    return {
      userId: this.userId,
      email: this.email,
      name: this.name,
    };
  }

  protected static override fromData(data: any): UserRegisteredEvent {
    return new UserRegisteredEvent(
      data.userId,
      data.email,
      data.name,
    );
  }
}

export class UserProfileUpdatedEvent extends BaseEvent {
  constructor(
    public readonly userId: string,
    public readonly updates: {
      name?: string;
      email?: string;
      avatar?: string;
    },
  ) {
    super();
  }

  override getEventName(): string {
    return 'user-profile-updated';
  }

  protected override getEventData(): Record<string, any> {
    return {
      userId: this.userId,
      updates: this.updates,
    };
  }

  protected static override fromData(data: any): UserProfileUpdatedEvent {
    return new UserProfileUpdatedEvent(
      data.userId,
      data.updates,
    );
  }
} 