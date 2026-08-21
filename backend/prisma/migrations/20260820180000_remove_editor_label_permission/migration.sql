-- DropForeignKey
ALTER TABLE `editorlabelpermission` DROP FOREIGN KEY `EditorLabelPermission_editorId_fkey`;

-- DropForeignKey
ALTER TABLE `editorlabelpermission` DROP FOREIGN KEY `EditorLabelPermission_labelId_fkey`;

-- DropTable
DROP TABLE `editorlabelpermission`;
