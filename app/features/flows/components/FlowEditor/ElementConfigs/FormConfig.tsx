import { FormLayout, Select, Button, Modal, TextField, Checkbox, Text, LegacyCard } from "@shopify/polaris";
import { useState } from "react";

interface PasswordValidation {
  minLength: number;
  maxLength: number;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  requireUppercase: boolean;
}

interface FormField {
  id: string;
  type: 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword' | 'text' | 'checkbox' | 'select' | 'form';
  label: string;
  name: string;
  required: boolean;
  validation?: {
    remote?: string;
    password?: PasswordValidation;
    formType?: 'registration' | 'login' | 'profile';
    redirectUrl?: string;
    successMessage?: string;
    errorMessage?: string;
  };
  options?: string[];
}

interface FormConfigData {
  fields: FormField[];
  styling: {
    labelPosition: 'top' | 'left';
    showLabels: boolean;
    submitButtonText: string;
  };
}

export function FormConfig({ config, onUpdate }: { config: string; onUpdate: (config: string) => void }) {
  const defaultConfig: FormConfigData = {
    fields: [
      {
        id: 'form',
        type: 'form',
        label: 'Customer Form',
        name: 'customer_form',
        required: true,
        validation: {
          formType: 'registration',
          redirectUrl: 'https://',
          errorMessage: 'Please complete all required fields'
        }
      },
      {
        id: 'firstName',
        type: 'firstName',
        label: 'First Name',
        name: 'customer[first_name]',
        required: true,
        validation: {
          errorMessage: 'First name is required'
        }
      },
      {
        id: 'lastName',
        type: 'lastName',
        label: 'Last Name',
        name: 'customer[last_name]',
        required: true,
        validation: {
          errorMessage: 'Last name is required'
        }
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        name: 'customer[email]',
        required: true,
        validation: {
          errorMessage: 'Please enter a valid email address'
        }
      },
      {
        id: 'password',
        type: 'password',
        label: 'Password',
        name: 'customer[password]',
        required: true,
        validation: {
          password: {
            minLength: 8,
            maxLength: 32,
            requireNumbers: true,
            requireSpecialChars: true,
            requireUppercase: true
          },
          errorMessage: 'Password does not meet requirements'
        }
      },
      {
        id: 'confirmPassword',
        type: 'confirmPassword',
        label: 'Confirm Password',
        name: 'customer[password_confirmation]',
        required: true,
        validation: {
          errorMessage: 'Passwords must match'
        }
      }
    ],
    styling: {
      labelPosition: 'top',
      showLabels: true,
      submitButtonText: 'Create Account'
    }
  };

  const parsedConfig: FormConfigData = config ? 
    JSON.parse(config) : defaultConfig;

  const [fields, setFields] = useState<FormField[]>(parsedConfig.fields || defaultConfig.fields);
  const [styling, setStyling] = useState(parsedConfig.styling || defaultConfig.styling);
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const handleUpdate = () => {
    onUpdate(JSON.stringify({ fields, styling }));
  };

  const addField = (field: FormField) => {
    setFields([...fields, field]);
    handleUpdate();
    setIsAddingField(false);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
    handleUpdate();
  };

  const renderFieldConfig = (field: FormField) => {
    const commonFields = (
      <>
        <TextField
          label="Label"
          value={field.label}
          onChange={(value) => updateField(field.id, { label: value })}
          autoComplete="off"
        />
        <Checkbox
          label="Required"
          checked={field.required}
          onChange={(checked) => updateField(field.id, { required: checked })}
        />
      </>
    );

    switch (field.type) {
      case 'form':
        return (
          <>
            {commonFields}
            <Select
              label="Form Type"
              options={[
                { label: 'Customer Registration', value: 'registration' },
                { label: 'Customer Login', value: 'login' },
                { label: 'Customer Profile', value: 'profile' }
              ]}
              value={field.validation?.formType || 'registration'}
              onChange={(value) => updateField(field.id, {
                validation: {
                  ...field.validation,
                  formType: value as 'registration' | 'login' | 'profile'
                }
              })}
            />
            <TextField
              label="Redirect URL"
              value={field.validation?.redirectUrl || ''}
              onChange={(value) => updateField(field.id, {
                validation: {
                  ...field.validation,
                  redirectUrl: value
                }
              })}
              autoComplete="off"
              helpText="Where to redirect after form submission"
            />
          </>
        );

      case 'password':
        return (
          <>
            {commonFields}
            <TextField
              label="Minimum Length"
              type="number"
              value={field.validation?.password?.minLength?.toString() || "8"}
              onChange={(value) => updateField(field.id, {
                validation: {
                  ...field.validation,
                  password: {
                    ...field.validation?.password,
                    minLength: parseInt(value)
                  }
                }
              })}
              autoComplete="off"
            />
            <Checkbox
              label="Require Numbers"
              checked={field.validation?.password?.requireNumbers || false}
              onChange={(checked) => updateField(field.id, {
                validation: {
                  ...field.validation,
                  password: {
                    ...field.validation?.password,
                    requireNumbers: checked
                  }
                }
              })}
            />
            <Checkbox
              label="Require Special Characters"
              checked={field.validation?.password?.requireSpecialChars || false}
              onChange={(checked) => updateField(field.id, {
                validation: {
                  ...field.validation,
                  password: {
                    ...field.validation?.password,
                    requireSpecialChars: checked
                  }
                }
              })}
            />
          </>
        );

      default:
        return commonFields;
    }
  };

  return (
    <FormLayout>
      <LegacyCard>
        <LegacyCard.Section>
          <Text variant="headingMd" as="h2">Form Fields</Text>
        </LegacyCard.Section>
        {fields.map((field) => (
          <LegacyCard.Section key={field.id}>
            <FormLayout>
              {renderFieldConfig(field)}
            </FormLayout>
          </LegacyCard.Section>
        ))}
        <LegacyCard.Section>
          <Button onClick={() => setIsAddingField(true)}>Add Field</Button>
        </LegacyCard.Section>
      </LegacyCard>

      <LegacyCard>
        <LegacyCard.Section>
          <Text variant="headingMd" as="h2">Styling</Text>
          <Select
            label="Label Position"
            options={[
              { label: 'Top', value: 'top' },
              { label: 'Left', value: 'left' }
            ]}
            value={styling.labelPosition}
            onChange={(value: 'top' | 'left') => {
              setStyling({ ...styling, labelPosition: value });
              handleUpdate();
            }}
          />
          <Checkbox
            label="Show Labels"
            checked={styling.showLabels}
            onChange={(checked) => {
              setStyling({ ...styling, showLabels: checked });
              handleUpdate();
            }}
          />
          <TextField
            label="Submit Button Text"
            value={styling.submitButtonText}
            onChange={(value) => {
              setStyling({ ...styling, submitButtonText: value });
              handleUpdate();
            }}
            autoComplete="off"
          />
        </LegacyCard.Section>
      </LegacyCard>

      <Modal
        open={isAddingField}
        onClose={() => setIsAddingField(false)}
        title="Add Field"
        primaryAction={{
          content: 'Add',
          onAction: () => {
            if (editingField) {
              addField(editingField);
              setEditingField(null);
            }
          }
        }}
      >
        <Modal.Section>
          <FormLayout>
            <Select
              label="Field Type"
              options={[
                { label: 'Text', value: 'text' },
                { label: 'Checkbox', value: 'checkbox' },
                { label: 'Select', value: 'select' }
              ]}
              value={editingField?.type || 'text'}
              onChange={(value) => setEditingField({
                id: crypto.randomUUID(),
                type: value as FormField['type'],
                label: '',
                name: '',
                required: false
              })}
            />
            {editingField && (
              <>
                <TextField
                  label="Label"
                  value={editingField.label}
                  onChange={(value) => setEditingField({ ...editingField, label: value })}
                  autoComplete="off"
                />
                <TextField
                  label="Field Name"
                  value={editingField.name}
                  onChange={(value) => setEditingField({ ...editingField, name: value })}
                  autoComplete="off"
                />
              </>
            )}
          </FormLayout>
        </Modal.Section>
      </Modal>
    </FormLayout>
  );
} 