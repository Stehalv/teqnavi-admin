BEGIN TRY
    BEGIN TRANSACTION;

    -- Drop existing columns from pages table
    ALTER TABLE dbo.pages DROP COLUMN sections;
    ALTER TABLE dbo.pages DROP COLUMN section_order;
    ALTER TABLE dbo.pages DROP COLUMN settings;
    ALTER TABLE dbo.pages DROP COLUMN template;

    -- Add new columns to pages table
    ALTER TABLE dbo.pages ADD
        data NVARCHAR(MAX) NOT NULL DEFAULT '{}',
        templates NVARCHAR(MAX) NOT NULL DEFAULT '{}',
        publishedAt DATETIME2 NULL,
        deletedAt DATETIME2 NULL;

    -- Drop existing columns from page_versions table
    ALTER TABLE dbo.page_versions DROP COLUMN sections;
    ALTER TABLE dbo.page_versions DROP COLUMN section_order;
    ALTER TABLE dbo.page_versions DROP COLUMN settings;
    ALTER TABLE dbo.page_versions DROP COLUMN template;

    -- Add new columns to page_versions table
    ALTER TABLE dbo.page_versions ADD
        data NVARCHAR(MAX) NOT NULL DEFAULT '{}',
        templates NVARCHAR(MAX) NOT NULL DEFAULT '{}';

    -- Add unique constraint for page_versions
    ALTER TABLE dbo.page_versions ADD CONSTRAINT UQ_page_versions_pageId_version UNIQUE (pageId, version);

    -- Note: Data migration from old to new format will be handled in application code during deployment

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    
    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrorState INT = ERROR_STATE();

    RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
END CATCH; 