import type { SerializedStep, ValidationResult } from "../types.js";

export function validateFlow(steps: SerializedStep[]): ValidationResult {
  const errors = [];

  if (steps.length === 0) {
    errors.push({
      field: 'steps',
      message: 'Flow must have at least one step'
    });
  }

  steps.forEach((step, index) => {
    if (!step.name.trim()) {
      errors.push({
        field: `steps[${index}].name`,
        message: 'Step name is required'
      });
    }

    step.elements.forEach((element, elementIndex) => {
      if (!element.label.trim()) {
        errors.push({
          field: `steps[${index}].elements[${elementIndex}].label`,
          message: 'Element label is required'
        });
      }

      try {
        JSON.parse(element.config);
      } catch {
        errors.push({
          field: `steps[${index}].elements[${elementIndex}].config`,
          message: 'Invalid element configuration'
        });
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
} 