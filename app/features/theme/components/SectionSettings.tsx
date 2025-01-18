import { BlockStack } from "@shopify/polaris";
import type { Section, ThemeAsset, JsonifyObject } from "../types.js";
import { SettingsField } from "./SettingsField.js";
import { parseSchema } from "../utils/schemaParser.js";
import { useSettings } from "../hooks/useSettings.js";

export function SectionSettings({ 
  section,
  sectionAsset,
  onChange
}: {
  section: Section;
  sectionAsset: ThemeAsset | JsonifyObject<ThemeAsset>;
  onChange: (section: Section) => void;
}) {
  const { settings, handleSettingChange } = useSettings(section, onChange);
  const schema = parseSchema(sectionAsset.content);

  return (
    <BlockStack gap="400">
      {schema.settings.map((field) => (
        <div key={field.id}>
          <SettingsField
            field={field}
            value={settings[field.id]}
            onChange={(value) => handleSettingChange(field.id, value)}
          />
        </div>
      ))}
    </BlockStack>
  );
} 