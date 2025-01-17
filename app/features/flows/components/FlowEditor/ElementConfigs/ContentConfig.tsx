import { FormLayout, TextField, Select } from "@shopify/polaris";
import { useState } from "react";

export function ContentConfig({ config, onUpdate }: { config: string; onUpdate: (config: string) => void }) {
  const parsedConfig = JSON.parse(config);
  const [contentType, setContentType] = useState(parsedConfig.type || 'text');
  const [content, setContent] = useState(parsedConfig.content || '');

  const handleUpdate = () => {
    onUpdate(JSON.stringify({ type: contentType, content }));
  };

  return (
    <FormLayout>
      <Select
        label="Content Type"
        options={[
          { label: 'Text', value: 'text' },
          { label: 'HTML', value: 'html' },
          { label: 'Image', value: 'image' }
        ]}
        value={contentType}
        onChange={(value) => {
          setContentType(value);
          handleUpdate();
        }}
      />
      <TextField
        label="Content"
        value={content}
        onChange={(value) => {
          setContent(value);
          handleUpdate();
        }}
        multiline={4}
        autoComplete="off"
      />
    </FormLayout>
  );
} 