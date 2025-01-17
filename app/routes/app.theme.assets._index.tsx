import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { Page, Layout, Card, ResourceList, ResourceItem, Text, Badge, Button, ButtonGroup, Modal, TextField } from "@shopify/polaris";
import { prisma } from "~/db.server.js";
import { validateShopAccess } from "~/middleware/auth.server.js";
import type { ThemeAsset, JsonifyObject } from "~/features/theme/types.js";
import { useState, useCallback, useEffect } from "react";
import { CodeEditor } from "~/features/theme/components/CodeEditor.js";
import { DeleteIcon, ChevronDownIcon, ChevronUpIcon, ClockIcon } from "@shopify/polaris-icons";
import type { ButtonProps } from "@shopify/polaris";

interface ThemeAssetVersion {
  id: string;
  themeAssetId: string;
  versionNumber: number;
  content: string;
  settings: string;
  message?: string;
  createdAt: string;
  createdBy?: string;
  isLatest: boolean;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { shopId } = await validateShopAccess(request);
  const url = new URL(request.url);
  const host = url.searchParams.get("host")!;

  const [pagesData, sectionsData, blocksData, snippetsData, assetsData] = await Promise.all([
    prisma.themeAsset.findMany({
      where: {
        shopId,
        type: 'page'
      },
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.themeAsset.findMany({
      where: {
        shopId,
        type: 'section'
      },
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.themeAsset.findMany({
      where: {
        shopId,
        type: 'block'
      },
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.themeAsset.findMany({
      where: {
        shopId,
        type: 'snippet'
      },
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.themeAsset.findMany({
      where: {
        shopId,
        type: 'asset'
      },
      orderBy: {
        name: 'asc'
      }
    })
  ]);

  // When an asset is selected, also fetch its versions
  const assetId = url.searchParams.get("assetId");
  let versions = [];
  if (assetId) {
    versions = await prisma.$queryRaw`
      SELECT * FROM [dbo].[ThemeAssetVersion] 
      WHERE themeAssetId = ${assetId} 
      ORDER BY versionNumber DESC
    `;
  }

  // Convert dates to Date objects
  const convertDates = (assets: any[]) => assets.map(asset => ({
    ...asset,
    createdAt: new Date(asset.createdAt),
    updatedAt: new Date(asset.updatedAt)
  }));

  return json({ 
    pages: convertDates(pagesData),
    sections: convertDates(sectionsData),
    blocks: convertDates(blocksData),
    snippets: convertDates(snippetsData),
    assets: convertDates(assetsData),
    versions: versions.map(v => ({
      ...v,
      createdAt: new Date(v.createdAt).toISOString(),
      themeAssetId: v.themeAssetId,
      versionNumber: v.versionNumber,
      isLatest: v.isLatest
    })),
    host
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shopId } = await validateShopAccess(request);
  const formData = await request.formData();
  const action = formData.get('_action');
  const assetId = formData.get('assetId') as string;

  if (action === 'save') {
    try {
      const asset = await prisma.themeAsset.findFirst({
        where: { id: assetId, shopId }
      });

      if (!asset) {
        return json({ error: 'Asset not found' }, { status: 404 });
      }

      const content = formData.get('content');
      if (!content) {
        return json({ error: 'No content provided' }, { status: 400 });
      }

      console.log('Received content for type:', asset.type);

      let processedContent: string;
      if (asset.type === 'page') {
        // For pages, parse and format JSON content
        try {
          const parsedContent = JSON.parse(content.toString());
          processedContent = JSON.stringify(parsedContent, null, 2);
        } catch (parseError) {
          console.error('Error parsing page content:', parseError);
          return json({ 
            error: 'Invalid JSON content for page',
            details: parseError.message
          }, { status: 400 });
        }
      } else {
        // For other assets (sections, blocks, etc.), use raw content
        processedContent = content.toString();
      }

      // Update the asset with the processed content
      await prisma.themeAsset.update({
        where: { id: assetId },
        data: {
          content: processedContent,
          updatedAt: new Date()
        }
      });

      // Create a new version
      const latestVersion = await prisma.themeAssetVersion.findFirst({
        where: { themeAssetId: assetId },
        orderBy: { versionNumber: 'desc' }
      });

      const newVersionNumber = (latestVersion?.versionNumber || 0) + 1;

      // Set all previous versions to not be latest
      await prisma.themeAssetVersion.updateMany({
        where: { themeAssetId: assetId },
        data: { isLatest: false }
      });

      // Create the new version
      await prisma.themeAssetVersion.create({
        data: {
          themeAssetId: assetId,
          versionNumber: newVersionNumber,
          content: processedContent,
          settings: asset.settings,
          isLatest: true,
          createdAt: new Date()
        }
      });

      return json({ success: true });
    } catch (error) {
      console.error('Error saving asset:', error);
      return json({ 
        error: 'Failed to save asset',
        details: error.message
      }, { status: 500 });
    }
  }

  return null;
};

interface LoaderData {
  pages: JsonifyObject<ThemeAsset>[];
  sections: JsonifyObject<ThemeAsset>[];
  blocks: JsonifyObject<ThemeAsset>[];
  snippets: JsonifyObject<ThemeAsset>[];
  assets: JsonifyObject<ThemeAsset>[];
  versions: ThemeAssetVersion[];
  host: string;
}

interface FolderState {
  [key: string]: boolean;
}

export default function ThemeAssets() {
  const { pages, sections, blocks, snippets, assets, versions, host } = useLoaderData<LoaderData>();
  const [selectedAsset, setSelectedAsset] = useState<JsonifyObject<ThemeAsset> | null>(null);
  const [assetContent, setAssetContent] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(false);
  const [isVersionHistoryModalOpen, setIsVersionHistoryModalOpen] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetType, setNewAssetType] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<FolderState>({
    pages: true,
    sections: false,
    blocks: false,
    snippets: false,
    assets: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const [changedAssets, setChangedAssets] = useState<Set<string>>(new Set());

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  const handleEdit = (asset: JsonifyObject<ThemeAsset>) => {
    setSelectedAsset(asset);
    navigate(`/app/theme/assets?host=${host}&assetId=${asset.id}`);
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const assetId = url.searchParams.get("assetId");
    if (assetId) {
      const allAssets = [...pages, ...sections, ...blocks, ...snippets, ...assets];
      const asset = allAssets.find(a => a.id === assetId);
      if (asset) {
        setSelectedAsset(asset);
        setAssetContent(asset.content);
      }
    }
  }, [pages, sections, blocks, snippets, assets]);

  const handleDelete = (asset: JsonifyObject<ThemeAsset>) => {
    setSelectedAsset(asset);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAsset) return;
    
    try {
      await fetch(`/app/theme/assets/${selectedAsset.id}/delete?host=${host}`, {
        method: 'POST'
      });
      setIsDeleteModalOpen(false);
      setSelectedAsset(null);
      navigate(`/app/theme/assets?host=${host}`);
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const handleAddNew = (type: string) => {
    setNewAssetType(type);
    setNewAssetName('');
    setIsNewAssetModalOpen(true);
  };

  const handleCreateAsset = async () => {
    const typeMap: { [key: string]: string } = {
      pages: 'page',
      sections: 'section',
      blocks: 'block',
      snippets: 'snippet',
      assets: 'asset'
    };

    try {
      const formData = new FormData();
      formData.append('name', newAssetName);
      formData.append('type', typeMap[newAssetType]);

      const response = await fetch(`/app/theme/assets/new?host=${host}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setIsNewAssetModalOpen(false);
        navigate(`/app/theme/assets?host=${host}`);
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          console.error('Error creating asset:', error);
        } else {
          const text = await response.text();
          console.error('Server error:', text);
        }
      }
    } catch (error) {
      console.error('Error creating asset:', error);
    }
  };

  const handleRestore = async (version: ThemeAssetVersion) => {
    try {
      const formData = new FormData();
      formData.append('_action', 'restore');
      formData.append('versionId', version.id);
      
      const response = await fetch(`/app/theme/assets/${selectedAsset?.id}/restore?host=${host}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setIsVersionHistoryModalOpen(false);
        navigate(`/app/theme/assets?host=${host}`);
      } else {
        console.error('Error restoring version:', await response.text());
      }
    } catch (error) {
      console.error('Error restoring version:', error);
    }
  };

  const handleContentChange = (content: string) => {
    console.log('Content changed:', content.substring(0, 100) + '...');
    setAssetContent(content);
    if (selectedAsset) {
      handleAssetChange(selectedAsset.id);
    }
  };

  const handleSave = async (asset: JsonifyObject<ThemeAsset>) => {
    setIsSaving(true);
    try {
      console.log('Saving content:', assetContent.substring(0, 100) + '...');
      
      const formData = new FormData();
      formData.append('_action', 'save');
      formData.append('assetId', asset.id);
      formData.append('content', assetContent);

      const response = await fetch(`/app/theme/assets?host=${host}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const responseText = await response.text();
      console.log('Save response:', responseText);

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = JSON.parse(responseText);
          throw new Error(error.error || 'Failed to save');
        } else {
          throw new Error(`Server error: ${responseText}`);
        }
      }

      // Remove from changed assets
      setChangedAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(asset.id);
        return newSet;
      });

      // Use submit instead of navigate to maintain form state
      const searchParams = new URLSearchParams();
      searchParams.set('host', host);
      searchParams.set('assetId', asset.id);
      navigate(`/app/theme/assets?${searchParams.toString()}`);
    } catch (error) {
      console.error('Error saving asset:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssetChange = (assetId: string) => {
    setChangedAssets(prev => {
      const newSet = new Set(prev);
      newSet.add(assetId);
      return newSet;
    });
  };

  const renderFolder = (title: string, assets: JsonifyObject<ThemeAsset>[], type: string) => {
    const isExpanded = expandedFolders[type];
    return (
      <div>
        <button
          onClick={() => toggleFolder(type)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            width: '100%',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--p-text)',
            fontWeight: 'bold'
          }}
        >
          <span style={{ marginRight: '8px' }}>
            {isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </span>
          {title}
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '0.85em', 
            color: 'var(--p-text-subdued)',
            fontWeight: 'normal'
          }}>
            ({assets.length})
          </span>
        </button>
        {isExpanded && (
          <div style={{ paddingLeft: '20px' }}>
            {assets.map(asset => (
              <div 
                key={asset.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  background: selectedAsset?.id === asset.id ? 'var(--p-surface-selected)' : 'none',
                  position: 'relative',
                  paddingRight: '32px'
                }}
                onMouseEnter={() => {
                  const actionButtons = document.getElementById(`actions-${asset.id}`);
                  if (actionButtons) actionButtons.style.opacity = '1';
                }}
                onMouseLeave={() => {
                  const actionButtons = document.getElementById(`actions-${asset.id}`);
                  if (actionButtons) actionButtons.style.opacity = '0';
                }}
              >
                <button
                  onClick={() => handleEdit(asset)}
                  style={{
                    flex: 1,
                    display: 'block',
                    padding: '6px 12px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--p-text)',
                    fontSize: '0.9em'
                  }}
                >
                  {asset.name}
                  {changedAssets.has(asset.id) && (
                    <span style={{ marginLeft: '8px', color: 'var(--p-text-subdued)' }}>*</span>
                  )}
                </button>
                <div
                  id={`actions-${asset.id}`}
                  style={{
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    gap: '4px',
                    zIndex: 1
                  }}
                >
                  {changedAssets.has(asset.id) && (
                    <Button
                      size="slim"
                      onClick={() => {
                        handleSave(asset);
                        setChangedAssets(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(asset.id);
                          return newSet;
                        });
                      }}
                      loading={isSaving && selectedAsset?.id === asset.id}
                    >
                      Save
                    </Button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(asset);
                    }}
                    style={{
                      padding: '6px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: 'var(--p-text-critical)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    aria-label="Delete asset"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => handleAddNew(type)}
              style={{
                display: 'block',
                width: '100%',
                padding: '6px 12px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--p-text-subdued)',
                fontSize: '0.9em',
                fontStyle: 'italic'
              }}
            >
              Add new...
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderAssetList = (assets: JsonifyObject<ThemeAsset>[], type: string) => (
    <ResourceList
      items={assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        asset
      }))}
      renderItem={({ id, name, asset }) => {
        const handleSaveClick: ButtonProps['onClick'] = () => {
          handleSave(asset);
        };

        const handleDeleteClick: ButtonProps['onClick'] = () => {
          handleDelete(asset);
        };

        return (
          <ResourceItem
            id={id}
            accessibilityLabel={`${name} ${type}`}
            name={name}
            onClick={() => handleEdit(asset)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="bodyMd" fontWeight="bold" as="h3">
                {name}
              </Text>
              <ButtonGroup>
                <Button
                  onClick={handleSaveClick}
                  loading={isSaving && selectedAsset?.id === asset.id}
                >
                  Save
                </Button>
                <Button
                  icon={DeleteIcon}
                  onClick={handleDeleteClick}
                />
              </ButtonGroup>
            </div>
          </ResourceItem>
        );
      }}
    />
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--p-border-subdued)', background: 'var(--p-surface)' }}>
        <Text variant="headingLg" as="h1">Code Editor</Text>
      </div>
      
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ 
          width: '250px', 
          borderRight: '1px solid var(--p-border-subdued)',
          background: 'var(--p-surface)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          paddingTop: '50px'
        }}>
          {renderFolder('pages', pages, 'pages')}
          {renderFolder('sections', sections, 'sections')}
          {renderFolder('blocks', blocks, 'blocks')}
          {renderFolder('snippets', snippets, 'snippets')}
          {renderFolder('assets', assets, 'assets')}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedAsset && (
            <>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--p-border-subdued)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="headingMd" as="h2">{selectedAsset.name}</Text>
                <ButtonGroup>
                  {changedAssets.has(selectedAsset.id) && (
                    <Button 
                      variant="primary"
                      onClick={() => handleSave(selectedAsset)}
                      loading={isSaving}
                    >
                      Save
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsVersionHistoryModalOpen(true)}
                    icon={ClockIcon}
                  >
                    Version History
                  </Button>
                  <Button
                    onClick={() => handleDelete(selectedAsset)}
                    icon={DeleteIcon}
                    tone="critical"
                  >
                    Delete
                  </Button>
                </ButtonGroup>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <CodeEditor
                  key={selectedAsset.id}
                  asset={{
                    ...selectedAsset,
                    content: assetContent,
                    createdAt: new Date(selectedAsset.createdAt),
                    updatedAt: new Date(selectedAsset.updatedAt)
                  }}
                  onChange={handleContentChange}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Delete ${selectedAsset?.name}`}
        primaryAction={{
          content: 'Delete',
          destructive: true,
          onAction: handleDeleteConfirm
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setIsDeleteModalOpen(false)
          }
        ]}
      >
        <Modal.Section>
          <p>Are you sure you want to delete this file? This action cannot be undone.</p>
        </Modal.Section>
      </Modal>

      <Modal
        open={isNewAssetModalOpen}
        onClose={() => setIsNewAssetModalOpen(false)}
        title={`New ${newAssetType.slice(0, -1)}`}
        primaryAction={{
          content: 'Create',
          onAction: handleCreateAsset
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setIsNewAssetModalOpen(false)
          }
        ]}
      >
        <Modal.Section>
          <TextField
            label="Name"
            value={newAssetName}
            onChange={setNewAssetName}
            autoComplete="off"
          />
        </Modal.Section>
      </Modal>

      <Modal
        open={isVersionHistoryModalOpen}
        onClose={() => setIsVersionHistoryModalOpen(false)}
        title="Version History"
        size="large"
      >
        <Modal.Section>
          <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
            <ResourceList
              items={versions}
              renderItem={(version: ThemeAssetVersion) => (
                <ResourceItem
                  id={version.id}
                  onClick={() => {}}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text variant="bodyMd" as="h3">
                        Version {version.versionNumber}
                        {version.isLatest && (
                          <Badge tone="success">Latest</Badge>
                        )}
                      </Text>
                      <Text variant="bodySm" as="p" tone="subdued">
                        {new Date(version.createdAt).toLocaleString()}
                      </Text>
                      {version.message && (
                        <Text variant="bodySm" as="p">
                          {version.message}
                        </Text>
                      )}
                    </div>
                    <ButtonGroup>
                      <Button
                        onClick={() => handleRestore(version)}
                      >
                        Restore
                      </Button>
                    </ButtonGroup>
                  </div>
                </ResourceItem>
              )}
            />
          </div>
        </Modal.Section>
      </Modal>
    </div>
  );
} 