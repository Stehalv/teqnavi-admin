import { Card, BlockStack, InlineStack, Button, TextField, Modal, Banner } from "@shopify/polaris";
import { useState } from "react";
import type { StepElement } from "../../types.js";
import { FormConfig } from "./ElementConfigs/FormConfig.js";
import { ProductConfig } from "./ElementConfigs/ProductConfig.js";
import { validateFormConfig, validateProductConfig } from "../../utils/elementValidation.js";
import { ContentConfig } from "./ElementConfigs/ContentConfig.js";

interface ElementEditorProps {
  element: StepElement;
  onUpdate: (updates: Partial<StepElement>) => void;
  onDelete: () => void;
}

export function ElementEditor({ element, onUpdate, onDelete }: ElementEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(element.label);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateConfig = () => {
    const validator = element.type === 'form' ? validateFormConfig : validateProductConfig;
    const result = validator(element.config);
    setValidationErrors(result.errors);
    return result.isValid;
  };

  const handleSave = () => {
    if (validateConfig()) {
      onUpdate({ label });
      setIsEditing(false);
    }
  };

  const renderConfig = () => {
    switch (element.type) {
      case 'form':
        return <FormConfig config={element.config} onUpdate={(config) => onUpdate({ config })} />;
      case 'products':
        return <ProductConfig config={element.config} onUpdate={(config) => onUpdate({ config })} />;
      case 'content':
        return <ContentConfig config={element.config} onUpdate={(config) => onUpdate({ config })} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        {validationErrors.length > 0 && (
          <Banner tone="critical">
            <ul>
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </Banner>
        )}
        <BlockStack gap="200">
          <InlineStack gap="200" align="space-between">
            <TextField
              label="Element Label"
              value={label}
              onChange={setLabel}
              autoComplete="off"
            />
            <InlineStack gap="200">
              <Button onClick={() => setIsEditing(true)}>Configure</Button>
              <Button tone="critical" onClick={onDelete}>Delete</Button>
            </InlineStack>
          </InlineStack>
        </BlockStack>
      </Card>

      <Modal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        title="Configure Element"
        primaryAction={{
          content: "Save",
          onAction: handleSave
        }}
      >
        {renderConfig()}
      </Modal>
    </>
  );
} 