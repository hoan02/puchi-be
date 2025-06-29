import { ClientKafka } from '@nestjs/microservices/client';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { CircuitBreaker } from './circuit-breaker.utils';
import { createLogger } from './logger.utils';

export interface ServiceCallOptions {
  timeout?: number;
  retries?: number;
  circuitBreaker?: boolean;
}

export class ServiceClient {
  private readonly logger = createLogger('ServiceClient');
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor(
    private readonly client: ClientKafka,
    private readonly serviceName: string
  ) { }

  async emit<T = any>(
    pattern: string,
    data: any,
    options: ServiceCallOptions = {}
  ): Promise<T> {
    const {
      timeout: timeoutMs = 5000,
      retries = 3,
      circuitBreaker: useCircuitBreaker = true
    } = options;

    const circuitBreakerKey = `${this.serviceName}:${pattern}`;

    if (!this.circuitBreakers.has(circuitBreakerKey)) {
      this.circuitBreakers.set(circuitBreakerKey, new CircuitBreaker(circuitBreakerKey));
    }

    const circuitBreaker = this.circuitBreakers.get(circuitBreakerKey)!;

    const operation = async (): Promise<T> => {
      let lastError: Error;

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          this.logger.info(`Calling ${pattern} on ${this.serviceName} (attempt ${attempt}/${retries})`);

          const result = await firstValueFrom(
            this.client.emit(pattern, data).pipe(
              timeout(timeoutMs),
              catchError((error) => {
                this.logger.error(`Error calling ${pattern}: ${error.message}`);
                return of({ error: error.message });
              })
            )
          );

          if (result && 'error' in result) {
            throw new Error(result.error);
          }

          return result as T;
        } catch (error) {
          lastError = error as Error;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.warn(`Attempt ${attempt} failed for ${pattern}: ${errorMessage}`);

          if (attempt < retries) {
            await this.delay(1000 * attempt); // Exponential backoff
          }
        }
      }

      throw lastError!;
    };

    if (useCircuitBreaker) {
      return circuitBreaker.execute(operation);
    }

    return operation();
  }

  async send<T = any>(
    pattern: string,
    data: any,
    options: ServiceCallOptions = {}
  ): Promise<T> {
    const {
      timeout: timeoutMs = 5000,
      retries = 3,
      circuitBreaker: useCircuitBreaker = true
    } = options;

    const circuitBreakerKey = `${this.serviceName}:${pattern}`;

    if (!this.circuitBreakers.has(circuitBreakerKey)) {
      this.circuitBreakers.set(circuitBreakerKey, new CircuitBreaker(circuitBreakerKey));
    }

    const circuitBreaker = this.circuitBreakers.get(circuitBreakerKey)!;

    const operation = async (): Promise<T> => {
      let lastError: Error;

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          this.logger.info(`Sending ${pattern} to ${this.serviceName} (attempt ${attempt}/${retries})`);

          const result = await firstValueFrom(
            this.client.send(pattern, data).pipe(
              timeout(timeoutMs),
              catchError((error) => {
                this.logger.error(`Error sending ${pattern}: ${error.message}`);
                return of({ error: error.message });
              })
            )
          );

          if (result && 'error' in result) {
            throw new Error(result.error);
          }

          return result as T;
        } catch (error) {
          lastError = error as Error;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.warn(`Attempt ${attempt} failed for ${pattern}: ${errorMessage}`);

          if (attempt < retries) {
            await this.delay(1000 * attempt); // Exponential backoff
          }
        }
      }

      throw lastError!;
    };

    if (useCircuitBreaker) {
      return circuitBreaker.execute(operation);
    }

    return operation();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getKafkaClient(): ClientKafka {
    return this.client;
  }

  getCircuitBreakerState(pattern: string): any {
    const circuitBreakerKey = `${this.serviceName}:${pattern}`;
    const circuitBreaker = this.circuitBreakers.get(circuitBreakerKey);
    return circuitBreaker ? circuitBreaker.getState() : null;
  }

  resetCircuitBreaker(pattern: string): void {
    const circuitBreakerKey = `${this.serviceName}:${pattern}`;
    const circuitBreaker = this.circuitBreakers.get(circuitBreakerKey);
    if (circuitBreaker) {
      circuitBreaker.reset();
    }
  }
} 