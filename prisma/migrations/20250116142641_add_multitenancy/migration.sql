/*
  Warnings:

  - A unique constraint covering the columns `[shopId,handle]` on the table `ThemeAsset` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopId,name,type]` on the table `ThemeAsset` will be added. If there are existing duplicate values, this will fail.
  - Made the column `settings` on table `ThemeAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `template_format` on table `ThemeAsset` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
DROP INDEX [ThemeAsset_handle_idx] ON [dbo].[ThemeAsset];

-- DropIndex
DROP INDEX [ThemeAsset_type_idx] ON [dbo].[ThemeAsset];

-- Update NULL values first
UPDATE [dbo].[ThemeAsset]
SET [settings] = '{}'
WHERE [settings] IS NULL;

UPDATE [dbo].[ThemeAsset]
SET [template_format] = 'liquid'
WHERE [template_format] IS NULL;

-- AlterTable
ALTER TABLE [dbo].[ThemeAsset] ALTER COLUMN [settings] TEXT NOT NULL;
ALTER TABLE [dbo].[ThemeAsset] ALTER COLUMN [template_format] NVARCHAR(1000) NOT NULL;
ALTER TABLE [dbo].[ThemeAsset] ADD CONSTRAINT [ThemeAsset_settings_df] DEFAULT '{}' FOR [settings], CONSTRAINT [ThemeAsset_template_format_df] DEFAULT 'liquid' FOR [template_format];
ALTER TABLE [dbo].[ThemeAsset] ADD [shopId] NVARCHAR(1000) NOT NULL CONSTRAINT [ThemeAsset_shopId_df] DEFAULT 'teqnavi-demo-store-1.myshopify.com';

-- CreateIndex
CREATE NONCLUSTERED INDEX [ThemeAsset_shopId_idx] ON [dbo].[ThemeAsset]([shopId]);

-- CreateIndex
ALTER TABLE [dbo].[ThemeAsset] ADD CONSTRAINT [shopHandle] UNIQUE NONCLUSTERED ([shopId], [handle]);

-- CreateIndex
ALTER TABLE [dbo].[ThemeAsset] ADD CONSTRAINT [shopNameType] UNIQUE NONCLUSTERED ([shopId], [name], [type]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
