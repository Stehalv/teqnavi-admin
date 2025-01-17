-- CreateTable
CREATE TABLE [dbo].[ThemeAssetVersion] (
    [id] NVARCHAR(1000) NOT NULL,
    [themeAssetId] NVARCHAR(1000) NOT NULL,
    [versionNumber] INT NOT NULL,
    [content] TEXT NOT NULL,
    [settings] TEXT NOT NULL CONSTRAINT [ThemeAssetVersion_settings_df] DEFAULT '{}',
    [renderedHtml] TEXT,
    [html] TEXT,
    [message] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ThemeAssetVersion_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(1000),
    [isLatest] BIT NOT NULL CONSTRAINT [ThemeAssetVersion_isLatest_df] DEFAULT 0,
    CONSTRAINT [ThemeAssetVersion_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ThemeAssetVersion_themeAssetId_fkey] FOREIGN KEY ([themeAssetId]) REFERENCES [dbo].[ThemeAsset]([id]) ON DELETE CASCADE
);

-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [ThemeAssetVersion_themeAssetId_versionNumber_key] ON [dbo].[ThemeAssetVersion]([themeAssetId], [versionNumber]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ThemeAssetVersion_themeAssetId_idx] ON [dbo].[ThemeAssetVersion]([themeAssetId]);

-- Create initial versions for existing theme assets
INSERT INTO [dbo].[ThemeAssetVersion] (
    [id],
    [themeAssetId],
    [versionNumber],
    [content],
    [settings],
    [renderedHtml],
    [html],
    [createdAt],
    [isLatest]
)
SELECT 
    CONCAT(ta.[id], '-v1'),
    ta.[id],
    1,
    ta.[content],
    ta.[settings],
    ta.[renderedHtml],
    ta.[html],
    ta.[createdAt],
    1
FROM [dbo].[ThemeAsset] ta; 