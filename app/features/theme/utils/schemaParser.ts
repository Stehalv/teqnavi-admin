import type { SchemaField } from "../components/SettingsField.js";

export interface Schema {
  settings: SchemaField[];
}

export function parseSchema(content: string | null | undefined): Schema {
  if (!content) {
    return { settings: [] };
  }

  try {
    const schemaMatch = content.match(/{% schema %}([\s\S]*?){% endschema %}/);
    if (!schemaMatch) {
      return { settings: [] };
    }

    const parsed = JSON.parse(schemaMatch[1]) as Schema;
    return parsed;
  } catch (e) {
    console.error('Failed to parse schema:', e);
    return { settings: [] };
  }
} 