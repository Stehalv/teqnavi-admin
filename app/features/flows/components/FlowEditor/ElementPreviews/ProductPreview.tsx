import { Card, ResourceList, Thumbnail } from "@shopify/polaris";

interface ProductPreviewProps {
  config: string;
}

export function ProductPreview({ config }: ProductPreviewProps) {
  const parsedConfig = JSON.parse(config);
  
  return (
    <Card>
      <ResourceList
        items={[{
          id: 'preview',
          title: 'Sample Product',
          price: parsedConfig.showPrice ? '$19.99' : '',
          media: <Thumbnail source="" alt="" />
        }]}
        renderItem={(item) => (
          <ResourceList.Item
            id={item.id}
            media={item.media}
            accessibilityLabel={`View details for ${item.title}`}
            name={item.title}
            disabled
            onClick={() => {}}
          />
        )}
      />
    </Card>
  );
} 