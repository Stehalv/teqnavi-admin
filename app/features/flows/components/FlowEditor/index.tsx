import { Page, Layout, Card, Button, ButtonGroup, Text, Banner, AppProvider } from "@shopify/polaris";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { StepEditor } from "./StepEditor.js";
import { ElementPalette } from "./ElementPalette.js";
import type { SerializedStep, StepElement, ActionData } from "../../types.js";

interface FlowEditorProps {
  flow: {
    id: string;
    name: string;
    steps: SerializedStep[];
    elements: StepElement[];
  };
  onSave: (update: { steps: SerializedStep[] }) => void;
  isSubmitting?: boolean;
  actionData?: ActionData;
}

interface HistoryState {
  steps: SerializedStep[];
}

export function FlowEditor({ flow, onSave, isSubmitting, actionData }: FlowEditorProps) {
  const [steps, setSteps] = useState<SerializedStep[]>(flow.steps);
  const [history, setHistory] = useState<HistoryState[]>([{ steps: flow.steps }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showError, setShowError] = useState(false);

  const addToHistory = (newSteps: SerializedStep[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ steps: newSteps });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSteps(history[historyIndex - 1].steps);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSteps(history[historyIndex + 1].steps);
    }
  };

  const updateSteps = (newSteps: SerializedStep[]) => {
    setSteps(newSteps);
    addToHistory(newSteps);
  };

  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // Handle step reordering
    if (source.droppableId === 'steps' && destination.droppableId === 'steps') {
      const reorderedSteps = Array.from(steps);
      const [removed] = reorderedSteps.splice(source.index, 1);
      reorderedSteps.splice(destination.index, 0, removed);
      
      // Update order property for all steps
      const updatedSteps = reorderedSteps.map((step, index) => ({
        ...step,
        order: index,
        updatedAt: new Date().toISOString()
      }));
      
      updateSteps(updatedSteps);
      return;
    }

    // Handle element reordering within same step
    if (source.droppableId === destination.droppableId && source.droppableId !== 'elements') {
      const stepId = source.droppableId;
      const step = steps.find(s => s.id === stepId);
      if (!step) return;

      const newElements = Array.from(step.elements || []);
      const [removed] = newElements.splice(source.index, 1);
      newElements.splice(destination.index, 0, removed);

      updateSteps(steps.map(s => 
        s.id === stepId 
          ? { ...s, elements: newElements }
          : s
      ));
      return;
    }

    // Handle new element dropping
    if (source.droppableId === 'elements' && draggableId.startsWith('new-')) {
      const elementType = draggableId.replace('new-', '');
      const targetStepId = destination.droppableId;
      const targetStep = steps.find(s => s.id === targetStepId);
      
      if (!targetStep) return;

      const newElement: StepElement = {
        id: uuidv4(),
        type: elementType,
        label: `New ${elementType}`,
        config: '{}',
        order: destination.index,
        flowId: flow.id,
        stepId: targetStepId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      updateSteps(steps.map(step => 
        step.id === targetStepId 
          ? { 
              ...step, 
              elements: [...(step.elements || []), newElement]
            }
          : step
      ));
    }
  };

  const addStep = () => {
    const newStep = {
      id: uuidv4(),
      name: "New Step",
      order: steps.length,
      flowId: flow.id,
      elements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    updateSteps([...steps, newStep]);
  };

  const handleSave = () => {
    onSave({ steps });
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleUndo, handleRedo]);

  return (
    <Page
      title={flow.name}
      primaryAction={
        <ButtonGroup>
          <Button onClick={handleUndo} disabled={historyIndex === 0}>Undo</Button>
          <Button onClick={handleRedo} disabled={historyIndex === history.length - 1}>Redo</Button>
          <Button onClick={addStep}>Add Step</Button>
          <Button
            variant="primary"
            loading={isSubmitting}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </ButtonGroup>
      }
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <Layout>
          <Layout.Section>
            <Droppable droppableId="steps">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {steps.map((step, index) => (
                    <StepEditor
                      key={step.id}
                      step={step}
                      index={index}
                      onUpdate={(updates: Partial<SerializedStep>) => {
                        updateSteps(steps.map(s => 
                          s.id === step.id ? { ...s, ...updates } : s
                        ));
                      }}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <ElementPalette />
          </Layout.Section>
        </Layout>
      </DragDropContext>
    </Page>
  );
} 