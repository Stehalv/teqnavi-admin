import { ButtonGroup, Button, Text } from "@shopify/polaris";
import { Form } from "@remix-run/react";
import { ChevronLeftIcon, DesktopIcon, TabletIcon, MobileIcon } from "@shopify/polaris-icons";

interface PublishingBarProps {
  asset: {
    id: string;
    name: string;
    isActive: boolean;
  };
  hasChanges?: boolean;
  shop: string;
  onBack: () => void;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onPreviewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onSave: () => void;
  onVersionHistory: () => void;
}

export function PublishingBar({ 
  asset, 
  hasChanges, 
  shop, 
  onBack,
  previewMode,
  onPreviewModeChange,
  onPublish,
  onUnpublish,
  onSave,
  onVersionHistory
}: PublishingBarProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "16px", gap: "16px" }}>
      <Text variant="headingLg" as="h1">Page Builder</Text>
      <Button
        icon={ChevronLeftIcon}
        onClick={onBack}
        variant="plain"
      >
        Back
      </Button>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <ButtonGroup>
          <Button
            icon={DesktopIcon}
            pressed={previewMode === 'desktop'}
            onClick={() => onPreviewModeChange('desktop')}
          />
          <Button
            icon={TabletIcon}
            pressed={previewMode === 'tablet'}
            onClick={() => onPreviewModeChange('tablet')}
          />
          <Button
            icon={MobileIcon}
            pressed={previewMode === 'mobile'}
            onClick={() => onPreviewModeChange('mobile')}
          />
        </ButtonGroup>
      </div>
      <div>
        <ButtonGroup>
          {hasChanges && (
            <Form method="post">
              <Button variant="primary" onClick={onSave} submit>
                Save
              </Button>
            </Form>
          )}
          <Button onClick={onVersionHistory}>
            History
          </Button>
          <Button url={`https://${shop}/a/pages/${asset.name.toLowerCase().replace(/\s+/g, '-')}?preview=true`} target="_blank">
            Preview
          </Button>
          {asset.isActive ? (
            <Form method="post">
              <input type="hidden" name="_action" value="unpublish" />
              <Button variant="primary" tone="critical" onClick={onUnpublish} submit>
                Unpublish
              </Button>
            </Form>
          ) : (
            <Form method="post">
              <input type="hidden" name="_action" value="publish" />
              <Button variant="primary" onClick={onPublish} submit>
                Publish
              </Button>
            </Form>
          )}
        </ButtonGroup>
      </div>
    </div>
  );
} 