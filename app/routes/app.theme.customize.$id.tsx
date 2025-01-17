import { json, redirect, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { Page, Layout, Select, Button, ButtonGroup, Text, Modal, TextField, BlockStack, Box, Popover, InlineStack, ActionList, Scrollable } from "@shopify/polaris";
import { authenticate } from "~/shopify.server.js";
import { prisma } from "~/db.server.js";
import { validateShopAccess, validateShopResource } from "~/middleware/auth.server.js";
import { useState, useCallback, useEffect, useMemo } from "react";
import { PublishingBar } from "../features/theme/components/PublishingBar.js";
import { PagePreview } from "../features/theme/components/PagePreview.js";
import type { ThemeAsset, JsonifyObject } from "../features/theme/types.js";
import fs from "fs/promises";
import type { Prisma } from "@prisma/client";
import { EditIcon } from "@shopify/polaris-icons";
import { ThemeCustomizer } from "~/features/theme/components/ThemeCustomizer.js";
import { VersionHistory } from "~/features/theme/components/VersionHistory.js";
import { AssetPicker } from "~/features/theme/components/AssetPicker.js";
import { glob } from "glob";
import { readFile } from "fs/promises";

interface PickerState {
  isOpen: boolean;
  mode: 'section' | 'block' | null;
  position: { left: number; top: number } | null;
  context?: { sectionId?: string };
}

type ItemSource = 'app' | 'custom';

interface SourcedItem extends Omit<ThemeAsset, 'createdAt' | 'updatedAt'> {
  source: ItemSource;
  createdAt: string;
  updatedAt: string;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { shopId } = await validateShopAccess(request);
  const url = new URL(request.url);
  const host = url.searchParams.get("host")!;

  // Get sections from theme-app-extension/sections
  const sectionFiles = await fs.readdir('extensions/theme-app-extension/sections');
  console.log('Section files found:', sectionFiles);

  const fileSections = await Promise.all(
    sectionFiles.filter(file => file.endsWith('.liquid')).map(async (file) => {
      const name = file.replace('.liquid', '');
      return {
        id: name,
        name: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        type: 'section',
        content: await fs.readFile(`extensions/theme-app-extension/sections/${file}`, 'utf8'),
        settings: '{}',
        template_format: 'liquid',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shopId,
        handle: name,
        renderedHtml: null,
        html: null,
        source: 'app' as const
      };
    })
  );
  console.log('File sections:', fileSections.map(s => ({
    id: s.id,
    name: s.name,
    source: s.source
  })));

  // Get sections from database
  const dbSections = await prisma.themeAsset.findMany({
    where: {
      shopId,
      type: 'section'
    }
  });
  console.log('Database sections:', dbSections);

  const customSections = dbSections.map(section => ({
    ...section,
    source: 'custom' as const,
    createdAt: section.createdAt.toISOString(),
    updatedAt: section.updatedAt.toISOString(),
    name: section.name || section.handle || `Custom Section ${section.id}`
  }));
  console.log('Mapped custom sections:', customSections);

  // Combine sections from both sources
  const availableSections = [...fileSections, ...customSections];
  console.log('All available sections:', availableSections.map(s => ({
    id: s.id,
    name: s.name,
    source: s.source
  })));

  // Get blocks from theme-app-extension/blocks
  const blockFiles = await fs.readdir('extensions/theme-app-extension/blocks');
  const fileBlocks = await Promise.all(
    blockFiles.filter(file => file.endsWith('.liquid')).map(async (file) => {
      const name = file.replace('.liquid', '');
      return {
        id: `${name}-block`,
        name: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        type: 'block',
        content: await fs.readFile(`extensions/theme-app-extension/blocks/${file}`, 'utf8'),
        settings: '{}',
        template_format: 'liquid',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shopId,
        handle: `${name}-block`,
        renderedHtml: null,
        html: null,
        source: 'app' as const
      };
    })
  );

  // Get blocks from database
  const dbBlocks = await prisma.themeAsset.findMany({
    where: {
      shopId,
      type: 'block'
    }
  });

  const customBlocks = dbBlocks.map(block => ({
    ...block,
    source: 'custom' as const,
    createdAt: block.createdAt.toISOString(),
    updatedAt: block.updatedAt.toISOString()
  }));

  // Combine blocks from both sources
  const availableBlocks = [...fileBlocks, ...customBlocks];

  // Get all pages for the selector
  const pages = await prisma.themeAsset.findMany({
    where: {
      shopId,
      type: 'page'
    },
    select: {
      id: true,
      name: true
    }
  });

  // Get the current asset and versions
  const [asset, versions] = await Promise.all([
    prisma.themeAsset.findFirst({
      where: {
        id: params.id,
        shopId
      }
    }),
    prisma.themeAssetVersion.findMany({
      where: {
        themeAssetId: params.id
      },
      orderBy: {
        versionNumber: 'desc'
      }
    })
  ]);

  if (!asset) {
    return redirect(`/app/theme/customize?host=${host}`);
  }

  // Format dates for versions
  const formattedVersions = versions?.map(version => ({
    ...version,
    createdAt: new Date(version.createdAt)
  })) || [];

  return json({
    asset,
    availableSections,
    availableBlocks,
    versions: formattedVersions,
    pages,
    host,
    shop: shopId
  });
};

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get('_action');
  const content = formData.get('content') as string;

  if (!content) {
    return json({ success: false, error: 'No content provided' });
  }

  const assetId = params.id;
  if (!assetId) {
    return json({ success: false, error: 'No asset ID provided' });
  }

  const asset = await prisma.themeAsset.findUnique({
    where: { id: assetId },
    include: {
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 1,
      },
    },
  });

  if (!asset) {
    return json({ success: false, error: 'Asset not found' });
  }

  if (action === 'updatePreview') {
    // Just update the content for preview
    return json({ success: true });
  }

  if (action === 'save') {
    // Create a new version
    const latestVersion = asset.versions[0];
    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Mark all previous versions as not latest
    await prisma.themeAssetVersion.updateMany({
      where: { themeAssetId: assetId },
      data: { isLatest: false },
    });

    // Create new version
    await prisma.themeAssetVersion.create({
      data: {
        themeAssetId: assetId,
        content,
        versionNumber: newVersionNumber,
        isLatest: true,
      },
    });

    // Update the asset content and copy renderedHtml to html
    await prisma.themeAsset.update({
      where: { id: assetId },
      data: { 
        content,
        html: asset.renderedHtml 
      },
    });

    return json({ success: true });
  }

  // ... existing code for other actions ...
}

