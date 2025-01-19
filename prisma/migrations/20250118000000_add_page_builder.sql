BEGIN TRY

BEGIN TRAN;

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
    CONSTRAINT [pages_pkey] PRIMARY KEY CLUSTERED ([id])
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
    CONSTRAINT [page_versions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [pages_shopId_handle_key] ON [dbo].[pages]([shopId], [handle]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [pages_shopId_idx] ON [dbo].[pages]([shopId]);

-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [page_versions_pageId_version_key] ON [dbo].[page_versions]([pageId], [version]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [page_versions_pageId_idx] ON [dbo].[page_versions]([pageId]);

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