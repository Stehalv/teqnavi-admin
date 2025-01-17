BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[ThemeAssetVersion] DROP CONSTRAINT [ThemeAssetVersion_themeAssetId_fkey];

-- AddForeignKey
ALTER TABLE [dbo].[ThemeAssetVersion] ADD CONSTRAINT [ThemeAssetVersion_themeAssetId_fkey] FOREIGN KEY ([themeAssetId]) REFERENCES [dbo].[ThemeAsset]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
