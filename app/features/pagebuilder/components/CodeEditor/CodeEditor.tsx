import React from 'react';
import { Editor } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'json' | 'liquid' | 'css';
  height?: string;
  options?: Record<string, any>;
}

export function CodeEditor({ 
  value, 
  onChange, 
  language,
  height = '400px'
}: CodeEditorProps) {
  return (
    <Editor
      height={height}
      defaultLanguage={language}
      value={value}
      onChange={(value) => onChange(value || '')}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
      }}
    />
  );
} 