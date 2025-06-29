import { CircuitBreakerState } from '../interfaces/service-discovery.interface';

export class CircuitBreaker {
  private state: CircuitBreakerState;
  private readonly name: string;

  constructor(
    name: string,
    threshold  = 5,
    timeout = 60000 // 60 seconds
  ) {
    this.name = name;
    this.state = {
      status: 'CLOSED',
      failureCount: 0,
      successCount: 0,
      threshold,
      timeout,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.status === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state.status = 'HALF_OPEN';
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.state.failureCount = 0;
    this.state.successCount++;

    if (this.state.status === 'HALF_OPEN') {
      this.state.status = 'CLOSED';
    }
  }

  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = new Date();
    this.state.successCount = 0;

    if (this.state.failureCount >= this.state.threshold) {
      this.state.status = 'OPEN';
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.state.lastFailureTime) return false;

    const now = new Date();
    const timeSinceLastFailure = now.getTime() - this.state.lastFailureTime.getTime();

    return timeSinceLastFailure >= this.state.timeout;
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      status: 'CLOSED',
      failureCount: 0,
      successCount: 0,
      threshold: this.state.threshold,
      timeout: this.state.timeout,
    };
  }
} 