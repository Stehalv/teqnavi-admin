import type { IntegrationConfig, IntegrationError, IntegrationProvider, SyncResult } from './types.js';

export interface SyncData {
  type: 'customer' | 'order' | 'product';
  data: Record<string, unknown>;
}

export abstract class BaseIntegrationClient implements IntegrationProvider {
  abstract name: string;
  protected config: IntegrationConfig;

  constructor(config: IntegrationConfig) {
    this.config = config;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract sync(data: SyncData): Promise<SyncResult>;
  abstract validateConfig(config: IntegrationConfig): Promise<boolean>;

  protected createError(
    message: string,
    code: string,
    originalError?: Error
  ): IntegrationError {
    return {
      provider: this.name,
      name: this.name,
      message,
      code,
      originalError,
      timestamp: new Date()
    };
  }
} 