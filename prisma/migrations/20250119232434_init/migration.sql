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
CREATE TABLE [dbo].[pages] (
    [id] NVARCHAR(1000) NOT NULL,
    [shopId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [handle] NVARCHAR(1000) NOT NULL,
    [isPublished] BIT NOT NULL CONSTRAINT [pages_isPublished_df] DEFAULT 0,
    [data] TEXT NOT NULL CONSTRAINT [pages_data_df] DEFAULT '{}',
    [templates] TEXT NOT NULL CONSTRAINT [pages_templates_df] DEFAULT '{}',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [pages_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [publishedAt] DATETIME2,
    [deletedAt] DATETIME2,
    CONSTRAINT [pages_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [pages_shopId_handle_key] UNIQUE NONCLUSTERED ([shopId],[handle])
);

-- CreateTable
CREATE TABLE [dbo].[page_versions] (
    [id] NVARCHAR(1000) NOT NULL,
    [pageId] NVARCHAR(1000) NOT NULL,
    [version] INT NOT NULL,
    [data] TEXT NOT NULL CONSTRAINT [page_versions_data_df] DEFAULT '{}',
    [templates] TEXT NOT NULL CONSTRAINT [page_versions_templates_df] DEFAULT '{}',
    [message] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [page_versions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(1000),
    [isLatest] BIT NOT NULL CONSTRAINT [page_versions_isLatest_df] DEFAULT 0,
    CONSTRAINT [page_versions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [page_versions_pageId_version_key] UNIQUE NONCLUSTERED ([pageId],[version])
);

-- CreateTable
CREATE TABLE [dbo].[section_templates] (
    [id] NVARCHAR(1000) NOT NULL,
    [shopId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [schema] TEXT NOT NULL,
    [liquid] TEXT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [section_templates_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [section_templates_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [section_templates_shopId_type_key] UNIQUE NONCLUSTERED ([shopId],[type]),
    CONSTRAINT [section_templates_id_shopId_key] UNIQUE NONCLUSTERED ([id],[shopId])
);

-- CreateTable
CREATE TABLE [dbo].[block_templates] (
    [id] NVARCHAR(1000) NOT NULL,
    [sectionTemplateId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [schema] TEXT NOT NULL,
    [liquid] TEXT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [block_templates_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [block_templates_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [block_templates_sectionTemplateId_type_key] UNIQUE NONCLUSTERED ([sectionTemplateId],[type])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [pages_shopId_idx] ON [dbo].[pages]([shopId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [section_templates_shopId_idx] ON [dbo].[section_templates]([shopId]);

-- AddForeignKey
ALTER TABLE [dbo].[page_versions] ADD CONSTRAINT [page_versions_pageId_fkey] FOREIGN KEY ([pageId]) REFERENCES [dbo].[pages]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[block_templates] ADD CONSTRAINT [block_templates_sectionTemplateId_fkey] FOREIGN KEY ([sectionTemplateId]) REFERENCES [dbo].[section_templates]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
