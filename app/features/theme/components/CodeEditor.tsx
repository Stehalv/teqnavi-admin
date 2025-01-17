import { lazy, Suspense, useEffect, useState } from "react";
import { LegacyCard, Banner } from "@shopify/polaris";
import type { ThemeAsset } from "../types.js";
import { validateSettings } from "../utils/validation.js";

const MonacoEditor = lazy(() => 
  import("@monaco-editor/react").then(mod => ({ default: mod.Editor }))
);

interface CodeEditorProps {
  asset: ThemeAsset;
  onChange: (content: string) => void;
}

export function CodeEditor({ asset, onChange }: CodeEditorProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [editorContent, setEditorContent] = useState(asset.content);

  useEffect(() => {
    setEditorContent(asset.content);
    setErrors([]);
  }, [asset.content, asset.id]);

  const handleChange = (value: string | undefined) => {
    if (!value) return;
    setEditorContent(value);
    
    if (asset.type === 'section') {
      // For sections, validate the schema if present
      const schemaMatch = value.match(/{% schema %}([\s\S]*?){% endschema %}/);
      if (schemaMatch) {
        try {
          const schemaJson = JSON.parse(schemaMatch[1]);
          const { isValid, errors } = validateSettings(schemaJson);
          setErrors(errors);
          if (isValid) {
            onChange(value);
          }
        } catch (e) {
          setErrors(['Invalid JSON in schema section']);
        }
      } else {
        // No schema found, just update the content
        onChange(value);
      }
    } else if (asset.type === 'page') {
      // For pages, validate JSON format
      try {
        JSON.parse(value);
        onChange(value);
        setErrors([]);
      } catch (e) {
        setErrors(['Invalid JSON format']);
      }
    } else {
      // For snippets and other assets, no validation needed
      onChange(value);
      setErrors([]);
    }
  };

  const getLanguage = () => {
    switch (asset.type) {
      case 'page':
        return 'json';
      case 'asset':
        return 'css';
      default:
        return 'liquid';
    }
  };

  return (
    <LegacyCard>
      {errors.length > 0 && (
        <Banner tone="critical">
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Banner>
      )}
      <Suspense fallback={<div>Loading editor...</div>}>
        <MonacoEditor
          height="600px"
          defaultLanguage={getLanguage()}
          theme="vs-dark"
          value={editorContent}
          onChange={handleChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </Suspense>
    </LegacyCard>
  );
} 