import React, { memo, useCallback, useState } from 'react';
import {
  Button,
  Box,
  Text,
  Modal,
  ResourceList,
  ResourceItem,
  Thumbnail,
  TextField,
  EmptyState,
  Spinner,
  BlockStack
} from '@shopify/polaris';
import type {
  ArticleField,
  BlogField,
  CollectionField,
  CollectionListField,
  PageField,
  ProductField,
  ProductListField,
  BaseSettingField
} from '../../../../types/settings.js';
import styles from '../../SettingsPanel.module.css';

interface ResourcePickerProps<T extends BaseSettingField> {
  field: T;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

interface Resource {
  id: string;
  title: string;
  image?: string;
}

const useResourcePicker = (resourceType: string) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);

  const handleSearch = useCallback(async (value: string) => {
    setIsLoading(true);
    // TODO: Implement actual API call to search resources
    // This is a mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResources([
      { id: '1', title: 'Mock Resource 1', image: '' },
      { id: '2', title: 'Mock Resource 2', image: '' }
    ]);
    setIsLoading(false);
  }, []);

  return {
    isOpen,
    setIsOpen,
    searchValue,
    setSearchValue,
    isLoading,
    resources,
    handleSearch
  };
};

const ResourcePickerModal = memo(function ResourcePickerModal({
  open,
  onClose,
  title,
  resourceType,
  onSelect,
  multiple = false
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  resourceType: string;
  onSelect: (value: string | string[]) => void;
  multiple?: boolean;
}) {
  const {
    searchValue,
    setSearchValue,
    isLoading,
    resources,
    handleSearch
  } = useResourcePicker(resourceType);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    handleSearch(value);
  }, [handleSearch]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={{
        content: 'Select',
        onAction: onClose
      }}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <TextField
            label="Search"
            value={searchValue}
            onChange={handleSearchChange}
            autoComplete="off"
          />

          {isLoading ? (
            <Box padding="400">
              <Spinner accessibilityLabel="Loading resources" size="large" />
            </Box>
          ) : resources.length > 0 ? (
            <ResourceList
              resourceName={{ singular: resourceType, plural: `${resourceType}s` }}
              items={resources}
              renderItem={(item) => (
                <ResourceItem
                  id={item.id}
                  onClick={() => {
                    onSelect(multiple ? [item.id] : item.id);
                    onClose();
                  }}
                  media={
                    <Thumbnail
                      source={item.image || ''}
                      alt={item.title}
                      size="small"
                    />
                  }
                >
                  <Text variant="bodyMd" as="h3">
                    {item.title}
                  </Text>
                </ResourceItem>
              )}
            />
          ) : (
            <EmptyState
              heading="No resources found"
              image=""
            >
              <p>Try changing your search terms</p>
            </EmptyState>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
});

const BaseResourcePicker = memo(function BaseResourcePicker<T extends BaseSettingField>({
  field,
  value,
  onChange,
  resourceType,
  multiple = false
}: ResourcePickerProps<T> & { resourceType: string; multiple?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BlockStack gap="200">
      <Text as="span" variant="bodyMd">
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </Text>
      
      <Button onClick={() => setIsOpen(true)}>
        {value ? 'Change' : `Select ${resourceType}`}
      </Button>

      {value && (
        <Text as="span" variant="bodySm" tone="subdued">
          Selected: {Array.isArray(value) ? value.join(', ') : value}
        </Text>
      )}

      <ResourcePickerModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Select ${resourceType}`}
        resourceType={resourceType}
        onSelect={onChange}
        multiple={multiple}
      />
    </BlockStack>
  );
});

export const ArticlePicker = memo(function ArticlePicker(props: ResourcePickerProps<ArticleField>) {
  return <BaseResourcePicker {...props} resourceType="article" />;
});

export const BlogPicker = memo(function BlogPicker(props: ResourcePickerProps<BlogField>) {
  return <BaseResourcePicker {...props} resourceType="blog" />;
});

export const CollectionPicker = memo(function CollectionPicker(props: ResourcePickerProps<CollectionField>) {
  return <BaseResourcePicker {...props} resourceType="collection" />;
});

export const CollectionListPicker = memo(function CollectionListPicker(props: ResourcePickerProps<CollectionListField>) {
  return <BaseResourcePicker {...props} resourceType="collection" multiple />;
});

export const PagePicker = memo(function PagePicker(props: ResourcePickerProps<PageField>) {
  return <BaseResourcePicker {...props} resourceType="page" />;
});

export const ProductPicker = memo(function ProductPicker(props: ResourcePickerProps<ProductField>) {
  return <BaseResourcePicker {...props} resourceType="product" />;
});

export const ProductListPicker = memo(function ProductListPicker(props: ResourcePickerProps<ProductListField>) {
  return <BaseResourcePicker {...props} resourceType="product" multiple />;
}); 