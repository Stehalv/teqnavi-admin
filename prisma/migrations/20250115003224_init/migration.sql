BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[theme_assets] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [handle] NVARCHAR(1000),
    [content] TEXT NOT NULL,
    [settings] TEXT,
    [isActive] BIT NOT NULL CONSTRAINT [theme_assets_isActive_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [theme_assets_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [theme_assets_pkey] PRIMARY KEY CLUSTERED ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
