import { FormLayout, TextField, Button } from "@shopify/polaris";
import { LegacyCard } from "@shopify/polaris";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import type { SerializedStep } from "../../types.js";
import { ElementEditor } from "./ElementEditor.js";

interface StepEditorProps {
  step: SerializedStep;
  index: number;
  onUpdate: (updates: Partial<SerializedStep>) => void;
  onDeleteElement?: (elementId: string) => void;
}

export function StepEditor({ step, index, onUpdate, onDeleteElement }: StepEditorProps) {
  const handleElementDelete = (elementId: string) => {
    onUpdate({
      elements: step.elements.filter(e => e.id !== elementId)
    });
  };

  return (
    <Draggable draggableId={step.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <LegacyCard>
            <LegacyCard.Section title={step.name}>
              <FormLayout>
                <TextField
                  label="Step Name"
                  value={step.name}
                  autoComplete="off"
                  onChange={(value) => onUpdate({ name: value })}
                />
                <Droppable droppableId={step.id}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {step.elements?.map((element, index) => (
                        <Draggable key={element.id} draggableId={element.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <ElementEditor
                                element={element}
                                onUpdate={(updates) => onUpdate({
                                  elements: step.elements.map(e => 
                                    e.id === element.id ? { ...e, ...updates } : e
                                  )
                                })}
                                onDelete={() => handleElementDelete(element.id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </FormLayout>
            </LegacyCard.Section>
          </LegacyCard>
        </div>
      )}
    </Draggable>
  );
} 