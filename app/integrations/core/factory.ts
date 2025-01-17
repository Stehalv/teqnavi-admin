import type { IntegrationConfig, IntegrationProvider } from './types.js';
import { ExigoClient } from '../providers/exigo/client.js';
import type { ExigoConfig } from '../providers/exigo/types.js';

export class IntegrationFactory {
  static createProvider(config: IntegrationConfig): IntegrationProvider {
    switch (config.provider.toLowerCase()) {
      case 'exigo':
        return new ExigoClient(config as ExigoConfig);
      // Add other providers here as they are implemented
      default:
        throw new Error(`Provider ${config.provider} not implemented`);
    }
  }
} 