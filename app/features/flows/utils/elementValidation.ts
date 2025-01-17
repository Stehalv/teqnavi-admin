interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateFormConfig(config: string): ValidationResult {
  const errors: string[] = [];
  try {
    const parsed = JSON.parse(config);
    const fields = parsed.fields || [];
    const formField = fields.find((f: any) => f.type === 'form');

    if (formField) {
      if (!formField.validation?.formType) {
        errors.push("Form type is required");
      }
      if (!formField.validation?.redirectUrl) {
        errors.push("Redirect URL is required");
      }
      if (formField.validation?.redirectUrl && !formField.validation.redirectUrl.startsWith('http')) {
        errors.push("Redirect URL must be a valid URL");
      }
    }
  } catch {
    errors.push("Invalid configuration format");
  }
  return { isValid: errors.length === 0, errors };
}

export function validateProductConfig(config: string): ValidationResult {
  const errors: string[] = [];
  try {
    const parsed = JSON.parse(config);
    if (parsed.maxProducts <= 0) errors.push("Max products must be greater than 0");
  } catch {
    errors.push("Invalid configuration format");
  }
  return { isValid: errors.length === 0, errors };
} 