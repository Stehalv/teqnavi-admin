import type { FieldMapping, SyncRule, SyncAction, SyncConfig, SyncCondition } from './types.js';

type EntityType = 'customers' | 'orders' | 'products';

interface EvaluationContext {
  type: 'customer' | 'order' | 'product' | 'inventory' | 'full';
  client: unknown;
  mappedData?: Record<string, unknown>;
  [key: string]: unknown;
}

export class MappingEngine {
  constructor(private config: SyncConfig) {}

  async applyMappings(
    sourceData: Record<string, unknown>,
    entityType: EntityType
  ): Promise<Record<string, unknown>> {
    const mappings = this.config.mappings[entityType] || [];
    const result: Record<string, unknown> = {};

    for (const mapping of mappings) {
      if (!mapping.isEnabled) continue;

      const sourceValue = this.getNestedValue(sourceData, mapping.sourceField);
      
      if (mapping.transform) {
        try {
          // Safely evaluate the transform function
          const transformFn = new Function('value', 'data', mapping.transform);
          result[mapping.targetField] = transformFn(sourceValue, sourceData);
        } catch (error) {
          console.error(`Transform error for field ${mapping.sourceField}:`, error);
          result[mapping.targetField] = sourceValue;
        }
      } else {
        result[mapping.targetField] = sourceValue;
      }
    }

    return result;
  }

  async evaluateRules(
    sourceData: Record<string, unknown>,
    context: EvaluationContext
  ): Promise<SyncAction[]> {
    const actions: SyncAction[] = [];
    const sortedRules = [...this.config.rules]
      .filter(rule => rule.isEnabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (await this.evaluateCondition(rule.condition, sourceData, context)) {
        actions.push(...rule.actions);
      }
    }

    return actions;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: any, key) => current?.[key], obj);
  }

  private async evaluateCondition(
    condition: SyncCondition,
    data: Record<string, unknown>,
    context: EvaluationContext
  ): Promise<boolean> {
    const fieldValue = this.getNestedValue(data, condition.field);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'contains':
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(condition.value);
        }
        if (typeof fieldValue === 'string') {
          return fieldValue.includes(String(condition.value));
        }
        return String(fieldValue).includes(String(condition.value));
      case 'greaterThan':
        return Number(fieldValue) > Number(condition.value);
      case 'lessThan':
        return Number(fieldValue) < Number(condition.value);
      case 'in':
        if (!Array.isArray(condition.value)) return false;
        const stringValue = String(fieldValue);
        return condition.value.some(v => String(v) === stringValue);
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      default:
        return false;
    }
  }

  private async evaluateExpression(
    expression: string,
    context: Record<string, unknown>
  ): Promise<boolean> {
    try {
      const fn = new Function(...Object.keys(context), `return ${expression}`);
      return fn(...Object.values(context));
    } catch (error) {
      console.error('Error evaluating expression:', error);
      return false;
    }
  }
} 