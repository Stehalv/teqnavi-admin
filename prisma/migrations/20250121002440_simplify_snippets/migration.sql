BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[snippets] (
    [id] NVARCHAR(1000) NOT NULL,
    [shopId] NVARCHAR(1000) NOT NULL,
    [key] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [liquid] TEXT NOT NULL,
    [isGlobal] BIT NOT NULL CONSTRAINT [snippets_isGlobal_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [snippets_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [snippets_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [snippets_shopId_key_key] UNIQUE NONCLUSTERED ([shopId],[key])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [snippets_shopId_idx] ON [dbo].[snippets]([shopId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [snippets_key_idx] ON [dbo].[snippets]([key]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
