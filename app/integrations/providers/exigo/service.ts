import type { ExigoConfig } from './types.js';
import type { SyncConfig } from '../../core/types.js';
import { ExigoClient } from './client.js';
import { ExigoSyncHandlers } from './sync-handlers.js';
import { MappingEngine } from '../../core/mapping-engine.js';

export class ExigoService {
  private client: ExigoClient;
  private handlers: ExigoSyncHandlers;
  private mappingEngine: MappingEngine;

  constructor(config: ExigoConfig, syncConfig: SyncConfig) {
    this.client = new ExigoClient(config);
    this.mappingEngine = new MappingEngine(syncConfig);
    this.handlers = new ExigoSyncHandlers(this.client, this.mappingEngine);
  }

  // Webhook endpoints
  async handleShopifyWebhook(topic: string, payload: any): Promise<void> {
    switch (topic) {
      case 'orders/create':
        await this.handlers.handleOrderCreated(payload);
        break;
      case 'customers/update':
        await this.handlers.handleCustomerUpdated(payload);
        break;
      default:
        throw new Error(`Unsupported webhook topic: ${topic}`);
    }
  }

  // Scheduled jobs
  async runInventorySync(): Promise<void> {
    await this.handlers.syncInventory();
  }

  async runFullSync(): Promise<void> {
    await this.handlers.fullSync();
  }

  // Connection management
  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  // Configuration management
  updateSyncConfig(syncConfig: SyncConfig): void {
    this.mappingEngine = new MappingEngine(syncConfig);
    this.handlers = new ExigoSyncHandlers(this.client, this.mappingEngine);
  }
} 