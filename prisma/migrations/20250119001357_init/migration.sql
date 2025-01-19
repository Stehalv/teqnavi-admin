BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Session] (
    [id] NVARCHAR(1000) NOT NULL,
    [shop] NVARCHAR(1000) NOT NULL,
    [state] NVARCHAR(1000) NOT NULL,
    [isOnline] BIT NOT NULL CONSTRAINT [Session_isOnline_df] DEFAULT 0,
    [scope] NVARCHAR(1000),
    [expires] DATETIME2,
    [accessToken] NVARCHAR(1000) NOT NULL,
    [userId] BIGINT,
    [firstName] NVARCHAR(1000),
    [lastName] NVARCHAR(1000),
    [email] NVARCHAR(1000),
    [accountOwner] BIT NOT NULL CONSTRAINT [Session_accountOwner_df] DEFAULT 0,
    [locale] NVARCHAR(1000),
    [collaborator] BIT CONSTRAINT [Session_collaborator_df] DEFAULT 0,
    [emailVerified] BIT CONSTRAINT [Session_emailVerified_df] DEFAULT 0,
    CONSTRAINT [Session_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[enrollment_flows] (
    [id] NVARCHAR(1000) NOT NULL,
    [shopId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [enrollment_flows_isActive_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [enrollment_flows_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [enrollment_flows_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[steps] (
    [id] NVARCHAR(1000) NOT NULL,
    [flowId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [order] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [steps_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [steps_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[elements] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [label] NVARCHAR(1000) NOT NULL,
    [config] NVARCHAR(1000) NOT NULL CONSTRAINT [elements_config_df] DEFAULT '{}',
    [order] INT NOT NULL,
    [flowId] NVARCHAR(1000) NOT NULL,
    [stepId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [elements_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [elements_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ThemeAsset] (
    [id] NVARCHAR(1000) NOT NULL,
    [shopId] NVARCHAR(1000) NOT NULL CONSTRAINT [ThemeAsset_shopId_df] DEFAULT 'teqnavi-demo-store-1.myshopify.com',
    [type] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [handle] NVARCHAR(1000),
    [content] TEXT NOT NULL,
    [settings] TEXT NOT NULL CONSTRAINT [ThemeAsset_settings_df] DEFAULT '{}',
    [template_format] NVARCHAR(1000) NOT NULL CONSTRAINT [ThemeAsset_template_format_df] DEFAULT 'liquid',
    [isActive] BIT NOT NULL CONSTRAINT [ThemeAsset_isActive_df] DEFAULT 0,
    [renderedHtml] TEXT,
    [html] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ThemeAsset_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ThemeAsset_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ThemeAsset_shopId_handle_key] UNIQUE NONCLUSTERED ([shopId],[handle]),
    CONSTRAINT [ThemeAsset_shopId_name_type_key] UNIQUE NONCLUSTERED ([shopId],[name],[type])
);

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
    CONSTRAINT [ThemeAssetVersion_themeAssetId_versionNumber_key] UNIQUE NONCLUSTERED ([themeAssetId],[versionNumber])
);

-- CreateTable
CREATE TABLE [dbo].[pages] (
    [id] NVARCHAR(1000) NOT NULL,
    [shopId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [handle] NVARCHAR(1000) NOT NULL,
    [template] NVARCHAR(1000) NOT NULL CONSTRAINT [pages_template_df] DEFAULT 'page',
    [sections] TEXT NOT NULL CONSTRAINT [pages_sections_df] DEFAULT '{}',
    [section_order] TEXT NOT NULL CONSTRAINT [pages_section_order_df] DEFAULT '[]',
    [settings] TEXT NOT NULL CONSTRAINT [pages_settings_df] DEFAULT '{}',
    [isPublished] BIT NOT NULL CONSTRAINT [pages_isPublished_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [pages_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [pages_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [pages_shopId_handle_key] UNIQUE NONCLUSTERED ([shopId],[handle])
);

-- CreateTable
CREATE TABLE [dbo].[page_versions] (
    [id] NVARCHAR(1000) NOT NULL,
    [pageId] NVARCHAR(1000) NOT NULL,
    [version] INT NOT NULL,
    [sections] TEXT NOT NULL CONSTRAINT [page_versions_sections_df] DEFAULT '{}',
    [section_order] TEXT NOT NULL CONSTRAINT [page_versions_section_order_df] DEFAULT '[]',
    [settings] TEXT NOT NULL CONSTRAINT [page_versions_settings_df] DEFAULT '{}',
    [message] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [page_versions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(1000),
    [isLatest] BIT NOT NULL CONSTRAINT [page_versions_isLatest_df] DEFAULT 0,
    CONSTRAINT [page_versions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [page_versions_pageId_version_key] UNIQUE NONCLUSTERED ([pageId],[version])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ThemeAsset_shopId_idx] ON [dbo].[ThemeAsset]([shopId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ThemeAssetVersion_themeAssetId_idx] ON [dbo].[ThemeAssetVersion]([themeAssetId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [pages_shopId_idx] ON [dbo].[pages]([shopId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [page_versions_pageId_idx] ON [dbo].[page_versions]([pageId]);

-- AddForeignKey
ALTER TABLE [dbo].[steps] ADD CONSTRAINT [steps_flowId_fkey] FOREIGN KEY ([flowId]) REFERENCES [dbo].[enrollment_flows]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[elements] ADD CONSTRAINT [elements_flowId_fkey] FOREIGN KEY ([flowId]) REFERENCES [dbo].[enrollment_flows]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[elements] ADD CONSTRAINT [elements_stepId_fkey] FOREIGN KEY ([stepId]) REFERENCES [dbo].[steps]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ThemeAssetVersion] ADD CONSTRAINT [ThemeAssetVersion_themeAssetId_fkey] FOREIGN KEY ([themeAssetId]) REFERENCES [dbo].[ThemeAsset]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[page_versions] ADD CONSTRAINT [page_versions_pageId_fkey] FOREIGN KEY ([pageId]) REFERENCES [dbo].[pages]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
