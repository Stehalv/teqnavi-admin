import type { SettingSchema } from "../types.js";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateSettings(schema: any): ValidationResult {
  const errors: string[] = [];

  try {
    // If schema is already an object, use it directly
    const schemaObj = typeof schema === 'string' ? JSON.parse(schema) : schema;

    if (!Array.isArray(schemaObj.settings)) {
      return { isValid: false, errors: ['Settings must be an array'] };
    }

    schemaObj.settings.forEach((setting: SettingSchema, index: number) => {
      if (!setting.type) {
        errors.push(`Setting ${index + 1}: Missing type`);
      }
      if (!setting.id) {
        errors.push(`Setting ${index + 1}: Missing id`);
      }
      if (!setting.label) {
        errors.push(`Setting ${index + 1}: Missing label`);
      }
      if (setting.type === 'select' && (!setting.options || !Array.isArray(setting.options))) {
        errors.push(`Setting ${index + 1}: Select type requires options array`);
      }
    });

    // Validate blocks if they exist
    if (schemaObj.blocks && !Array.isArray(schemaObj.blocks)) {
      errors.push('Blocks must be an array');
    } else if (schemaObj.blocks) {
      schemaObj.blocks.forEach((block: any, index: number) => {
        if (!block.type) {
          errors.push(`Block ${index + 1}: Missing type`);
        }
        if (!block.name) {
          errors.push(`Block ${index + 1}: Missing name`);
        }
        if (block.settings && !Array.isArray(block.settings)) {
          errors.push(`Block ${index + 1}: Settings must be an array`);
        }
      });
    }

    return { isValid: errors.length === 0, errors };
  } catch (error) {
    return { isValid: false, errors: ['Invalid JSON format'] };
  }
} 