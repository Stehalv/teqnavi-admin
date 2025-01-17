import type { IntegrationConfig, IntegrationProvider } from './types.js';
import { IntegrationFactory } from './factory.js';

class IntegrationRegistry {
  private providers: Map<string, typeof IntegrationFactory> = new Map();

  registerProvider(name: string) {
    this.providers.set(name.toLowerCase(), IntegrationFactory);
  }

  getProvider(name: string) {
    return this.providers.get(name.toLowerCase());
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  async createInstance(config: IntegrationConfig): Promise<IntegrationProvider> {
    const factory = this.getProvider(config.provider);
    if (!factory) {
      throw new Error(`Provider ${config.provider} not found`);
    }
    return factory.createProvider(config);
  }
}

export const integrationRegistry = new IntegrationRegistry();

// Register available providers
integrationRegistry.registerProvider('exigo');
integrationRegistry.registerProvider('klaviyo');
integrationRegistry.registerProvider('tripletex'); 