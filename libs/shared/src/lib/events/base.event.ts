export abstract class BaseEvent {
  public readonly timestamp: Date = new Date();
  public readonly eventId: string = crypto.randomUUID();

  abstract getEventName(): string;

  toString() {
    return JSON.stringify({
      eventId: this.eventId,
      timestamp: this.timestamp.toISOString(),
      eventName: this.getEventName(),
      ...this.getEventData(),
    });
  }

  static fromString(this: any, data: string): BaseEvent {
    const parsed = JSON.parse(data);
    return this.fromData(parsed);
  }

  protected static fromData(data: any): any {
    throw new Error('fromData method must be implemented in child class');
  }

  protected abstract getEventData(): Record<string, any>;
} 