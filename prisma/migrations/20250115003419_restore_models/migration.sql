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
CREATE TABLE [dbo].[enrollment_flows] (
    [id] NVARCHAR(1000) NOT NULL,
    [shopId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [enrollment_flows_isActive_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [enrollment_flows_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [enrollment_flows_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[steps] (
    [id] NVARCHAR(1000) NOT NULL,
    [flowId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [order] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [steps_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [steps_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[elements] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [label] NVARCHAR(1000) NOT NULL,
    [config] NVARCHAR(1000) NOT NULL CONSTRAINT [elements_config_df] DEFAULT '{}',
    [order] INT NOT NULL,
    [flowId] NVARCHAR(1000) NOT NULL,
    [stepId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [elements_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [elements_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[steps] ADD CONSTRAINT [steps_flowId_fkey] FOREIGN KEY ([flowId]) REFERENCES [dbo].[enrollment_flows]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[elements] ADD CONSTRAINT [elements_flowId_fkey] FOREIGN KEY ([flowId]) REFERENCES [dbo].[enrollment_flows]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[elements] ADD CONSTRAINT [elements_stepId_fkey] FOREIGN KEY ([stepId]) REFERENCES [dbo].[steps]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
