export interface AIGeneratedTemplate {
  schema: string;  // JSON string
  liquid: string;
  styles: string;  // Add styles field for the template
  snippets: {     // Add snippets field for reusable code
    [key: string]: string;  // snippet-id -> liquid code
  };
  sections: {
    [key: string]: {
      settings: Record<string, any>;
      liquid: string;
      blocks?: {
        [key: string]: {
          type: string;
          settings: Record<string, any>;
        }
      };
      block_order?: string[];
    }
  };
}

export interface AIGeneratedPage {
  templates: {
    [key: string]: AIGeneratedTemplate;
  };
  page: string;  // JSON string
} 