export default function ThemeCustomizerPage() {
  const { asset, availableSections, availableBlocks, versions, pages, host, shop } = useLoaderData<typeof loader>();
  console.log('Asset content:', {
    id: asset.id,
    content: asset.content,
    handle: asset.handle
  });
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHandleModalOpen, setIsHandleModalOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [handle, setHandle] = useState(asset.handle || '');
  const [handleError, setHandleError] = useState('');
  const submit = useSubmit();
  const navigate = useNavigate();
  const [content, setContent] = useState(asset.content);
  const [hasChanges, setHasChanges] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [pickerState, setPickerState] = useState<PickerState>({
    isOpen: false,
    mode: null,
    position: null,
    context: {}
  });

  const parsedContent = useMemo(() => {
    if (!content) {
      return { sections: [], blocks: [] };
    }
    try {
      const parsed = JSON.parse(content);
      
      // Transform sections object to array using order
      const sectionsArray = parsed.order?.map(sectionId => ({
        id: sectionId,
        ...parsed.sections[sectionId]
      })) || [];

      // Transform blocks from nested in sections to flat array
      const blocksArray = sectionsArray.flatMap(section => {
        const sectionBlocks = section.blocks || {};
        return Object.entries(sectionBlocks).map(([blockId, blockData]: [string, any]) => ({
          id: blockId,
          sectionId: section.id,
          ...blockData
        }));
      });

      return {
        sections: sectionsArray,
        blocks: blocksArray
      };
    } catch (e) {
      console.error('Failed to parse content:', e);
      return { sections: [], blocks: [] };
    }
  }, [content]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setHasChanges(true);
    submit(
      { _action: 'updatePreview', content: newContent },
      { method: 'POST' }
    );
  }, [submit]);

  const handleSave = useCallback(() => {
    const formData = new FormData();
    formData.append('_action', 'save');
    formData.append('content', content);
    
    submit(formData, {
      method: 'POST',
      navigate: false
    });
    setHasChanges(false);
  }, [content, submit]);

  const handlePageChange = useCallback((value: string) => {
    navigate(`/app/theme/customize/${value}?host=${host}`);
  }, [navigate, host]);

  const handlePublish = () => {
    const formData = new FormData();
    formData.append('_action', 'publish');
    formData.append('id', asset.id);
    submit(formData, { method: 'POST' });
  };

  const handleUnpublish = () => {
    const formData = new FormData();
    formData.append('_action', 'unpublish');
    formData.append('id', asset.id);
    submit(formData, { method: 'POST' });
  };

  const handleUpdateHandle = useCallback(() => {
    const formData = new FormData();
    formData.append('_action', 'updateHandle');
    formData.append('handle', handle);
    
    submit(formData, {
      method: 'POST',
      navigate: false
    });
    setIsHandleModalOpen(false);
  }, [handle, submit]);

  const handleRestore = (version: any) => {
    const formData = new FormData();
    formData.append('_action', 'restore');
    formData.append('versionId', version.id);
    submit(formData, { method: 'POST' });
  };

  const handleCompare = (version: any) => {
    // TODO: Implement version comparison
    console.log('Compare version:', version);
  };

  const handlePreview = (version: any) => {
    const previewUrl = `/a/pages/${asset.handle}?preview=true&version=${version.id}&shop=${shop}`;
    window.open(previewUrl, '_blank');
  };

  const getPreviewWidth = () => {
    switch(previewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
    }
  };

  return (
    <Page fullWidth>
      <PublishingBar 
        asset={{
          ...asset,
          createdAt: new Date(asset.createdAt),
          updatedAt: new Date(asset.updatedAt)
        }}
        hasChanges={hasChanges}
        shop={shop}
        onBack={() => navigate(`/app/theme/customize?host=${host}`)}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onSave={handleSave}
        onVersionHistory={() => setIsVersionHistoryOpen(true)}
      />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ 
          width: '300px', 
          borderRight: '1px solid var(--p-border-subdued)',
          background: 'var(--p-surface)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          <div style={{ 
            padding: '1rem', 
            borderBottom: '1px solid var(--p-border-subdued)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{ flex: 1 }}>
              <Select
                label=""
                labelHidden
                options={pages.map(page => ({
                  label: page.name,
                  value: page.id
                }))}
                value={asset.id}
                onChange={handlePageChange}
              />
            </div>
            <Button
              icon={EditIcon}
              onClick={() => setIsHandleModalOpen(true)}
              variant="plain"
              accessibilityLabel="Edit handle"
            />
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <ThemeCustomizer
              sections={parsedContent.sections || []}
              blocks={parsedContent.blocks || []}
              assets={[...availableSections, ...availableBlocks].map(asset => ({
                ...asset,
                createdAt: new Date(asset.createdAt),
                updatedAt: new Date(asset.updatedAt)
              }))}
              onSectionSettingsChange={(sectionId, key, value) => {
                const newContent = { ...parsedContent };
                if (newContent.sections) {
                  const section = newContent.sections.find(s => s.id === sectionId);
                  if (section) {
                    section.settings = section.settings || {};
                    section.settings[key] = value;
                  }
                }
                handleContentChange(JSON.stringify(newContent, null, 2));
              }}
              onBlockSettingsChange={(sectionId, blockId, key, value) => {
                const newContent = { ...parsedContent };
                if (newContent.sections) {
                  const section = newContent.sections.find(s => s.id === sectionId);
                  if (section && section.blocks) {
                    const block = section.blocks.find(b => b.id === blockId);
                    if (block) {
                      block.settings = block.settings || {};
                      block.settings[key] = value;
                    }
                  }
                }
                handleContentChange(JSON.stringify(newContent, null, 2));
              }}
            />
          </div>
        </div>

        {/* Preview */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto', 
          background: 'var(--p-surface)',
          padding: '20px'
        }}>
          <div style={{ 
            width: getPreviewWidth(),
            margin: '0 auto',
            transition: 'width 0.3s ease',
            border: '1px solid var(--p-border-subdued)',
            borderRadius: 'var(--p-border-radius-200)',
            background: '#fff',
            height: 'calc(100vh - 40px)',
            overflow: 'auto'
          }}>
            {isMounted && (
              <PagePreview
                page={{
                  ...asset,
                  content: content
                }}
                sections={availableSections}
                blocks={availableBlocks}
              />
            )}
          </div>
        </div>
      </div>

      <Modal
        open={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        title="Version History"
      >
        <Modal.Section>
          <VersionHistory
            versions={versions.map(v => ({
              ...v,
              createdAt: new Date(v.createdAt)
            }))}
            currentVersionId={versions.find(v => v.isLatest)?.id || ''}
            onRestore={handleRestore}
            onCompare={handleCompare}
            onPreview={handlePreview}
            handle={asset.handle}
          />
        </Modal.Section>
      </Modal>

      <Modal
        open={isHandleModalOpen}
        onClose={() => setIsHandleModalOpen(false)}
        title="Edit Page Handle"
        primaryAction={{
          content: 'Save',
          onAction: handleUpdateHandle
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setIsHandleModalOpen(false)
          }
        ]}
      >
        <Modal.Section>
          <TextField
            label="Handle"
            value={handle}
            onChange={setHandle}
            error={handleError}
            autoComplete="off"
          />
        </Modal.Section>
      </Modal>
    </Page>
  );
}