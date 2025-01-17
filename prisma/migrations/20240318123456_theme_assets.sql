-- Add template_format field to theme_assets
ALTER TABLE theme_assets ADD COLUMN template_format VARCHAR(10) NOT NULL DEFAULT 'liquid'; 