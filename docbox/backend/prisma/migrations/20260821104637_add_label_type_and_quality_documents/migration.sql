-- AlterTable
ALTER TABLE `label` ADD COLUMN `type` ENUM('PISO_LAMINADO', 'ACESSORIO', 'DOCUMENTO') NOT NULL DEFAULT 'PISO_LAMINADO';

-- CreateTable
CREATE TABLE `QualityDocument` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('FORMULARIO', 'PROCEDIMENTO_INTERNO') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `storedFileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `uploadedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `QualityDocument_storedFileName_key`(`storedFileName`),
    INDEX `QualityDocument_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QualityDocument` ADD CONSTRAINT `QualityDocument_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
