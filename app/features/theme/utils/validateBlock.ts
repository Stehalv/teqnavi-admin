import type { Block } from "../types.js";

interface ValidationError {
  field: string;
  message: string;
}

export function validateBlock(content: string): ValidationError[] {
  const errors: ValidationError[] = [];

  try {
    // Extract schema
    const schemaMatch = content.match(/{% schema %}([\s\S]*?){% endschema %}/);
    if (!schemaMatch) {
      errors.push({
        field: 'schema',
        message: 'Block must contain a schema'
      });
      return errors;
    }

    const schema = JSON.parse(schemaMatch[1]);

    // Validate required fields
    if (!schema.name) {
      errors.push({
        field: 'name',
        message: 'Block must have a name'
      });
    }

    if (!schema.target) {
      errors.push({
        field: 'target',
        message: 'Block must specify a target (section, page, etc.)'
      });
    }

    if (!schema.type) {
      errors.push({
        field: 'type',
        message: 'Block must have a type'
      });
    }

    if (!schema.settings || !Array.isArray(schema.settings)) {
      errors.push({
        field: 'settings',
        message: 'Block must have a settings array'
      });
    } else {
      // Validate settings
      schema.settings.forEach((setting: any, index: number) => {
        if (!setting.type) {
          errors.push({
            field: `settings[${index}].type`,
            message: 'Each setting must have a type'
          });
        }

        if (!setting.id && setting.type !== 'header') {
          errors.push({
            field: `settings[${index}].id`,
            message: 'Each setting (except headers) must have an id'
          });
        }

        if (!setting.label && setting.type !== 'header') {
          errors.push({
            field: `settings[${index}].label`,
            message: 'Each setting (except headers) must have a label'
          });
        }

        // Validate specific setting types
        switch (setting.type) {
          case 'select':
            if (!setting.options || !Array.isArray(setting.options)) {
              errors.push({
                field: `settings[${index}].options`,
                message: 'Select settings must have an options array'
              });
            }
            break;

          case 'range':
            if (typeof setting.min !== 'number') {
              errors.push({
                field: `settings[${index}].min`,
                message: 'Range settings must have a min value'
              });
            }
            if (typeof setting.max !== 'number') {
              errors.push({
                field: `settings[${index}].max`,
                message: 'Range settings must have a max value'
              });
            }
            break;

          case 'header':
            if (!setting.content) {
              errors.push({
                field: `settings[${index}].content`,
                message: 'Header settings must have content'
              });
            }
            break;
        }
      });
    }

    // Validate templates if specified
    if (schema.templates && (!Array.isArray(schema.templates) || schema.templates.length === 0)) {
      errors.push({
        field: 'templates',
        message: 'If templates are specified, they must be a non-empty array'
      });
    }

    // Validate liquid syntax in the template
    const template = content.replace(/{% schema %}[\s\S]*?{% endschema %}/, '').trim();
    if (!template) {
      errors.push({
        field: 'template',
        message: 'Block must have a template'
      });
    }

    // Basic liquid syntax validation
    const openTags = (template.match(/{%/g) || []).length;
    const closeTags = (template.match(/%}/g) || []).length;
    if (openTags !== closeTags) {
      errors.push({
        field: 'template',
        message: 'Invalid Liquid syntax: mismatched tags'
      });
    }

    const openVars = (template.match(/{{/g) || []).length;
    const closeVars = (template.match(/}}/g) || []).length;
    if (openVars !== closeVars) {
      errors.push({
        field: 'template',
        message: 'Invalid Liquid syntax: mismatched variable brackets'
      });
    }

  } catch (e) {
    errors.push({
      field: 'schema',
      message: 'Invalid JSON in schema'
    });
  }

  return errors;
}

export function validateBlockInstance(block: Block, schema: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate required fields
  if (!block.type) {
    errors.push({
      field: 'type',
      message: 'Block must have a type'
    });
  }

  if (!block.settings) {
    errors.push({
      field: 'settings',
      message: 'Block must have settings'
    });
  }

  // Validate settings against schema
  const schemaSettings = schema.settings || [];
  schemaSettings.forEach((setting: any) => {
    if (setting.type === 'header') return;

    const value = block.settings[setting.id];
    
    // Check required fields
    if (setting.required && !value && value !== 0 && value !== false) {
      errors.push({
        field: `settings.${setting.id}`,
        message: `${setting.label} is required`
      });
    }

    // Type-specific validation
    if (value !== undefined && value !== null) {
      switch (setting.type) {
        case 'number':
        case 'range':
          if (typeof value !== 'number') {
            errors.push({
              field: `settings.${setting.id}`,
              message: `${setting.label} must be a number`
            });
          } else {
            if (setting.min !== undefined && value < setting.min) {
              errors.push({
                field: `settings.${setting.id}`,
                message: `${setting.label} must be at least ${setting.min}`
              });
            }
            if (setting.max !== undefined && value > setting.max) {
              errors.push({
                field: `settings.${setting.id}`,
                message: `${setting.label} must be at most ${setting.max}`
              });
            }
          }
          break;

        case 'select':
          if (!setting.options?.some((opt: any) => opt.value === value)) {
            errors.push({
              field: `settings.${setting.id}`,
              message: `${setting.label} must be one of the allowed values`
            });
          }
          break;

        case 'checkbox':
          if (typeof value !== 'boolean') {
            errors.push({
              field: `settings.${setting.id}`,
              message: `${setting.label} must be a boolean`
            });
          }
          break;
      }
    }
  });

  return errors;
} 