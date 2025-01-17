export interface Step {
  id: string;
  name: string;
  elements: {
    id: string;
    type: string;
    label: string;
    required?: boolean;
    options?: string[];
  }[];
} 