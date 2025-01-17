import type { ExigoClient } from './client.js';
import type { ExigoCustomer, ExigoOrder } from './types.js';
import type { SyncAction } from '../../core/types.js';
import { MappingEngine } from '../../core/mapping-engine.js';

interface ShopifyOrder {
  id: string;
  customer?: ShopifyCustomer;
  line_items: Array<{
    id: string;
    product_id: string;
    variant_id: string;
    quantity: number;
    price: string;
  }>;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

interface ShopifyCustomer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

interface SyncContext {
  customerId?: number;
  orderId?: number;
  type: 'customer' | 'order' | 'inventory' | 'full';
  [key: string]: unknown;
}

export class ExigoSyncHandlers {
  private mappingEngine: MappingEngine;

  constructor(
    private client: ExigoClient,
    mappingEngine: MappingEngine
  ) {
    this.mappingEngine = mappingEngine;
  }

  async handleOrderCreated(shopifyOrder: ShopifyOrder): Promise<void> {
    try {
      // Apply field mappings
      const mappedOrder = await this.mappingEngine.applyMappings(shopifyOrder, 'orders');
      
      // Create base order
      const exigoOrder: Partial<ExigoOrder> = {
        ...mappedOrder,
        orderDate: new Date(),
        details: [] // Will be populated based on line items
      };

      // Evaluate rules and execute actions
      const actions = await this.mappingEngine.evaluateRules(shopifyOrder, {
        mappedOrder: exigoOrder,
        client: this.client,
        type: 'order'
      });

      // Process any additional actions (e.g., updating customer based on order)
      await this.processActions(actions, { 
        type: 'order',
        orderId: exigoOrder.orderId,
        customerId: exigoOrder.customerId
      });

      // Finally create the order
      await this.client.createOrder(exigoOrder);
    } catch (error) {
      throw this.client.createSyncError('Failed to sync order to Exigo', 'ORDER_SYNC_ERROR', error);
    }
  }

  async handleCustomerUpdated(shopifyCustomer: ShopifyCustomer): Promise<void> {
    try {
      // Apply field mappings
      const mappedCustomer = await this.mappingEngine.applyMappings(shopifyCustomer, 'customers');
      
      // Create base customer
      const exigoCustomer: Partial<ExigoCustomer> = {
        ...mappedCustomer,
        customerType: 1, // Default type, can be overridden by mappings
        customerStatus: 1 // Active, can be overridden by mappings
      };

      // Evaluate rules and execute actions
      const actions = await this.mappingEngine.evaluateRules(shopifyCustomer, {
        mappedCustomer: exigoCustomer,
        client: this.client,
        type: 'customer'
      });

      // Process any additional actions
      await this.processActions(actions, { 
        type: 'customer',
        customerId: exigoCustomer.customerId
      });

      // Finally update the customer
      await this.client.updateCustomer(exigoCustomer);
    } catch (error) {
      throw this.client.createSyncError('Failed to sync customer to Exigo', 'CUSTOMER_SYNC_ERROR', error);
    }
  }

  async syncInventory(): Promise<void> {
    try {
      // Fetch latest inventory from Exigo
      const inventory = await this.client.getInventory();
      
      // Apply mappings and rules for inventory sync
      const actions = await this.mappingEngine.evaluateRules(inventory, {
        client: this.client,
        type: 'inventory'
      });

      // Process inventory update actions
      await this.processActions(actions, { type: 'inventory' });
    } catch (error) {
      throw this.client.createSyncError('Failed to sync inventory from Exigo', 'INVENTORY_SYNC_ERROR', error);
    }
  }

  async fullSync(): Promise<void> {
    try {
      // TODO: Implement full sync logic with mappings and rules
      const actions = await this.mappingEngine.evaluateRules({}, {
        client: this.client,
        type: 'full'
      });

      await this.processActions(actions, { type: 'full' });
    } catch (error) {
      throw this.client.createSyncError('Failed to perform full sync', 'FULL_SYNC_ERROR', error);
    }
  }

  private async processActions(actions: SyncAction[], context: SyncContext): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'updateField':
            if (action.target.entity === 'customer' && context.customerId) {
              const customer = await this.client.getCustomer(context.customerId);
              if (customer && action.target.field) {
                await this.client.updateCustomer({
                  ...customer,
                  [action.target.field]: action.value
                });
              }
            }
            break;
          case 'createEntity':
            // Handle create entity action
            break;
          case 'webhook':
            // Handle webhook trigger
            break;
        }
      } catch (error) {
        console.error(`Failed to process action ${action.type}:`, error);
        // Continue with other actions even if one fails
      }
    }
  }
} 