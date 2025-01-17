import { ResourceList, ResourceItem, Text, Button, ButtonGroup } from "@shopify/polaris";
import { formatDistanceToNow, format } from "date-fns";

interface ThemeAssetVersion {
  id: string;
  themeAssetId: string;
  versionNumber: number;
  content: string;
  settings: string;
  renderedHtml?: string | null;
  html?: string | null;
  message?: string | null;
  createdAt: Date;
  createdBy?: string | null;
  isLatest: boolean;
}

interface VersionHistoryProps {
  versions: ThemeAssetVersion[];
  currentVersionId: string;
  onRestore: (version: ThemeAssetVersion) => void;
  onCompare: (version: ThemeAssetVersion) => void;
  onPreview: (version: ThemeAssetVersion) => void;
  handle: string;
}

export function VersionHistory({ versions, currentVersionId, onRestore, onCompare, onPreview, handle }: VersionHistoryProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const yesterday = new Date(now.setDate(now.getDate() - 1));
    const versionDate = new Date(date);

    if (versionDate > yesterday) {
      return formatDistanceToNow(versionDate, { addSuffix: true });
    } else {
      return format(versionDate, "'Yesterday at' h:mm a");
    }
  };

  return (
    <ResourceList
      items={versions}
      renderItem={(version) => (
        <ResourceItem
          id={version.id}
          onClick={() => {}}
          accessibilityLabel={`Version ${version.versionNumber}`}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text variant="bodyMd" fontWeight="bold" as="h3">
                Version {version.versionNumber}
              </Text>
              <Text variant="bodySm" tone="subdued" as="p">
                {formatDate(version.createdAt)}
              </Text>
              {version.message && (
                <Text variant="bodySm" as="p">
                  {version.message}
                </Text>
              )}
            </div>
            {version.id !== currentVersionId && (
              <ButtonGroup>
                <Button onClick={() => onPreview(version)}>
                  Preview
                </Button>
                <Button onClick={() => onCompare(version)}>
                  Compare
                </Button>
                <Button onClick={() => onRestore(version)}>
                  Restore
                </Button>
              </ButtonGroup>
            )}
          </div>
        </ResourceItem>
      )}
    />
  );
} 