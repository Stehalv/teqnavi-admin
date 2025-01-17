import React, { useState, lazy, Suspense } from "react";
import { Page, Layout, Card, Button, ButtonGroup } from "@shopify/polaris";
import Editor from "@monaco-editor/react";
import * as ts from "typescript";

const MonacoEditor = lazy(() => 
  import("@monaco-editor/react").then(mod => ({ default: mod.Editor }))
);

const DEFAULT_CODE = `interface EnrollmentForm {
  fields: FormField[];
  onSubmit: (data: any) => void;
}

interface FormField {
  name: string;
  type: 'text' | 'email' | 'number';
  required: boolean;
}

export default function CustomEnrollmentForm() {
  const fields: FormField[] = [
    { name: 'fullName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'age', type: 'number', required: false },
  ];

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
  };

  return {
    fields,
    onSubmit: handleSubmit
  };
}`;

export default function CodeEditorPage() {
  const [code, setCode] = useState(DEFAULT_CODE);

  const handleTest = () => {
    try {
      // Compile TypeScript to JavaScript
      const result = ts.transpileModule(code, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2015,
          module: ts.ModuleKind.CommonJS,
          strict: true,
        },
      });

      if (result.diagnostics && result.diagnostics.length > 0) {
        // Handle compilation errors
        const errors = result.diagnostics
          .map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"))
          .join("\n");
        throw new Error(errors);
      }

      console.log('Compiled JavaScript:', result.outputText);
      alert('TypeScript compiled successfully!');
    } catch (error) {
      console.error('Compilation failed:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Page
      title="Code Editor"
      primaryAction={
        <ButtonGroup>
          <Button onClick={handleTest}>Test Code</Button>
          <Button variant="primary">Save</Button>
        </ButtonGroup>
      }
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Suspense fallback={<div>Loading editor...</div>}>
              <MonacoEditor
                height="600px"
                defaultLanguage="typescript"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  rulers: [80],
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </Suspense>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 