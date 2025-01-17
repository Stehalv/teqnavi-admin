import { LegacyCard } from "@shopify/polaris";
const { Section } = LegacyCard;
import type { ThemeAsset, SettingValue } from "../types.js";

interface PreviewProps {
  asset: ThemeAsset;
  settings: SettingValue[];
}

export function Preview({ asset, settings }: PreviewProps) {
  const renderComponent = (type: string, settings: any) => {
    // This will be replaced with actual component rendering logic
    return <div data-type={type}>{JSON.stringify(settings)}</div>;
  };

  const renderSection = (section: any) => {
    // Convert blocks object to array if it exists, otherwise use empty array
    const blocksList = section.blocks ? Object.values(section.blocks).filter(Boolean) : [];
    
    return (
      <div>
        {section.type && renderComponent(section.type, section.settings)}
        {blocksList.map((block: any, index: number) => (
          <div key={index}>
            {block.type && renderComponent(block.type, block.settings)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <LegacyCard>
      <Section title="Preview">
        <iframe
          title="Theme Preview"
          src={`/app/theme/preview/${asset.id}?settings=${encodeURIComponent(JSON.stringify(settings))}`}
          style={{ width: '100%', height: '500px', border: 'none' }}
        />
      </Section>
    </LegacyCard>
  );
} 