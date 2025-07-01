import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { CircuitBreaker } from './circuit-breaker.utils';
import { createLogger } from './logger.utils';

export interface ServiceCallOptions {
  timeout?: number;
  retries?: number;
  circuitBreaker?: boolean;
}

export class HttpServiceClient {
  private readonly logger = createLogger('HttpServiceClient');
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor(
    private readonly httpService: HttpService,
    private readonly baseUrl: string,
    private readonly serviceName: string
  ) { }

  async get<T = any>(
    path: string,
    options: ServiceCallOptions = {},
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>('get', path, undefined, options, config);
  }

  async post<T = any>(
    path: string,
    data: any,
    options: ServiceCallOptions = {},
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>('post', path, data, options, config);
  }

  private async request<T = any>(
    method: 'get' | 'post',
    path: string,
    data: any,
    options: ServiceCallOptions = {},
    config?: AxiosRequestConfig
  ): Promise<T> {
    const {
      timeout: timeoutMs = 5000,
      retries = 2,
      circuitBreaker: useCircuitBreaker = true
    } = options;
    const url = `${this.baseUrl}${path}`;
    const circuitBreakerKey = `${this.serviceName}:${method}:${path}`;
    if (!this.circuitBreakers.has(circuitBreakerKey)) {
      this.circuitBreakers.set(circuitBreakerKey, new CircuitBreaker(circuitBreakerKey));
    }
    const circuitBreaker = this.circuitBreakers.get(circuitBreakerKey)!;
    const operation = async (): Promise<T> => {
      let lastError: Error;
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          this.logger.info(`HTTP ${method.toUpperCase()} ${url} (attempt ${attempt}/${retries})`);
          let response: AxiosResponse<T>;
          if (method === 'get') {
            response = await firstValueFrom(
              this.httpService.get<T>(url, { ...config, timeout: timeoutMs })
            );
          } else {
            response = await firstValueFrom(
              this.httpService.post<T>(url, data, { ...config, timeout: timeoutMs })
            );
          }
          return response.data;
        } catch (error) {
          lastError = error as Error;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.warn(`Attempt ${attempt} failed for ${method.toUpperCase()} ${url}: ${errorMessage}`);
          if (attempt < retries) {
            await this.delay(1000 * attempt);
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
} 