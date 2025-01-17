import type { step, element } from "@prisma/client";

export interface StepElement {
  id: string;
  type: string;
  label: string;
  config: string;
  order: number;
  flowId: string;
  stepId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedStep {
  id: string;
  name: string;
  order: number;
  flowId: string;
  elements: StepElement[];
  createdAt: string;
  updatedAt: string;
}

export interface Flow {
  id: string;
  name: string;
  steps: SerializedStep[];
  elements: StepElement[];
}

export type FlowUpdate = {
  steps: Array<{
    id: string;
    name: string;
    order: number;
    flowId: string;
    createdAt: string;
    updatedAt: string;
    elements: Array<StepElement>;
  }>;
};

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

export type ActionData = 
  | { success: true }
  | { errors: ValidationError[] }
  | { error: string; details?: string }; 