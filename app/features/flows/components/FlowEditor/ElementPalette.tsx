import { Card, Text, BlockStack, InlineStack } from "@shopify/polaris";
import { Draggable, Droppable } from "@hello-pangea/dnd";

const ELEMENT_TYPES = [
  {
    id: 'customer-form',
    type: 'form',
    label: 'Customer Form',
    description: 'Create and login customers',
    icon: '📝'
  },
  {
    id: 'product-selector',
    type: 'products',
    label: 'Product Selection',
    description: 'Let customers choose products',
    icon: '🛍️'
  }
];

export function ElementPalette() {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">Available Elements</Text>
        <Droppable droppableId="elements">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {ELEMENT_TYPES.map((element, index) => (
                <Draggable key={element.id} draggableId={`new-${element.type}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card>
                        <BlockStack gap="200">
                          <InlineStack gap="200">
                            <Text as="h3" variant="headingSm">{element.icon} {element.label}</Text>
                          </InlineStack>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {element.description}
                          </Text>
                        </BlockStack>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </BlockStack>
    </Card>
  );
} 