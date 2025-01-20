import React, { useState, useCallback } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceItem,
  Text,
  ButtonGroup,
  Button,
  Modal,
  TextField,
  Select,
  Banner,
  Toast,
  InlineStack
} from '@shopify/polaris';
import { TemplateService } from '~/features/pagebuilder/services/template.server.js';
import { requireShopId } from '~/utils/auth.server.js';
import type { SectionTemplateWithBlocks } from '~/features/pagebuilder/services/template.server.js';

export async function loader({ request }: { request: Request }) {
  const shopId = await requireShopId(request);
  const templates = await TemplateService.listSectionTemplates(shopId);
  return json({ templates });
}

export default function TemplatesIndex() {
  const { templates } = useLoaderData<{ templates: SectionTemplateWithBlocks[] }>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [schema, setSchema] = useState('{\n  "settings": []\n}');
  const [liquid, setLiquid] = useState('');

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          schema: JSON.parse(schema),
          liquid
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create template');
      }

      setShowCreateModal(false);
      setShowToast(true);
      // Reset form
      setName('');
      setType('');
      setSchema('{\n  "settings": []\n}');
      setLiquid('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setIsCreating(false);
    }
  }, [name, type, schema, liquid]);

  const templateTypes = [
    { label: 'Hero', value: 'hero' },
    { label: 'Featured Collection', value: 'featured-collection' },
    { label: 'Rich Text', value: 'rich-text' },
    { label: 'Image with Text', value: 'image-with-text' },
    { label: 'Newsletter', value: 'newsletter' }
  ];

  const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <InlineStack gap="200" align="start">
      <Text as="span">{children}</Text>
      <Text as="span" tone="critical">*</Text>
    </InlineStack>
  );

  return (
    <Page
      title="Templates"
      primaryAction={{
        content: 'Create Template',
        onAction: () => setShowCreateModal(true)
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              items={templates}
              renderItem={(template) => (
                <ResourceItem
                  id={template.id}
                  url={`/app/templates/${template.id}`}
                  name={template.name}
                  verticalAlignment="center"
                >
                  <div style={{ padding: '12px 0' }}>
                    <Text variant="bodyMd" as="h3">
                      {template.name}
                    </Text>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Type: {template.type}
                    </Text>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Blocks: {template.blocks.length}
                    </Text>
                  </div>
                </ResourceItem>
              )}
            />
          </Card>
        </Layout.Section>

        <Modal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Template"
          primaryAction={{
            content: 'Create',
            onAction: handleCreate,
            loading: isCreating,
            disabled: !name || !type || !schema || !liquid
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setShowCreateModal(false)
            }
          ]}
        >
          <Modal.Section>
            {error && (
              <Banner tone="critical" onDismiss={() => setError(null)}>
                <p>{error}</p>
              </Banner>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextField
                label={<RequiredLabel>Name</RequiredLabel>}
                value={name}
                onChange={setName}
                autoComplete="off"
                helpText="A unique name for this template"
              />

              <Select
                label={<RequiredLabel>Type</RequiredLabel>}
                options={templateTypes}
                value={type}
                onChange={setType}
                helpText="The type of section this template creates"
              />

              <TextField
                label={<RequiredLabel>Schema</RequiredLabel>}
                value={schema}
                onChange={setSchema}
                multiline={4}
                monospaced
                autoComplete="off"
                helpText="JSON schema defining the template settings"
              />

              <TextField
                label={<RequiredLabel>Liquid Template</RequiredLabel>}
                value={liquid}
                onChange={setLiquid}
                multiline={8}
                monospaced
                autoComplete="off"
                helpText="Liquid code for rendering the template"
              />
            </div>
          </Modal.Section>
        </Modal>

        {showToast && (
          <Toast
            content="Template created successfully"
            onDismiss={() => setShowToast(false)}
          />
        )}
      </Layout>
    </Page>
  );
} 