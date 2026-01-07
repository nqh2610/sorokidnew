-- CreateTable
CREATE TABLE `compete_results` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `arenaId` VARCHAR(191) NOT NULL,
    `correct` INTEGER NOT NULL,
    `totalTime` DOUBLE NOT NULL,
    `stars` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `compete_results_arenaId_correct_totalTime_idx`(`arenaId`, `correct`, `totalTime`),
    UNIQUE INDEX `compete_results_userId_arenaId_key`(`userId`, `arenaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `compete_results` ADD CONSTRAINT `compete_results_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
