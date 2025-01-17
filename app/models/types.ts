export interface Element {
  id: string;
  type: string;
  label: string;
  config: string;
  order: number;
  flowId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Step {
  id: string;
  name: string;
  order: number;
  flowId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Flow {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  isActive: boolean;
  steps: Step[];
  elements: Element[];
  createdAt: Date;
  updatedAt: Date;
} 