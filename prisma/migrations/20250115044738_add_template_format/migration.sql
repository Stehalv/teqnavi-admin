BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[theme_assets] ADD [template_format] NVARCHAR(1000) CONSTRAINT [theme_assets_template_format_df] DEFAULT 'liquid';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
