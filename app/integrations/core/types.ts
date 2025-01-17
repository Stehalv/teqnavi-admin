export interface IntegrationConfig {
  id: string;
  provider: string;
  settings: Record<string, any>;
  isEnabled: boolean;
  lastSync?: Date;
}

export interface IntegrationProvider {
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sync(data: any): Promise<SyncResult>;
  validateConfig(config: IntegrationConfig): Promise<boolean>;
}

export interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transform?: string;
  isEnabled: boolean;
  description?: string;
}

export interface SyncCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'in' | 'exists';
  value: string | string[] | number | boolean;
}

export interface SyncAction {
  id: string;
  type: 'updateField' | 'createEntity' | 'webhook';
  target: {
    entity: 'customer' | 'order' | 'product';
    field?: string;
  };
  value: any;
}

export interface SyncRule {
  id: string;
  name: string;
  description: string;
  condition: SyncCondition;
  actions: SyncAction[];
  isEnabled: boolean;
  priority: number;
}

export interface SyncResult {
  success: boolean;
  message: string;
  data?: Record<string, any>;
  errors?: IntegrationError[];
  timestamp: Date;
}

export interface IntegrationError extends Error {
  provider: string;
  code: string;
  details?: Record<string, any>;
  timestamp: Date;
  originalError?: Error;
}

export interface SyncConfig {
  mappings: {
    customers: FieldMapping[];
    orders: FieldMapping[];
    products: FieldMapping[];
  };
  rules: SyncRule[];
  version: string;
  lastModified: Date;
} 