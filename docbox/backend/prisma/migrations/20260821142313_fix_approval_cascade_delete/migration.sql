-- DropForeignKey
ALTER TABLE `documentapprovalflow` DROP FOREIGN KEY `DocumentApprovalFlow_qualityDocumentId_fkey`;

-- DropForeignKey
ALTER TABLE `documentapprovalhistoryevent` DROP FOREIGN KEY `DocumentApprovalHistoryEvent_qualityDocumentId_fkey`;

-- AddForeignKey
ALTER TABLE `DocumentApprovalFlow` ADD CONSTRAINT `DocumentApprovalFlow_qualityDocumentId_fkey` FOREIGN KEY (`qualityDocumentId`) REFERENCES `QualityDocument`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentApprovalHistoryEvent` ADD CONSTRAINT `DocumentApprovalHistoryEvent_qualityDocumentId_fkey` FOREIGN KEY (`qualityDocumentId`) REFERENCES `QualityDocument`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
