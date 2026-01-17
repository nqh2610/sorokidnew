-- Migration: Add international payment fields to payment_orders table
-- Date: 2026-01-17
-- Description: Add fields to support LemonSqueezy international payments

-- Add new columns to payment_orders table
ALTER TABLE `payment_orders` 
ADD COLUMN `amountUsd` DOUBLE NULL AFTER `amount`,
ADD COLUMN `completedAt` DATETIME(3) NULL AFTER `paidAt`,
ADD COLUMN `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'vietqr' AFTER `transactionType`,
ADD COLUMN `externalOrderId` VARCHAR(191) NULL AFTER `paymentMethod`;

-- Make expiresAt nullable (LemonSqueezy orders don't have expiration)
ALTER TABLE `payment_orders` 
MODIFY COLUMN `expiresAt` DATETIME(3) NULL;

-- Add indexes for new columns
CREATE INDEX `payment_orders_paymentMethod_idx` ON `payment_orders`(`paymentMethod`);
CREATE INDEX `payment_orders_externalOrderId_idx` ON `payment_orders`(`externalOrderId`);

-- Verify the changes
DESCRIBE `payment_orders`;
