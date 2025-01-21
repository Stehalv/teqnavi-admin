/*
  Warnings:

  - You are about to drop the column `snippets` on the `section_templates` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- First drop the default constraint
DECLARE @ConstraintName nvarchar(200);
SELECT @ConstraintName = name
FROM sys.default_constraints
WHERE parent_object_id = object_id('section_templates')
AND col_name(parent_object_id, parent_column_id) = 'snippets';

IF @ConstraintName IS NOT NULL
    EXECUTE('ALTER TABLE section_templates DROP CONSTRAINT ' + @ConstraintName);

-- Then drop the column
ALTER TABLE section_templates DROP COLUMN snippets;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
