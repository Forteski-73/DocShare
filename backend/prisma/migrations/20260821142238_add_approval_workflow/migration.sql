-- AlterTable
ALTER TABLE `qualitydocument` ADD COLUMN `approvalStatus` ENUM('PENDENTE_APROVACAO', 'APROVADO', 'NAO_APROVADO') NOT NULL DEFAULT 'APROVADO',
    ADD COLUMN `currentApproverId` VARCHAR(191) NULL,
    ADD COLUMN `currentRequesterId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'EDITOR', 'READER', 'APPROVER') NOT NULL DEFAULT 'READER';

-- CreateTable
CREATE TABLE `DocumentApprovalFlow` (
    `id` VARCHAR(191) NOT NULL,
    `qualityDocumentId` VARCHAR(191) NOT NULL,
    `cycleNumber` INTEGER NOT NULL,
    `status` ENUM('PENDENTE_APROVACAO', 'APROVADO', 'NAO_APROVADO') NOT NULL,
    `approverId` VARCHAR(191) NOT NULL,
    `requesterId` VARCHAR(191) NOT NULL,
    `requesterNote` TEXT NULL,
    `approverNote` TEXT NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `decidedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DocumentApprovalFlow_qualityDocumentId_cycleNumber_key`(`qualityDocumentId`, `cycleNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocumentApprovalHistoryEvent` (
    `id` VARCHAR(191) NOT NULL,
    `qualityDocumentId` VARCHAR(191) NOT NULL,
    `cycleNumber` INTEGER NOT NULL,
    `eventType` ENUM('SOLICITACAO', 'APROVACAO', 'REPROVACAO', 'REENVIO') NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `approverId` VARCHAR(191) NOT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DocumentApprovalHistoryEvent_qualityDocumentId_cycleNumber_idx`(`qualityDocumentId`, `cycleNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailJob` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'DEAD') NOT NULL DEFAULT 'PENDING',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `lastError` TEXT NULL,
    `nextAttemptAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmailJob_status_nextAttemptAt_idx`(`status`, `nextAttemptAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `QualityDocument_approvalStatus_idx` ON `QualityDocument`(`approvalStatus`);

-- CreateIndex
CREATE INDEX `QualityDocument_currentApproverId_idx` ON `QualityDocument`(`currentApproverId`);

-- CreateIndex
CREATE INDEX `QualityDocument_currentRequesterId_idx` ON `QualityDocument`(`currentRequesterId`);

-- AddForeignKey
ALTER TABLE `DocumentApprovalFlow` ADD CONSTRAINT `DocumentApprovalFlow_qualityDocumentId_fkey` FOREIGN KEY (`qualityDocumentId`) REFERENCES `QualityDocument`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentApprovalFlow` ADD CONSTRAINT `DocumentApprovalFlow_approverId_fkey` FOREIGN KEY (`approverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentApprovalFlow` ADD CONSTRAINT `DocumentApprovalFlow_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentApprovalHistoryEvent` ADD CONSTRAINT `DocumentApprovalHistoryEvent_qualityDocumentId_fkey` FOREIGN KEY (`qualityDocumentId`) REFERENCES `QualityDocument`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentApprovalHistoryEvent` ADD CONSTRAINT `DocumentApprovalHistoryEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentApprovalHistoryEvent` ADD CONSTRAINT `DocumentApprovalHistoryEvent_approverId_fkey` FOREIGN KEY (`approverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
