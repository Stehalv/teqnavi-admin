import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useCallback, useState } from "react";
import { Page, Layout, Card, TextField, Button, Box, BlockStack, Text, Banner, InlineStack, Tabs } from "@shopify/polaris";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { useLoaderData } from "@remix-run/react";

type AssetType = 'section' | 'page' | 'block';

interface Conversation {
  prompt: string;
  code: string;
  type: AssetType;
  preview?: {
    html: string;
    css: string;
  };
  timestamp: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }
  return json({ hasApiKey: true });
}

export default function GPTRoute() {
  const { hasApiKey } = useLoaderData<typeof loader>();
  const [selectedTab, setSelectedTab] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState(`{%- comment -%}Generated code will appear here{%- endcomment -%}`);
  const [preview, setPreview] = useState<{ html: string; css: string }>({ html: "", css: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Conversation[]>([]);
  const [isRefining, setIsRefining] = useState(false);

  const assetTypes: AssetType[] = ['page', 'section', 'block'];
  const currentType = assetTypes[selectedTab];

  const tabs = [
    {
      id: 'page',
      content: 'Page',
      accessibilityLabel: 'Page generator',
      panelID: 'page-panel',
    },
    {
      id: 'section',
      content: 'Section',
      accessibilityLabel: 'Section generator',
      panelID: 'section-panel',
    },
    {
      id: 'block',
      content: 'Block',
      accessibilityLabel: 'Block generator',
      panelID: 'block-panel',
    },
  ];

  const getPlaceholder = (type: AssetType) => {
    switch (type) {
      case 'section':
        return isRefining 
          ? "e.g. Make the heading larger and add a subtitle"
          : "e.g. Create a hero section with a background image, heading, and button";
      case 'page':
        return isRefining
          ? "e.g. Add a contact form below the content"
          : "e.g. Create a contact page with a header, content area, and contact form";
      case 'block':
        return isRefining
          ? "e.g. Add an icon above the text"
          : "e.g. Create a feature block with an icon, heading, and description";
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt,
          type: currentType,
          previousCode: isRefining ? generatedCode : undefined 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate code");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Add to history
      setHistory(prev => [...prev, {
        prompt,
        code: data.code,
        type: currentType,
        preview: data.preview,
        timestamp: Date.now()
      }]);

      setGeneratedCode(data.code);
      setPreview(data.preview);
      setIsRefining(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate code. Please try again.");
      console.error("Generation error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, generatedCode, isRefining, currentType]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value) {
      setGeneratedCode(value);
    }
  }, []);

  const startRefinement = useCallback(() => {
    setIsRefining(true);
    setPrompt(""); // Clear the prompt for new refinement
  }, []);

  const filteredHistory = history.filter(item => item.type === currentType);

  return (
    <Page title="GPT Theme Asset Generator">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {error && (
              <Banner tone="critical">
                {error}
              </Banner>
            )}
            
            <Card>
              <BlockStack gap="400">
                <Tabs
                  tabs={tabs}
                  selected={selectedTab}
                  onSelect={setSelectedTab}
                  fitted
                />
                <Text as="h2" variant="headingMd">
                  {isRefining ? `Refine your ${currentType}` : `Enter your ${currentType} prompt`}
                </Text>
                {isRefining && (
                  <Banner tone="info">
                    Your refinements will be applied to the currently displayed code.
                  </Banner>
                )}
                <TextField
                  label={`What kind of ${currentType} would you like to create?`}
                  value={prompt}
                  onChange={setPrompt}
                  autoComplete="off"
                  placeholder={getPlaceholder(currentType)}
                  multiline={3}
                />
                <InlineStack gap="200">
                  <Button 
                    variant="primary" 
                    onClick={handleGenerate}
                    loading={isLoading}
                  >
                    {isRefining ? `Refine ${currentType}` : `Generate ${currentType}`}
                  </Button>
                  {!isRefining && generatedCode !== `{%- comment -%}Generated code will appear here{%- endcomment -%}` && (
                    <Button onClick={startRefinement}>
                      Refine This Code
                    </Button>
                  )}
                  {isRefining && (
                    <Button onClick={() => setIsRefining(false)}>
                      Cancel Refinement
                    </Button>
                  )}
                </InlineStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Generated Code</Text>
                <Box
                  background="bg-surface-secondary"
                  borderRadius="200"
                  padding="400"
                  borderWidth="025"
                  borderColor="border"
                  minHeight="400px"
                >
                  <MonacoEditor
                    height="400px"
                    defaultLanguage="liquid"
                    value={generatedCode}
                    onChange={handleEditorChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: "on",
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </Box>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Preview</Text>
                <Box
                  background="bg-surface-secondary"
                  borderRadius="200"
                  padding="400"
                  borderWidth="025"
                  borderColor="border"
                  minHeight="200px"
                >
                  <div className="shopify-section-preview">
                    <style>
                      {`
                        .shopify-section-preview {
                          width: 100%;
                          min-height: 200px;
                          border: 1px solid var(--p-border-subdued);
                          border-radius: var(--p-border-radius-200);
                          padding: var(--p-space-400);
                          background: white;
                          color: black;
                          overflow: hidden;
                        }
                        /* Reset some basic elements */
                        .shopify-section-preview h1,
                        .shopify-section-preview h2,
                        .shopify-section-preview p {
                          margin: 0;
                          padding: 0;
                        }
                        /* Ensure images don't overflow */
                        .shopify-section-preview img {
                          max-width: 100%;
                          height: auto;
                        }
                        /* Apply custom styles */
                        ${preview.css}
                      `}
                    </style>
                    <div 
                      dangerouslySetInnerHTML={{ __html: preview.html }}
                    />
                    {!preview.html && (
                      <Text as="p" tone="subdued">Preview will appear here after generating code.</Text>
                    )}
                  </div>
                </Box>
                {error && (
                  <Banner tone="critical">
                    Preview Error: {error}
                  </Banner>
                )}
              </BlockStack>
            </Card>

            {filteredHistory.length > 0 && (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Generation History</Text>
                  {filteredHistory.map((item, index) => (
                    <Box
                      key={item.timestamp}
                      padding="400"
                      borderWidth="025"
                      borderColor="border"
                      borderRadius="200"
                    >
                      <BlockStack gap="200">
                        <Text as="span" variant="bodySm" tone="subdued">
                          Prompt {index + 1}: {item.prompt}
                        </Text>
                        <Button
                          onClick={() => {
                            setGeneratedCode(item.code);
                            if (item.preview) {
                              setPreview(item.preview);
                            }
                            setIsRefining(false);
                          }}
                          variant="plain"
                        >
                          Restore this version
                        </Button>
                      </BlockStack>
                    </Box>
                  ))}
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 