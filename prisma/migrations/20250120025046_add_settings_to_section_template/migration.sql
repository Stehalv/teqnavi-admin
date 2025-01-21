BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[section_templates] ADD [settings] TEXT NOT NULL CONSTRAINT [section_templates_settings_df] DEFAULT '{}';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
