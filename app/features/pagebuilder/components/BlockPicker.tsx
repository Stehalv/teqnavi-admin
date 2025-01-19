import { Modal, BlockStack, Text, Icon } from "@shopify/polaris";
import { TextAlignLeftIcon, ImageIcon, ButtonIcon } from "@shopify/polaris-icons";
import { nanoid } from "nanoid";
import type { Block } from "../types.js";

interface BlockPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (block: Block) => void;
  sectionType?: string;
}

const BLOCK_TEMPLATES: Record<string, { type: string; icon: any; description: string; settings: Record<string, any> }> = {
  text: {
    type: "text",
    icon: TextAlignLeftIcon,
    description: "Add a text block",
    settings: {
      text: "New text block"
    }
  },
  button: {
    type: "button",
    icon: ButtonIcon,
    description: "Add a button",
    settings: {
      text: "Button text",
      link: "#"
    }
  },
  image: {
    type: "image",
    icon: ImageIcon,
    description: "Add an image",
    settings: {
      src: "",
      alt: ""
    }
  }
};

export function BlockPicker({ open, onClose, onSelect, sectionType }: BlockPickerProps) {
  const handleSelect = (template: typeof BLOCK_TEMPLATES[keyof typeof BLOCK_TEMPLATES]) => {
    onSelect({
      id: nanoid(),
      type: template.type,
      settings: template.settings
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add block"
      primaryAction={null}
    >
      <Modal.Section>
        <BlockStack gap="400">
          {Object.entries(BLOCK_TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              onClick={() => handleSelect(template)}
              style={{
                background: "none",
                border: "1px solid var(--p-border-subdued)",
                borderRadius: "var(--p-border-radius-2)",
                padding: "12px",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}
            >
              <div style={{ 
                width: "32px", 
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--p-surface-subdued)",
                borderRadius: "var(--p-border-radius-1)"
              }}>
                <Icon source={template.icon} />
              </div>
              <div>
                <Text as="span" variant="bodyMd" fontWeight="bold">
                  {template.type}
                </Text>
                <br />
                <Text as="span" variant="bodySm" tone="subdued">
                  {template.description}
                </Text>
              </div>
            </button>
          ))}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
} 