import React, { memo, useState, useCallback } from 'react';
import { DropZone, Spinner, Text, Button, InlineStack, BlockStack, Banner } from '@shopify/polaris';
import styles from './ImageUploader.module.css';

interface ImageUploaderProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  maxSize?: number;
  aspectRatio?: number;
  allowedTypes?: string[];
  helpText?: string;
  required?: boolean;
}

export const ImageUploader = memo(({
  label,
  value,
  onChange,
  maxSize = 5 * 1024 * 1024, // 5MB default
  aspectRatio,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  helpText,
  required,
}: ImageUploaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | undefined => {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`;
    }
    if (file.size > maxSize) {
      return `File size exceeds ${maxSize / (1024 * 1024)}MB limit`;
    }
    return undefined;
  };

  const handleDrop = useCallback(async (_dropFiles: File[], acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        onChange(base64String);
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to read file');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process file');
      setIsLoading(false);
    }
  }, [onChange, maxSize, allowedTypes]);

  const handleRemove = useCallback(() => {
    onChange('');
    setError(undefined);
  }, [onChange]);

  const handleDragEnter = useCallback(() => setIsDragging(true), []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  return (
    <BlockStack gap="200">
      {error && (
        <Banner tone="critical" onDismiss={() => setError(undefined)}>
          <p>{error}</p>
        </Banner>
      )}
      
      {value ? (
        <div className={styles.preview}>
          <img src={value} alt={label} style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined} />
          <InlineStack gap="200">
            <Button onClick={() => document.getElementById(`dropzone-${label}`)?.click()}>
              Replace Image
            </Button>
            <Button tone="critical" variant="plain" onClick={handleRemove}>
              Remove
            </Button>
          </InlineStack>
        </div>
      ) : (
        <DropZone
          id={`dropzone-${label}`}
          label={
            <BlockStack gap="200">
              <Text as="span" variant="bodyMd">
                {label} {required && <Text tone="critical" as="span">*</Text>}
              </Text>
              {helpText && <Text as="span" tone="subdued" variant="bodySm">{helpText}</Text>}
            </BlockStack>
          }
          accept={allowedTypes.join(', ')}
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          allowMultiple={false}
          overlayText="Drop image to upload"
          errorOverlayText="File type not accepted"
          type="image"
        >
          {isLoading ? (
            <div className={styles.loadingOverlay}>
              <Spinner size="large" />
              <Text as="span">Uploading...</Text>
            </div>
          ) : null}
        </DropZone>
      )}
    </BlockStack>
  );
}); 