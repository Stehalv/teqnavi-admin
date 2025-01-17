BEGIN TRY

BEGIN TRAN;

-- RenameIndex
EXEC SP_RENAME N'dbo.ThemeAsset.shopHandle', N'ThemeAsset_shopId_handle_key', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.ThemeAsset.shopNameType', N'ThemeAsset_shopId_name_type_key', N'INDEX';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
