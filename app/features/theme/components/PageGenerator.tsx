import { useState } from "react";
import { Form, useSubmit, useActionData } from "@remix-run/react";
import { TextField, Button, Card, Box, BlockStack, Text, Layout } from "@shopify/polaris";
import type { ActionData } from "~/routes/api.generate-page.tsx";

export function PageGenerator() {
  const [prompt, setPrompt] = useState("");
  const submit = useSubmit();
  const actionData = useActionData<ActionData>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(
      { prompt },
      { method: "POST", action: "/api/generate-page" }
    );
  };

  return (
    <Layout>
      <Layout.Section>
        <Card>
          <Box padding="400">
            <Form onSubmit={handleSubmit}>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">AI Page Generator</Text>
                
                <TextField
                  label="Describe your page"
                  value={prompt}
                  onChange={setPrompt}
                  multiline={4}
                  placeholder="Describe the page you want to create. For example: Create a contact page with a form, map, and business hours section."
                  autoComplete="off"
                />

                <Button submit>
                  Generate Page
                </Button>
              </BlockStack>
            </Form>
          </Box>
        </Card>
      </Layout.Section>

      {actionData?.preview && (
        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Preview</Text>
                
                <div
                  style={{ padding: "20px" }}
                  dangerouslySetInnerHTML={{ __html: actionData.preview.html }}
                />
                
                {actionData.preview.css && (
                  <style dangerouslySetInnerHTML={{ __html: actionData.preview.css }} />
                )}
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      )}

      {actionData?.schema && (
        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Page Schema</Text>
                <pre style={{ overflow: 'auto', maxHeight: '300px' }}>
                  {JSON.stringify(actionData.schema, null, 2)}
                </pre>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      )}
    </Layout>
  );
} 