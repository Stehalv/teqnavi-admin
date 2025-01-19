import { Modal, BlockStack, Text, Card } from "@shopify/polaris";
import type { Block } from "../types.js";

interface BlockPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (block: Block) => void;
  sectionType: string;
}

const BLOCK_TEMPLATES: Record<string, Record<string, Omit<Block, "id">>> = {
  hero: {
    button: {
      type: "button",
      settings: {
        text: "Shop Now",
        link: "/collections/all",
        style: "primary",
        size: "large"
      }
    },
    image: {
      type: "image",
      settings: {
        image: "",
        alt: "",
        overlay_opacity: 0
      }
    }
  },
  "featured-collection": {
    product: {
      type: "product",
      settings: {
        product_id: "",
        show_price: true,
        show_vendor: true,
        show_rating: true
      }
    }
  }
};

export function BlockPicker({ open, onClose, onSelect, sectionType }: BlockPickerProps) {
  const blockTypes = BLOCK_TEMPLATES[sectionType] || {};

  const handleSelect = (type: string) => {
    const template = blockTypes[type];
    const newBlock: Block = {
      ...template,
      id: `block-${Date.now()}`,
    };
    onSelect(newBlock);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Block"
      primaryAction={{
        content: "Cancel",
        onAction: onClose,
      }}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p" variant="bodyMd">
            Choose a block type to add to your section
          </Text>
          
          <BlockStack gap="400">
            {Object.entries(blockTypes).map(([type, template]) => (
              <div key={type} onClick={() => handleSelect(type)} style={{ cursor: "pointer" }}>
                <Card padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      {getBlockDescription(type)}
                    </Text>
                  </BlockStack>
                </Card>
              </div>
            ))}
          </BlockStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

function getBlockDescription(type: string): string {
  switch (type) {
    case "button":
      return "Add a customizable button with various styles and sizes";
    case "image":
      return "Add an image with optional overlay and alt text";
    case "product":
      return "Display product details including price, vendor, and rating";
    default:
      return "Add a new block to your section";
  }
} 