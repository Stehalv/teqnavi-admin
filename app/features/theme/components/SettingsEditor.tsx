import { LegacyCard, FormLayout, TextField, Select, Checkbox, RangeSlider } from "@shopify/polaris";
const { Section } = LegacyCard;
import type { SettingSchema, SettingValue } from "../types.js";

interface SettingsEditorProps {
  settings: SettingSchema[];
  values: SettingValue[];
  onChange: (values: SettingValue[]) => void;
}

export function SettingsEditor({ settings, values, onChange }: SettingsEditorProps) {
  console.log('SettingsEditor:', { settings, values });

  const handleChange = (id: string, value: any) => {
    const newValues = values.map(v => 
      v.id === id ? { ...v, value } : v
    );
    onChange(newValues);
  };

  return (
    <LegacyCard>
      <Section title="Settings">
        <FormLayout>
          {settings.map(setting => {
            const value = values.find(v => v.id === setting.id)?.value;

            switch (setting.type) {
              case 'text':
              case 'richtext':
                return (
                  <TextField
                    key={setting.id}
                    label={setting.label}
                    value={value || setting.default || ''}
                    onChange={val => handleChange(setting.id, val)}
                    autoComplete="off"
                    multiline={setting.type === 'richtext' ? 4 : undefined}
                  />
                );
              case 'select':
                return (
                  <Select
                    key={setting.id}
                    label={setting.label}
                    options={setting.options || []}
                    value={value || setting.default}
                    onChange={val => handleChange(setting.id, val)}
                  />
                );
              case 'checkbox':
                return (
                  <Checkbox
                    key={setting.id}
                    label={setting.label}
                    checked={value ?? setting.default ?? false}
                    onChange={val => handleChange(setting.id, val)}
                  />
                );
              case 'range':
                return (
                  <RangeSlider
                    key={setting.id}
                    label={setting.label}
                    value={value ?? setting.default ?? 0}
                    onChange={val => handleChange(setting.id, val)}
                    min={setting.min ?? 0}
                    max={setting.max ?? 100}
                    step={setting.step ?? 1}
                    output
                  />
                );
              default:
                console.log('Unsupported setting type:', setting.type);
                return null;
            }
          })}
        </FormLayout>
      </Section>
    </LegacyCard>
  );
} 