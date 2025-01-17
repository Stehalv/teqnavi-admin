/*
  Warnings:

  - You are about to drop the `theme_assets` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropTable
DROP TABLE [dbo].[theme_assets];

-- CreateTable
CREATE TABLE [dbo].[ThemeAsset] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [handle] NVARCHAR(1000),
    [content] TEXT NOT NULL,
    [settings] TEXT,
    [template_format] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [ThemeAsset_isActive_df] DEFAULT 0,
    [renderedHtml] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ThemeAsset_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ThemeAsset_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ThemeAsset_type_idx] ON [dbo].[ThemeAsset]([type]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ThemeAsset_handle_idx] ON [dbo].[ThemeAsset]([handle]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
