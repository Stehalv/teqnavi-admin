import React, { memo, useCallback, useState, useRef } from 'react';
import {
  DropZone,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Spinner,
  Thumbnail,
  TextField,
  Banner
} from '@shopify/polaris';
import type {
  ImagePickerField,
  VideoField,
  VideoUrlField,
  BaseSettingField
} from '../../../../types/settings.js';
import styles from '../../SettingsPanel.module.css';

interface MediaInputProps<T extends BaseSettingField> {
  field: T;
  value: string;
  onChange: (value: string) => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB default

export const ImagePickerInput = memo(function ImagePickerInput({
  field,
  value,
  onChange
}: MediaInputProps<ImagePickerField>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleDrop([files[0]]);
    }
  }, []);

  const handleDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (field.maxSize && file.size > field.maxSize) {
      setError(`File size exceeds ${field.maxSize / (1024 * 1024)}MB limit`);
      return;
    }

    if (field.allowedTypes && !field.allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed types: ${field.allowedTypes.join(', ')}`);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
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
  }, [field.maxSize, field.allowedTypes, onChange]);

  const handleRemove = useCallback(() => {
    onChange('');
    setError(undefined);
  }, [onChange]);

  const handleReplace = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <BlockStack gap="200">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={field.allowedTypes?.join(', ') || 'image/*'}
        style={{ display: 'none' }}
      />

      <Text as="span" variant="bodyMd">
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </Text>

      {error && (
        <Banner tone="critical" onDismiss={() => setError(undefined)}>
          <p>{error}</p>
        </Banner>
      )}
      
      {value ? (
        <div className={styles.preview}>
          <img src={value} alt={field.label} style={field.aspectRatio ? { aspectRatio: String(field.aspectRatio) } : undefined} />
          <InlineStack gap="200">
            <Button onClick={handleReplace}>
              Replace Image
            </Button>
            <Button tone="critical" variant="plain" onClick={handleRemove}>
              Remove
            </Button>
          </InlineStack>
        </div>
      ) : (
        <DropZone
          onDrop={handleDrop}
          allowMultiple={false}
          overlayText="Drop image to upload"
          errorOverlayText="File type not accepted"
          type="image"
          onClick={handleReplace}
        >
          {isLoading ? (
            <div className={styles.loadingOverlay}>
              <Spinner size="large" />
              <Text as="span">Uploading...</Text>
            </div>
          ) : null}
        </DropZone>
      )}

      {field.helpText && (
        <Text as="span" variant="bodySm" tone="subdued">
          {field.helpText}
        </Text>
      )}
    </BlockStack>
  );
});

export const VideoInput = memo(function VideoInput({
  field,
  value,
  onChange
}: MediaInputProps<VideoField>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (field.maxSize && file.size > field.maxSize) {
      setError(`File size exceeds ${field.maxSize / (1024 * 1024)}MB limit`);
      return;
    }

    if (field.allowedTypes && !field.allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed types: ${field.allowedTypes.join(', ')}`);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
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
  }, [field.maxSize, field.allowedTypes, onChange]);

  const handleRemove = useCallback(() => {
    onChange('');
    setError(undefined);
  }, [onChange]);

  return (
    <BlockStack gap="200">
      <Text as="span" variant="bodyMd">
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </Text>

      {error && (
        <Banner tone="critical" onDismiss={() => setError(undefined)}>
          <p>{error}</p>
        </Banner>
      )}

      {value ? (
        <BlockStack gap="200">
          <video
            src={value}
            controls
            style={{ width: '100%', maxWidth: '600px' }}
          />
          <InlineStack gap="200">
            <Button onClick={() => document.getElementById(`dropzone-${field.id}`)?.click()}>
              Replace Video
            </Button>
            <Button tone="critical" onClick={handleRemove}>
              Remove
            </Button>
          </InlineStack>
        </BlockStack>
      ) : (
        <DropZone
          id={`dropzone-${field.id}`}
          accept={field.allowedTypes?.join(', ') || 'video/*'}
          onDrop={handleDrop}
          allowMultiple={false}
          overlayText="Drop video to upload"
          errorOverlayText="File type not accepted"
          type="video"
        >
          {isLoading ? (
            <BlockStack gap="200" align="center">
              <Spinner size="large" />
              <Text as="span">Uploading...</Text>
            </BlockStack>
          ) : null}
        </DropZone>
      )}

      {field.helpText && (
        <Text as="span" variant="bodySm" tone="subdued">
          {field.helpText}
        </Text>
      )}
    </BlockStack>
  );
});

export const VideoUrlInput = memo(function VideoUrlInput({
  field,
  value,
  onChange
}: MediaInputProps<VideoUrlField>) {
  const [error, setError] = useState<string>();

  const validateUrl = useCallback((url: string) => {
    if (!url) return true;

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+$/;

    if (field.accept?.includes('youtube') && youtubeRegex.test(url)) return true;
    if (field.accept?.includes('vimeo') && vimeoRegex.test(url)) return true;

    return false;
  }, [field.accept]);

  const handleChange = useCallback((url: string) => {
    if (!validateUrl(url)) {
      setError('Invalid video URL. Please enter a valid YouTube or Vimeo URL.');
      return;
    }

    setError(undefined);
    onChange(url);
  }, [validateUrl, onChange]);

  return (
    <BlockStack gap="200">
      <TextField
        label={
          <>
            {field.label}
            {field.required && <span className={styles.required}>*</span>}
          </>
        }
        value={value}
        onChange={handleChange}
        error={error}
        autoComplete="off"
        placeholder="Enter YouTube or Vimeo URL"
        helpText={field.helpText}
      />
    </BlockStack>
  );
}); 