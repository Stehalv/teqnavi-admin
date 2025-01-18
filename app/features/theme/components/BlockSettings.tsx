import { BlockStack } from "@shopify/polaris";
import type { Block, ThemeAsset, JsonifyObject } from "../types.js";
import { SettingsField } from "./SettingsField.js";
import { parseSchema } from "../utils/schemaParser.js";
import { useSettings } from "../hooks/useSettings.js";

export function BlockSettings({ 
  block,
  blockAsset,
  onChange
}: {
  block: Block;
  blockAsset: ThemeAsset | JsonifyObject<ThemeAsset>;
  onChange: (block: Block) => void;
}) {
  const { settings, handleSettingChange } = useSettings(block, onChange);
  const schema = parseSchema(blockAsset.content);

  return (
    <BlockStack gap="400">
      {schema.settings.map((field) => (
        <div key={field.id || field.content}>
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