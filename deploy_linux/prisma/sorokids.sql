-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th12 07, 2025 lúc 03:03 PM
-- Phiên bản máy phục vụ: 8.0.30
-- Phiên bản PHP: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `sorokids`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `achievements`
--

CREATE TABLE `achievements` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirement` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stars` int NOT NULL DEFAULT '0',
  `diamonds` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `achievements`
--

INSERT INTO `achievements` (`id`, `name`, `description`, `icon`, `category`, `requirement`, `stars`, `diamonds`, `createdAt`) VALUES
('094a4ef2-688a-4c4a-b93a-d1d5cfd82ba1', '⚔️ Kiếm sĩ Soroban', 'Hoàn thành 50 bài tập', '⚔️', 'practice', '{\"type\":\"complete_exercises\",\"count\":50}', 25, 8, '2025-12-02 07:50:00.836'),
('14149bed-6252-48ce-a7bf-def6caf75cf9', '⚡ Tia chớp nhỏ', 'Hoàn thành 1 bài tập trong dưới 3 giây', '⚡', 'speed', '{\"type\":\"fast_exercise\",\"timeLimit\":3,\"count\":1}', 10, 3, '2025-12-02 07:50:00.862'),
('19790820-f051-42c8-bde3-fd32cb922a92', '💪 Chiến binh tập sự', 'Hoàn thành 20 bài tập', '💪', 'practice', '{\"type\":\"complete_exercises\",\"count\":20}', 15, 3, '2025-12-02 07:50:00.833'),
('25978449-6a13-45a8-803e-934f35b6a0d7', '🔥🔥 Lửa cháy rực', 'Học 7 ngày liên tiếp - Một tuần không nghỉ!', '🔥', 'streak', '{\"type\":\"streak\",\"count\":7}', 20, 10, '2025-12-02 07:50:00.877'),
('28c4833a-c3ef-42b3-8bd5-90838353eb59', '🥈 Chiến binh bạc', 'Tham gia 25 trận thi đấu', '🥈', 'compete', '{\"type\":\"compete_matches\",\"count\":25}', 35, 20, '2025-12-02 07:50:00.901'),
('2e39fa3b-42d9-484a-8754-507b260a7091', '✋ Năm ngón đầu tiên', 'Hoàn thành 5 bài tập - Làm chủ 5 hạt dưới của Soroban', '✋', 'beginner', '{\"type\":\"complete_exercises\",\"count\":5}', 5, 1, '2025-12-02 07:50:00.809'),
('2ecf1ff5-7ca4-441a-b769-b7c3e54589b6', '🏆 Quán quân đấu trường', 'Đạt hạng 1 trong 5 trận thi đấu', '🏆', 'compete', '{\"type\":\"compete_first_place\",\"count\":5}', 50, 30, '2025-12-02 07:50:00.908'),
('38c742e6-f8d4-44f3-8c4d-f25219842a17', '🔥 Ngọn lửa nhỏ', 'Học 3 ngày liên tiếp', '🔥', 'streak', '{\"type\":\"streak\",\"count\":3}', 10, 3, '2025-12-02 07:50:00.874'),
('39e7cfef-3d23-4319-8c01-4e274d707881', '📖 Môn đồ Soroban', 'Hoàn thành 5 bài học - Bạn đã bước vào con đường học Soroban', '📖', 'learning', '{\"type\":\"complete_lessons\",\"count\":5}', 20, 5, '2025-12-02 07:50:00.815'),
('3b845cba-7893-4a88-ad10-9fede81d234c', '💎 Kim cương không tì vết', 'Đạt 100% chính xác trong 50 bài tập', '💎', 'accuracy', '{\"type\":\"perfect_exercises\",\"count\":50}', 50, 25, '2025-12-02 07:50:00.856'),
('4b50fca2-6822-4938-8920-0d27be6dfa5b', '🐉 Rồng luyện công', 'Hoàn thành 200 bài tập', '🐉', 'practice', '{\"type\":\"complete_exercises\",\"count\":200}', 60, 30, '2025-12-02 07:50:00.844'),
('4c4dcc86-dd6b-498e-87a4-d62a2b9e49e3', '🥷 Ninja số học', 'Hoàn thành 100 bài tập', '🥷', 'practice', '{\"type\":\"complete_exercises\",\"count\":100}', 40, 15, '2025-12-02 07:50:00.841'),
('5d02a3e3-52aa-4aaf-b3b6-eb937bd46713', '👑 Vua đấu trường', 'Đạt hạng 1 trong 20 trận thi đấu', '👑', 'compete', '{\"type\":\"compete_first_place\",\"count\":20}', 100, 80, '2025-12-02 07:50:00.912'),
('5d3c82a9-6432-4183-af66-4089741c527f', '🎯 Phát súng đầu tiên', 'Đạt 100% chính xác trong 1 bài tập', '🎯', 'beginner', '{\"type\":\"perfect_exercise\",\"count\":1}', 8, 2, '2025-12-02 07:50:00.812'),
('5ec15a91-0429-4d14-9f9b-fe14ab4b3d73', '🎊 Người tiên phong', 'Là một trong 100 người dùng đầu tiên', '🎊', 'special', '{\"type\":\"early_adopter\",\"rank\":100}', 50, 50, '2025-12-02 07:50:00.932'),
('64ec83b9-5cb7-4366-a33f-f5a6636f5576', '🎂 Sinh nhật vui vẻ', 'Đăng nhập vào ngày sinh nhật', '🎂', 'special', '{\"type\":\"birthday_login\"}', 20, 10, '2025-12-02 07:50:00.929'),
('6623ee2a-8a48-4bf2-b373-68b03096d8e8', '🌪️ Cơn bão Soroban', 'Hoàn thành 20 bài tập trong 1 phút', '🌪️', 'speed', '{\"type\":\"speed_rush\",\"exercises\":20,\"timeLimit\":60}', 50, 25, '2025-12-02 07:50:00.868'),
('6f8d23df-745a-4406-a712-0e453f4b3442', '⭐ Ba sao hoàn hảo', 'Đạt 3 sao trong 5 bài học', '⭐', 'mastery', '{\"type\":\"three_star_lessons\",\"count\":5}', 20, 8, '2025-12-02 07:50:00.916'),
('778b1e1b-0276-4b72-bb44-3a8549843ac2', '🦄 Huyền thoại SoroKids', 'Mở khóa tất cả thành tích - Bạn là huyền thoại!', '🦄', 'special', '{\"type\":\"unlock_all_achievements\"}', 200, 500, '2025-12-02 07:50:00.939'),
('83d0cbbb-010d-49c1-916b-629c6e553c1e', '🏛️ Tiến sĩ Abacus', 'Hoàn thành tất cả bài học - Bạn là bậc thầy Soroban!', '🏛️', 'learning', '{\"type\":\"complete_all_lessons\"}', 150, 100, '2025-12-02 07:50:00.829'),
('857d790f-f686-49ea-ad20-e8dd92e69837', '👨‍🏫 Thạc sĩ tính nhẩm', 'Hoàn thành 30 bài học - Bạn có thể dạy lại người khác', '👨‍🏫', 'learning', '{\"type\":\"complete_lessons\",\"count\":30}', 80, 30, '2025-12-02 07:50:00.826'),
('883e88cb-864c-4984-acec-c83022cd7d2a', '☀️ Mặt trời bền bỉ', 'Học 14 ngày liên tiếp - Hai tuần kiên trì!', '☀️', 'streak', '{\"type\":\"streak\",\"count\":14}', 35, 20, '2025-12-02 07:50:00.884'),
('8f892dab-f8b1-4e52-ad52-59aaa02c5a01', '✨ Siêu thanh tốc', 'Hoàn thành 50 bài tập trong 5 phút với 95% chính xác', '✨', 'speed', '{\"type\":\"speed_master\",\"exercises\":50,\"timeLimit\":300,\"minAccuracy\":95}', 80, 50, '2025-12-02 07:50:00.871'),
('99e251d4-4e37-4d12-8389-f1a6f376cfcb', '🎓 Cử nhân Soroban', 'Hoàn thành 20 bài học - Bạn đã tốt nghiệp khóa cơ bản', '🎓', 'learning', '{\"type\":\"complete_lessons\",\"count\":20}', 50, 20, '2025-12-02 07:50:00.823'),
('9a9efcb9-2be2-489e-ad30-3009f352cc65', '🌋 Thần thoại luyện tập', 'Hoàn thành 500 bài tập - Không ai bì được sự kiên trì của bạn!', '🌋', 'practice', '{\"type\":\"complete_exercises\",\"count\":500}', 100, 80, '2025-12-02 07:50:00.847'),
('a7e27792-dab5-4bb0-863f-2eb5c3de0e78', '📚 Học giả nhỏ tuổi', 'Hoàn thành 10 bài học - Kiến thức của bạn đang lớn dần', '📚', 'learning', '{\"type\":\"complete_lessons\",\"count\":10}', 30, 10, '2025-12-02 07:50:00.818'),
('b4bbdcb6-5078-4e31-b7e7-4ce8b4cd701a', '⭐ Huyền thoại kiên trì', 'Học 100 ngày liên tiếp - Bạn là huyền thoại!', '⭐', 'streak', '{\"type\":\"streak\",\"count\":100}', 150, 150, '2025-12-02 07:50:00.893'),
('c0af9a24-b7e3-4e2b-8996-c848178730e3', '🎮 Tân binh đấu trường', 'Tham gia trận thi đấu đầu tiên', '🎮', 'compete', '{\"type\":\"compete_matches\",\"count\":1}', 10, 3, '2025-12-02 07:50:00.896'),
('c7ac1446-5cb0-480a-b8e6-9a6da5f117fb', '🌱 Hạt giống Soroban', 'Hoàn thành bài học đầu tiên - Hành trình nghìn dặm bắt đầu từ một bước chân', '🌱', 'beginner', '{\"type\":\"complete_lessons\",\"count\":1}', 10, 2, '2025-12-02 07:50:00.806'),
('c82edabf-0ba0-4ff7-98ab-f994d771fe10', '🚀 Tên lửa số học', 'Hoàn thành 10 bài tập liên tiếp trong dưới 5 giây mỗi bài', '🚀', 'speed', '{\"type\":\"fast_streak\",\"timeLimit\":5,\"count\":10}', 30, 12, '2025-12-02 07:50:00.865'),
('c931e05d-593e-49e1-bdc8-f3774de0f9d5', '🌟 Ngôi sao đang lên', 'Đạt 3 sao trong 15 bài học', '🌟', 'mastery', '{\"type\":\"three_star_lessons\",\"count\":15}', 50, 25, '2025-12-02 07:50:00.919'),
('d4a2bad0-ee5c-43e5-89cd-3373ab3ea82f', '🥇 Chiến binh vàng', 'Tham gia 50 trận thi đấu', '🥇', 'compete', '{\"type\":\"compete_matches\",\"count\":50}', 60, 35, '2025-12-02 07:50:00.905'),
('d96126f9-1170-470f-86d5-8679d555635a', '🎯 Mắt đại bàng', 'Đạt 100% chính xác trong 10 bài tập', '🎯', 'accuracy', '{\"type\":\"perfect_exercises\",\"count\":10}', 15, 5, '2025-12-02 07:50:00.850'),
('dfc3eea3-c296-49cf-9b22-cbe179c56e49', '💫 Siêu sao Soroban', 'Đạt 3 sao trong tất cả bài học', '💫', 'mastery', '{\"type\":\"three_star_all_lessons\"}', 100, 100, '2025-12-02 07:50:00.925'),
('e1f4ec9a-5ffd-428b-b579-ac181185ba06', '👁️ Thần nhãn Soroban', 'Đạt 100% chính xác trong 100 bài tập - Không có gì thoát khỏi mắt bạn!', '👁️', 'accuracy', '{\"type\":\"perfect_exercises\",\"count\":100}', 80, 50, '2025-12-02 07:50:00.859'),
('e3d98bbe-691f-4695-8fa6-557c25cb0b35', '🌙 Nguyệt thực học tập', 'Học 30 ngày liên tiếp - Một tháng không ngừng nghỉ!', '🌙', 'streak', '{\"type\":\"streak\",\"count\":30}', 60, 40, '2025-12-02 07:50:00.889'),
('e50f402a-7003-4e70-824f-36892b9695c8', '🏹 Cung thủ bách phát', 'Đạt 100% chính xác trong 25 bài tập', '🏹', 'accuracy', '{\"type\":\"perfect_exercises\",\"count\":25}', 30, 12, '2025-12-02 07:50:00.852'),
('ef6474fc-3317-47a8-8f97-887cab28e1b2', '🏅 Chiến binh đồng', 'Tham gia 10 trận thi đấu', '🏅', 'compete', '{\"type\":\"compete_matches\",\"count\":10}', 20, 10, '2025-12-02 07:50:00.899'),
('f96613a6-12b7-4f7e-a8cc-0e98914b8f51', '🌈 Bộ sưu tập hoàn hảo', 'Mở khóa 20 thành tích khác', '🌈', 'special', '{\"type\":\"unlock_achievements\",\"count\":20}', 50, 50, '2025-12-02 07:50:00.935');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `challenges`
--

CREATE TABLE `challenges` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creatorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `difficulty` int NOT NULL,
  `rules` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `starsPrize` int NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `startAt` datetime(3) NOT NULL,
  `endAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `challenge_participations`
--

CREATE TABLE `challenge_participations` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `challengeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` int NOT NULL DEFAULT '0',
  `rank` int DEFAULT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `joinedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `compete_results`
--

CREATE TABLE `compete_results` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `arenaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correct` int NOT NULL,
  `totalTime` double NOT NULL,
  `stars` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `compete_results`
--

INSERT INTO `compete_results` (`id`, `userId`, `arenaId`, `correct`, `totalTime`, `stars`, `createdAt`, `updatedAt`) VALUES
('3353aabe-5b58-40ef-a4f5-bfb068703c03', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition-1-5', 6, 19, 28, '2025-12-04 16:39:46.677', '2025-12-04 16:39:46.677'),
('a3810a52-28a9-4d03-b870-f5ebca2fffde', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition-2-5', 6, 48, 39, '2025-12-02 09:43:13.370', '2025-12-02 13:09:16.326');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `exercise_results`
--

CREATE TABLE `exercise_results` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exerciseType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `difficulty` int NOT NULL,
  `problem` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userAnswer` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correctAnswer` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isCorrect` tinyint(1) NOT NULL,
  `timeTaken` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `exercise_results`
--

INSERT INTO `exercise_results` (`id`, `userId`, `exerciseType`, `difficulty`, `problem`, `userAnswer`, `correctAnswer`, `isCorrect`, `timeTaken`, `createdAt`) VALUES
('000304cf-a997-41e3-b585-69b9e1fd53ea', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '9 + 1', '10', '10', 1, 4, '2025-12-02 12:58:51.228'),
('0162250f-2b53-4d52-95a5-7a40ef0485b6', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '8 + 3', '11', '11', 1, 6, '2025-12-02 13:21:52.655'),
('02710f20-c396-483f-962b-0e61fbbfcdbc', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '6 + 1 + 3', '10', '10', 1, 0, '2025-12-04 16:43:17.343'),
('05436dd2-6531-4bf8-a745-f027380f8b4e', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 5', '6', '6', 1, 2, '2025-12-02 13:20:29.141'),
('0590e1b3-c28e-4797-871d-8e567f3f847e', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '3 + 4 + 9', '16', '16', 1, 8, '2025-12-02 12:56:35.039'),
('091268f2-a317-4c88-8656-3dcbf5be752e', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'subtraction', 1, '15 - 4', '11', '11', 1, 162, '2025-12-01 16:21:27.444'),
('0af349fd-3fa3-4566-8a40-6e034045b747', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '5 + 3 + 4', '12', '12', 1, 4, '2025-12-02 13:21:44.593'),
('0afdbe6f-fc63-4420-9707-61aad439da5a', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 4', '5', '5', 1, 8, '2025-12-05 05:27:33.460'),
('0ccbba28-f030-4125-914c-c37179a3ba2f', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '9 + 8', '17', '17', 1, 12, '2025-12-01 15:32:15.373'),
('0cf18a6b-cd2a-4b7f-83ba-d6472fe9945b', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '4 + 3', '7', '7', 1, 3, '2025-12-02 13:21:04.773'),
('0df47ca8-2191-4ae1-9173-12f9de869606', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 2, '70 + 38 + 62', '170', '170', 1, 16, '2025-12-02 13:06:49.316'),
('0f852dad-4f42-464d-8fc1-6b01ee1f5198', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '4 + 5', '9', '9', 1, 15, '2025-12-02 09:40:54.170'),
('12fd0573-c3ca-4442-b340-6a1efd8a50cc', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '6 + 6', '12', '12', 1, 6, '2025-12-02 12:58:24.213'),
('14d1272c-5920-4a0e-8c34-179a2af8e766', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '8 + 8', '16', '16', 1, 6, '2025-12-04 19:17:50.542'),
('19216116-577b-45c6-94d5-e5c7e8b2d6e8', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '2 + 6 + 9', '17', '17', 1, 14, '2025-12-02 12:57:35.742'),
('1f7d3300-910d-435c-b043-756b0236d8cb', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '7 + 6', '13', '13', 1, 8, '2025-12-02 13:20:39.617'),
('20d34a6a-cc65-4153-9dea-dbe99ffde7d9', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '6 + 9', '15', '15', 1, 4, '2025-12-02 13:20:00.717'),
('2126f4aa-77ad-4631-8d9e-6fc46f09197a', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '7 + 8 + 4', '19', '19', 1, 9, '2025-12-05 06:22:13.994'),
('2216b492-936e-4d85-b01b-08663082d3eb', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 7', '8', '8', 1, 177, '2025-12-01 15:10:54.971'),
('24cca224-7419-4af6-a964-02883b0d7e2b', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 4', '5', '5', 1, 2, '2025-12-04 16:41:09.930'),
('2634de06-3d2f-4b42-a143-fb511b378bc2', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '7 + 9 + 7', '23', '23', 1, 16, '2025-12-02 06:27:21.798'),
('2817f723-d280-49be-91c0-a01f6ad4ad27', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '2 + 7 + 9', '18', '18', 1, 10, '2025-12-02 13:21:29.236'),
('2884047e-c133-469e-901f-f262a52dd0eb', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '5 + 5', '8', '10', 0, 3, '2025-12-02 08:36:34.696'),
('28efdb89-dcc0-4500-a5bb-b9cde5c4ad15', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '6 + 3 + 2', '11', '11', 1, 6, '2025-12-02 12:58:44.741'),
('28ffa088-f394-4517-b922-94c10824ab36', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '2 + 7', '9', '9', 1, 3, '2025-12-02 13:21:34.159'),
('2d0c3276-80ce-47df-8245-4ee9fee56e5f', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '7 + 9', '16', '16', 1, 6, '2025-12-02 08:35:35.091'),
('2d8a25cb-a21f-4ffc-9a94-c9f9652abde4', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '8 + 6', '14', '14', 1, 6, '2025-12-02 12:59:15.018'),
('2e05b3ab-c7d8-4e1f-9c17-ebf6089493ae', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '9 + 7 + 4', '20', '20', 1, 38, '2025-12-02 08:33:59.814'),
('3033d015-6781-427a-9f22-1377e267e5e0', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '8 + 2', '10', '10', 1, 4, '2025-12-02 12:57:19.560'),
('323696a5-eeb0-4762-b04b-4bd58c81b4a6', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 3', '4', '4', 1, 256, '2025-12-01 15:06:10.435'),
('3269a397-f889-45ee-a36b-5ee04faa47a0', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '6 + 4 + 6', '0', '16', 0, 2, '2025-12-02 08:37:06.492'),
('33278ab0-81ee-4802-954c-fb2fb6e01e76', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '3 + 8', '11', '11', 1, 3, '2025-12-02 12:56:46.612'),
('3473243e-0525-4bc9-a819-dffa5d3a9512', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '4 + 3', '7', '7', 1, 14, '2025-12-01 15:18:05.872'),
('36a6a9b7-cc0d-4777-a9ec-ab3ba64b8a1d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '8 + 4', '12', '12', 1, 4, '2025-12-02 12:56:52.470'),
('37a35750-36c4-4b4e-a68a-1894ad5c54e6', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '6 + 7', '13', '13', 1, 4, '2025-12-02 12:56:41.505'),
('39d9c3b0-4a27-4004-9328-bb650bb2cbab', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'division', 1, '46 ÷ 2', '34', '23', 0, 6, '2025-12-01 14:36:07.987'),
('3eded3a0-ec6a-4ee2-8e11-5e0ad81b16b5', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '2 + 9 + 8', '19', '19', 1, 7, '2025-12-02 13:22:01.747'),
('3f417878-04f3-46b8-b2ae-4c7b62480b56', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '18 ÷ 9', '8', '2', 0, 6, '2025-12-02 02:12:24.337'),
('400a8c29-418a-439e-915d-7c625a230c23', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '6 + 9', '15', '15', 1, 5, '2025-12-04 16:44:06.828'),
('43da2ad3-942b-46e1-b455-48d756476bef', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '2 + 2', '7', '4', 0, 12, '2025-12-02 08:36:18.015'),
('4420efe1-cc37-4ceb-b4e3-692a7e6907da', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '4 + 3 + 4', '11', '11', 1, 18, '2025-12-04 16:41:55.313'),
('4be9f9c6-bef0-4e2c-944a-e043e95d9b5c', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 6', '7', '7', 1, 4, '2025-12-02 00:53:48.451'),
('4c683b45-032d-4132-8e16-e303607280fe', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '6 + 9', '15', '15', 1, 0, '2025-12-04 16:44:08.661'),
('4c865313-1542-4442-83ae-bcbadfa0c7c3', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '7 + 3', '10', '10', 1, 1, '2025-12-02 13:20:09.490'),
('51f0b693-07da-4fd9-b753-57d2f787b641', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 2, '22 + 24 + 47', '93', '93', 1, 14, '2025-12-02 13:05:13.995'),
('52ef61df-3ac5-4be7-8438-5258a5cd050c', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '4 + 9', '8', '13', 0, 2, '2025-12-02 08:36:41.493'),
('55b0a86d-355e-4a75-a92a-6a4c85b3a1a7', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '6 + 5', '11', '11', 1, 0, '2025-12-04 19:17:34.819'),
('577932a5-6581-430d-8afb-64a08f7dd859', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '5 + 4', '9', '9', 1, 3, '2025-12-01 15:25:31.505'),
('5825df83-fb2d-4f00-8d2d-7ed9f628f30e', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '5 + 6', '11', '11', 1, 2, '2025-12-04 19:17:32.986'),
('59c4b582-991e-47c5-83b6-95df59f8d8e0', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '4 + 3', '7', '7', 1, 3, '2025-12-02 13:20:49.659'),
('5a5c2202-a562-48d8-b234-ca01b85a9626', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '2 + 3 + 8', '13', '13', 1, 3, '2025-12-04 19:17:06.900'),
('5b232897-986f-4e21-a396-073f61d53793', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '8 + 9', '17', '17', 1, 9, '2025-12-04 16:43:00.307'),
('5dc0e53e-a434-4206-8828-fcbe40265537', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 2, '82 + 25', '107', '107', 1, 8, '2025-12-02 13:04:42.337'),
('5f003127-1124-468c-bdbb-faac000bbd93', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'subtraction', 1, '10 - 4 - 1', '5', '5', 1, 6, '2025-12-01 16:24:28.343'),
('63f541d2-fa7b-4b1b-9eb8-8409297d4100', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '3 + 5 + 9', '17', '17', 1, 18, '2025-12-01 16:27:22.949'),
('659e32cb-b761-463f-8073-3935a8b1b2d8', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '4 + 7', '11', '11', 1, 3, '2025-12-02 12:56:57.851'),
('65d5f38b-19f7-4fbb-b8ab-02147034f6bb', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 4 + 2', '7', '7', 1, 6, '2025-12-02 13:19:01.502'),
('67ae02fc-6637-46b1-949a-b721f9642b49', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 7', '8', '8', 1, 177, '2025-12-01 15:10:54.970'),
('6a61da11-2700-46dd-862c-b2bffa91783e', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 7 + 6', '14', '14', 1, 8, '2025-12-02 13:20:24.430'),
('6e03945e-ec8e-46f0-89c5-1552f6b99207', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '6 + 8', '14', '14', 1, 15, '2025-12-02 12:56:25.754'),
('7961f347-d72f-438d-b84a-dd3b099f9c62', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'subtraction', 1, '15 - 4', '11', '11', 1, 162, '2025-12-01 16:21:27.442'),
('7972ddd0-04c7-46da-9a41-bf0921e05792', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '8 + 2 + 2', '12', '12', 1, 4, '2025-12-04 16:40:36.761'),
('7a275d73-89d0-461b-9762-fd352e4ba9ba', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '4 + 2 + 4', '10', '10', 1, 5, '2025-12-02 12:59:22.764'),
('7b06098e-943b-412a-b9e0-56029a354fc4', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '5 + 6', '11', '11', 1, 2, '2025-12-02 08:34:41.329'),
('7b43400b-ce30-460f-a468-11038169f3cb', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '3 + 1', '4', '4', 1, 16, '2025-12-01 15:17:47.342'),
('7fd8eff3-1831-4677-861f-dbf08486516d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 2, '36 + 96', '132', '132', 1, 23, '2025-12-02 13:05:39.110'),
('8015ac83-827f-4f7d-a88c-fffbf4600f13', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '6 + 9', '15', '15', 1, 4, '2025-12-01 15:28:28.815'),
('81d4b565-9421-4945-81c7-43d87bc3d0eb', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '6 + 9', '15', '15', 1, 4, '2025-12-01 15:28:28.814'),
('83348c33-74b2-45ea-a6cf-93c19e921416', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '5 + 5', '10', '10', 1, 2, '2025-12-02 13:21:38.525'),
('83cf59d7-9f9b-4f54-85ba-6ce984828471', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '5 + 8 + 2', '15', '15', 1, 3, '2025-12-04 16:42:04.786'),
('84ab6bc6-2189-4359-b33d-49581ec2de86', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '9 + 2', '11', '11', 1, 18, '2025-12-01 15:18:28.322'),
('8529920f-8843-477c-8c87-ddc5537755a6', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 8 + 9', '18', '18', 1, 9, '2025-12-02 09:40:23.795'),
('874920f7-27f3-4604-a311-a555de5c11cd', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 5', '6', '6', 1, 2, '2025-12-04 16:41:59.472'),
('88eab5b2-2130-4911-853b-f7f7582801f9', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '5 + 8', '13', '13', 1, 5, '2025-12-02 12:57:05.061'),
('893ead50-a017-4d48-bcdc-f67a7e04d1b3', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '6 + 9', '15', '15', 1, 80, '2025-12-01 15:07:32.022'),
('8a17db4a-b1cf-4337-8cdc-6513ee701b3b', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '4 + 3', '7', '7', 1, 14, '2025-12-01 15:18:05.867'),
('8b4a3612-73c8-434f-b6ed-9eb47bca29de', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '18 ÷ 9', '6', '2', 0, 58, '2025-12-02 02:12:14.280'),
('8b9f31a9-e355-41d4-b413-5219f055f3fc', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '1 + 7', '8', '8', 1, 5, '2025-12-02 12:59:06.706'),
('8c3bffd0-8998-407a-accd-506191520208', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '9 + 8', '17', '17', 1, 12, '2025-12-01 15:32:15.375'),
('914ad9a6-e504-4591-bf3a-bde227d1c0d5', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '9 + 1 + 3', '13', '13', 1, 2, '2025-12-04 19:17:16.907'),
('932a2980-9b57-4714-9916-4edfbb3c04b5', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '4 + 3 + 1', '8', '8', 1, 8, '2025-12-02 08:37:01.724'),
('95a894db-729d-480a-8ee3-6dc2a1acba96', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '5 + 1', '6', '6', 1, 20, '2025-12-05 05:34:08.768'),
('965d38c1-dc19-4824-8c11-ab3e63e56670', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '6 + 2 + 3', '11', '11', 1, 6, '2025-12-02 12:58:59.321'),
('9677ee58-6dce-42d7-9fa9-89ce09efb0c8', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '5 + 9', '14', '14', 1, 5, '2025-12-02 13:21:16.635'),
('9684b28a-7ee4-44bc-9b3c-99f035aaceac', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '1 + 6 + 2', '7', '9', 0, 4, '2025-12-02 08:35:41.914'),
('988271b8-1d94-4ef4-acc1-54ebe38ff53c', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 6', '7', '7', 1, 55, '2025-12-01 14:49:22.616'),
('9aaf3b24-baa7-41a7-9ff8-3d31403706be', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'division', 1, '40 ÷ 5', '5', '8', 0, 5, '2025-12-01 14:36:15.072'),
('9c7243f6-7715-4ce1-93b2-bee4d9de74f4', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '5 + 1 + 6', '12', '12', 1, 6, '2025-12-02 12:57:13.217'),
('9defec4b-80fc-4af8-bb24-44a2efc95a63', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '9 + 1', '10', '10', 1, 2, '2025-12-02 13:20:44.119'),
('9e533b75-476a-4056-b962-8a9ef569271c', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '8 + 5', '13', '13', 1, 10, '2025-12-04 16:43:59.150'),
('a1da3032-236e-4dda-805a-45554872b9ef', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '5 + 1 + 9', '15', '15', 1, 0, '2025-12-04 16:41:35.098'),
('a24b0796-14cd-4cdf-bdea-53f0e828caf9', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 2, '66 + 23', '89', '89', 1, 13, '2025-12-02 13:04:58.066'),
('a29196c0-555e-4a09-a5bb-3d3e6a2c1a0a', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '3 + 5', '10', '8', 0, 12, '2025-12-01 15:01:27.265'),
('a8fd565e-5993-41f8-8ca4-74f12dc5a6e3', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '7 + 3', '10', '10', 1, 3, '2025-12-02 13:22:06.589'),
('a9b00e50-9fbf-4737-9dc8-7be799d4171d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '6 + 1 + 3', '10', '10', 1, 11, '2025-12-02 06:27:48.917'),
('aa121541-13eb-4637-9a2b-eeabc5ef8bca', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '3 + 4 + 8', '15', '15', 1, 4, '2025-12-04 16:41:33.255'),
('ab9d997d-6689-4cc4-ade6-e365dcfe49ef', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '18 - 2', '16', '16', 1, 74, '2025-12-02 02:04:06.734'),
('acb78785-f657-40f8-971c-ec0988da593d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 5, '35500 + 73377', '108877', '108877', 1, 27, '2025-12-02 13:01:33.897'),
('b0caccbb-68ee-4ec8-a000-2c827e5957a5', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '9 + 4 + 7', '20', '20', 1, 8, '2025-12-04 19:17:01.342'),
('b54cfb8e-ebfd-4285-94e4-bd84b2968829', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '3 + 1 + 1', '5', '5', 1, 5, '2025-12-04 19:16:51.960'),
('b883a1b1-2db5-48ba-ac51-9648b7e00569', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '7 + 2 + 3', '12', '12', 1, 2, '2025-12-04 16:43:21.477'),
('b9bfc7aa-6cbe-4ee2-9699-65dd485953ed', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '6 + 9', '15', '15', 1, 4, '2025-12-01 15:28:28.970'),
('b9c9b54c-9fa5-4d72-a667-5603984c5a12', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '4 + 8 + 3', '15', '15', 1, 23, '2025-12-04 16:41:05.661'),
('b9dc11e8-915c-46ef-bc83-82947543554f', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'subtraction', 1, '12 - 1 - 1', '10', '10', 1, 3, '2025-12-01 16:22:20.405'),
('bc3e0afe-670d-4a3a-81ed-4df92900a30e', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 7', '8', '8', 1, 11, '2025-12-02 09:40:36.839'),
('bc86d843-62c7-4500-86ae-ca27d747e677', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '6 + 8 + 2', '16', '16', 1, 4, '2025-12-02 08:37:12.105'),
('bdbd36b0-bf99-4d05-bc8f-356253e8322c', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'subtraction', 1, '10 - 4 - 1', '5', '5', 1, 6, '2025-12-01 16:24:28.345'),
('be5837b6-c0ce-4522-b527-3c45643a1b00', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '8 + 7 + 2', '17', '17', 1, 14, '2025-12-02 12:58:16.116'),
('c13bba03-e9ff-48a3-8653-dbf187dd1a88', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '9 + 3', '12', '12', 1, 3, '2025-12-04 19:17:12.160'),
('c22963cd-7f03-4fc3-b5ca-23871844d0e2', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '4 × 3', '12', '12', 1, 10, '2025-12-02 01:53:52.547'),
('c30b6ba1-ce8c-4c32-bb11-a8d43cb3ee42', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 7 + 6', '14', '14', 1, 37, '2025-12-02 08:33:12.946'),
('c3398bca-cded-4c20-97e4-2c3518898122', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 2', '3', '3', 1, 3, '2025-12-02 13:20:54.789'),
('c3c13616-9062-4855-80aa-81fedcbffafa', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '9 + 1 + 8', '18', '18', 1, 112, '2025-12-02 01:07:33.430'),
('c3e42263-385e-4809-b998-faa41ddfacc3', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '9 + 7', '16', '16', 1, 289, '2025-12-02 01:39:08.307'),
('c5760a7a-60db-4891-b39d-f42fc57011e4', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'subtraction', 1, '12 - 1 - 1', '10', '10', 1, 3, '2025-12-01 16:22:20.345'),
('c5cd3041-1eb5-4dc1-803a-7697817ef66f', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '5 + 4', '9', '9', 1, 3, '2025-12-01 15:25:31.480'),
('c6fc4ded-ce1c-47de-bd27-f42529945d43', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'subtraction', 1, '15 - 4', '11', '11', 1, 162, '2025-12-01 16:21:27.438'),
('c74caae5-15a2-4590-8559-fff91ba207b2', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '2 + 5', '7', '7', 1, 2, '2025-12-04 16:40:40.623'),
('c77ab39d-0e68-4a2c-b384-45a29d48d0ab', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '2 + 5 + 5', '12', '12', 1, 5, '2025-12-02 08:33:19.511'),
('c7848726-b58d-409d-9b18-388c9793e60d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '4 + 3', '7', '7', 1, 14, '2025-12-01 15:18:06.331'),
('c8ec57e3-751e-4616-9366-fd69b26db184', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '6 + 3', '9', '9', 1, 2, '2025-12-02 08:36:50.943'),
('cfaad03d-1a32-4217-a371-177b5a14cc27', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '9 + 2', '11', '11', 1, 18, '2025-12-01 15:18:28.325'),
('d0a8a9a0-2f44-4c10-9c54-7595f62d25fe', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '4 + 4', '8', '8', 1, 11, '2025-12-02 01:31:45.380'),
('d20d2396-c5d2-4a3c-b36a-95cbe1d2fe55', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'subtraction', 1, '12 - 1 - 1', '10', '10', 1, 3, '2025-12-01 16:22:20.355'),
('d3fbe0e1-6daf-41b2-b0cd-fe3525e4ccbf', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'subtraction', 1, '10 - 4 - 1', '5', '5', 1, 6, '2025-12-01 16:24:28.349'),
('d471269d-0d0e-4660-bfd6-eec0836b42ee', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '2 + 8 + 6', '16', '16', 1, 13, '2025-12-02 06:27:35.157'),
('d573e98c-270f-4f35-93ba-32151b7646eb', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '3 + 3 + 8', '14', '14', 1, 5, '2025-12-04 19:17:42.133'),
('d5e0d17f-f571-4ab8-bfd1-11623a39be69', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '6 + 6', '12', '12', 1, 3, '2025-12-02 13:21:09.735'),
('d7da84cf-efc2-4b7b-9a16-fa78849e695d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '2 + 9 + 4', '15', '15', 1, 7, '2025-12-04 16:43:31.279'),
('d88fca82-e2ec-4339-a734-4a3a0e2e98b3', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '5 + 4', '9', '9', 1, 3, '2025-12-01 15:25:31.477'),
('d9220493-7faf-4ecc-b701-73c1fbccc90f', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '4 + 6', '10', '10', 1, 17, '2025-12-02 01:32:04.394'),
('d9722f23-d059-411a-8707-e6a341a748aa', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '4 + 3', '56', '7', 0, 425, '2025-12-02 02:11:14.292'),
('db23e9b5-e608-4704-b666-91bd7c673f0c', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '7 + 5', '12', '12', 1, 15, '2025-12-04 16:41:26.839'),
('dbd8fda4-b0cb-4be1-8e57-12d3d3a4cb6a', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '6 + 4', '10', '10', 1, 1, '2025-12-04 16:43:15.524'),
('dd66f0dd-55ea-495e-b5c8-a656c7a3a682', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '7 + 6', '13', '13', 1, 129, '2025-12-05 05:33:48.751'),
('def3a8ec-d075-49ed-a4b2-ed06ff742313', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 2, '78 + 21 + 85', '184', '184', 1, 16, '2025-12-02 13:04:32.065'),
('df9dd816-85d6-4693-b352-97dddb6fa6e7', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 1', '2', '2', 1, 560, '2025-12-02 01:27:22.316'),
('e0d1aabf-4889-4674-b5e8-de99bc78979d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '3 + 1', '4', '4', 1, 16, '2025-12-01 15:17:47.344'),
('e27d79c4-c500-4e50-8719-39b9810de4b2', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '3 + 6 + 6', '15', '15', 1, 38, '2025-12-01 16:28:06.119'),
('e2d97081-f1a2-465e-b178-0e2631ce2a24', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '5 + 4', '9', '9', 1, 4, '2025-12-05 05:23:11.528'),
('e4626424-87dc-4d6d-8a02-23d3b64fdaf1', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '3 + 5 + 9', '17', '17', 1, 18, '2025-12-01 16:27:22.950'),
('e5f2bf5f-0de7-428f-bc78-c5692744a052', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '7 + 5', '12', '12', 1, 9, '2025-12-04 16:43:12.051'),
('e6dec2b6-518d-4ff8-b7e4-ceff9acf62c1', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '9 + 7 + 1', '17', '17', 1, 4, '2025-12-02 01:39:33.692'),
('e7db9df6-e990-4455-aea9-f79c710796f0', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '3 + 5', '8', '8', 1, 7, '2025-12-02 09:40:12.807'),
('e8c42976-4f7f-4bed-8993-3fdd0592ba9f', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '3 + 6 + 6', '15', '15', 1, 38, '2025-12-01 16:28:06.121'),
('eaef842a-39d7-4df0-8d27-88ae71a633ab', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '5 + 2 + 9', '16', '16', 1, 10, '2025-12-02 12:58:36.521'),
('eea2fa4d-d7c1-4b8e-9881-3ba59f5204b7', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 6', '7', '7', 1, 4, '2025-12-02 00:53:48.450'),
('f04ba185-0847-43f8-85f9-4d364645895d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 1 + 6', '8', '8', 1, 9, '2025-12-04 19:17:28.410'),
('f32032da-d730-4042-8f63-4ab391392db9', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '9 + 2', '11', '11', 1, 2, '2025-12-02 13:20:14.188'),
('fa8fd5f1-471c-41a9-b310-81b3677c9c6b', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 2, '20 + 75 + 24', '119', '119', 1, 14, '2025-12-02 13:05:55.852'),
('fac7018d-406d-4d5b-b265-06c13361d256', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '1 + 8', '9', '9', 1, 3, '2025-12-02 13:20:05.683'),
('facbe1f6-43ad-4715-9f2a-8537ccb22afc', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '9 + 1 + 2', '12', '12', 1, 36, '2025-12-02 02:13:08.816'),
('fc9b9658-a927-49a6-a0a4-5f93328eea86', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'addition', 1, '8 + 5 + 3', '16', '16', 1, 14, '2025-12-04 16:43:47.243'),
('fe80fd3b-d159-4437-b646-bd334ff40d3e', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'mentalMath', 1, '7 + 9', '7', '16', 0, 6, '2025-12-02 08:36:27.649');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `friends`
--

CREATE TABLE `friends` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `friendId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `acceptedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lessons`
--

CREATE TABLE `lessons` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `levelId` int NOT NULL,
  `lessonId` int NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `difficulty` int NOT NULL DEFAULT '1',
  `duration` int NOT NULL DEFAULT '15',
  `stars` int NOT NULL DEFAULT '10',
  `videoUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL,
  `isLocked` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `lessons`
--

INSERT INTO `lessons` (`id`, `levelId`, `lessonId`, `title`, `description`, `content`, `difficulty`, `duration`, `stars`, `videoUrl`, `order`, `isLocked`, `createdAt`, `updatedAt`) VALUES
('048510dc-d569-4ac7-9fb9-05b9582d9652', 1, 3, '⭐ Số 5-9: Hạt Trời tỏa sáng', 'Học cách dùng hạt Trời để tạo số 5-9', '{\"theory\":[\"🔴 Số 5: Chỉ cần gạt hạt Trời xuống (Trời = 5)\",\"🔴 Số 6 = Trời + 1 Đất (5 + 1)\",\"🔴 Số 7 = Trời + 2 Đất (5 + 2)\",\"🔴 Số 8 = Trời + 3 Đất (5 + 3)\",\"🔴 Số 9 = Trời + 4 Đất (5 + 4)\",\"💡 Công thức: Số = 5 + số hạt Đất\"],\"practice\":[{\"type\":\"create\",\"target\":5},{\"type\":\"create\",\"target\":6},{\"type\":\"create\",\"target\":7},{\"type\":\"create\",\"target\":8},{\"type\":\"create\",\"target\":9},{\"type\":\"create\",\"target\":5},{\"type\":\"create\",\"target\":7},{\"type\":\"create\",\"target\":9},{\"type\":\"create\",\"target\":6},{\"type\":\"create\",\"target\":8},{\"type\":\"create\",\"target\":9},{\"type\":\"create\",\"target\":5}]}', 1, 8, 6, NULL, 3, 0, '2025-12-01 23:43:10.680', '2025-12-02 15:16:05.916'),
('0f96405e-2094-4771-b6fb-1e67f8126913', 7, 3, '🏋️ Tổng hợp cộng trừ', 'Luyện tập kết hợp tất cả công thức', '{\"theory\":[\"⚡ Tổng hợp 4 công thức:\",\"1️⃣ Cộng/trừ trực tiếp (đủ hạt)\",\"2️⃣ Bạn nhỏ (+5/-5)\",\"3️⃣ Bạn lớn (+10/-10)\",\"4️⃣ Kết hợp Bạn nhỏ + Bạn lớn\",\"🎯 Hãy chọn công thức phù hợp nhất!\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"2+3\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"4+4\",\"answer\":8},{\"type\":\"calc\",\"problem\":\"5+6\",\"answer\":11},{\"type\":\"calc\",\"problem\":\"7+8\",\"answer\":15},{\"type\":\"calc\",\"problem\":\"9+9\",\"answer\":18},{\"type\":\"calc\",\"problem\":\"8-3\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"12-5\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"15-8\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"6+7\",\"answer\":13},{\"type\":\"calc\",\"problem\":\"14-6\",\"answer\":8},{\"type\":\"calc\",\"problem\":\"8+9\",\"answer\":17},{\"type\":\"calc\",\"problem\":\"16-7\",\"answer\":9},{\"type\":\"calc\",\"problem\":\"9+8\",\"answer\":17},{\"type\":\"calc\",\"problem\":\"13-9\",\"answer\":4}]}', 4, 15, 7, NULL, 3, 0, '2025-12-02 13:07:34.862', '2025-12-02 15:29:39.092'),
('1355f6f4-5382-4245-987e-6dae4b5ffa04', 13, 1, '➗ Khái niệm phép chia', 'Hiểu phép chia và chia hết', '{\"theory\":[\"➗ **PHÉP CHIA LÀ GÌ?**\",\"\",\"🔹 Chia là phép ngược của nhân:\",\"   6 ÷ 2 = 3 (vì 2 × 3 = 6)\",\"   12 ÷ 3 = 4 (vì 3 × 4 = 12)\",\"\",\"📐 **THUẬT NGỮ:**\",\"   12 ÷ 3 = 4\",\"   - 12: số bị chia\",\"   - 3: số chia\",\"   - 4: thương\",\"\",\"💡 **TRÊN SOROBAN:**\",\"   - Đặt số bị chia ở TRÁI\",\"   - Số chia: nhớ trong đầu\",\"   - Thương: ghi dần từ trái\"],\"practice\":[{\"numbers\":[6,2],\"operation\":\"/\",\"answer\":3},{\"numbers\":[6,3],\"operation\":\"/\",\"answer\":2},{\"numbers\":[8,2],\"operation\":\"/\",\"answer\":4},{\"numbers\":[8,4],\"operation\":\"/\",\"answer\":2},{\"numbers\":[9,3],\"operation\":\"/\",\"answer\":3},{\"numbers\":[10,2],\"operation\":\"/\",\"answer\":5},{\"numbers\":[10,5],\"operation\":\"/\",\"answer\":2},{\"numbers\":[12,2],\"operation\":\"/\",\"answer\":6},{\"numbers\":[12,3],\"operation\":\"/\",\"answer\":4},{\"numbers\":[12,4],\"operation\":\"/\",\"answer\":3},{\"numbers\":[12,6],\"operation\":\"/\",\"answer\":2},{\"numbers\":[15,3],\"operation\":\"/\",\"answer\":5},{\"numbers\":[15,5],\"operation\":\"/\",\"answer\":3},{\"numbers\":[16,2],\"operation\":\"/\",\"answer\":8},{\"numbers\":[16,4],\"operation\":\"/\",\"answer\":4}]}', 4, 15, 5, NULL, 1, 0, '2025-12-01 23:43:10.767', '2025-12-02 15:29:39.144'),
('17cd0632-fb6e-4080-8e76-22ea9d6169a6', 3, 3, '🏋️ Luyện tập Bạn nhỏ cộng', 'Thành thạo cộng với Bạn nhỏ qua nhiều bài tập', '{\"theory\":[\"⚡ Bí quyết nhanh:\",\"📌 Thấy +4 khi có 1,2,3 Đất → Gạt Trời, bỏ 1\",\"📌 Thấy +3 khi có 2,3,4 Đất → Gạt Trời, bỏ 2\",\"📌 Thấy +2 khi có 3,4 Đất → Gạt Trời, bỏ 3\",\"🎯 Mục tiêu: Phản xạ nhanh, không cần suy nghĩ!\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"1+4\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"2+4\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"3+4\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"4+4\",\"answer\":8},{\"type\":\"calc\",\"problem\":\"2+3\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"3+3\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"4+3\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"3+2\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"4+2\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"4+1\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"1+4\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"2+4\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"3+4\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"4+4\",\"answer\":8}]}', 2, 12, 7, NULL, 3, 0, '2025-12-02 12:52:37.034', '2025-12-02 15:29:39.044'),
('1c532e68-b4c2-43af-8587-445723aedc6e', 1, 1, '🎒 Khám phá Soroban', 'Làm quen với bàn tính thần kỳ Soroban', '{\"theory\":[\"🔴 Hạt Trời (hạt ở trên thanh ngang) có giá trị = 5\",\"🟡 Hạt Đất (hạt ở dưới thanh ngang) có giá trị = 1\",\"📏 Hạt chỉ được đếm khi chạm vào thanh ngang\",\"👆 Gạt hạt Trời xuống = cộng 5, gạt lên = trừ 5\",\"👇 Gạt hạt Đất lên = cộng 1, gạt xuống = trừ 1\"],\"practice\":[{\"type\":\"explore\",\"instruction\":\"Hãy thử gạt 1 hạt Đất lên thanh ngang để tạo số 1!\",\"target\":1},{\"type\":\"explore\",\"instruction\":\"Hãy gạt 2 hạt Đất lên để tạo số 2!\",\"target\":2},{\"type\":\"explore\",\"instruction\":\"Bây giờ hãy gạt hạt Trời xuống để tạo số 5!\",\"target\":5},{\"type\":\"explore\",\"instruction\":\"Tạo số 6 = Hạt Trời (5) + 1 hạt Đất (1)!\",\"target\":6},{\"type\":\"explore\",\"instruction\":\"Thử tạo số 4 bằng 4 hạt Đất nhé!\",\"target\":4},{\"type\":\"explore\",\"instruction\":\"Cuối cùng, reset bàn tính về số 0!\",\"target\":0}]}', 1, 8, 5, NULL, 1, 0, '2025-12-01 23:43:10.668', '2025-12-02 15:29:39.008'),
('2c85a442-7235-4191-b585-b32c8089a54a', 16, 1, '🧠 Soroban ảo nâng cao', 'Kỹ thuật tưởng tượng Soroban ảo chi tiết', '{\"theory\":[\"🎯 **KỸ THUẬT TƯỞNG TƯỢNG SOROBAN ẢO CHI TIẾT**\",\"\",\"📐 **BƯỚC 1: XÂY DỰNG HÌNH ẢNH CƠ BẢN**\",\"\",\"1️⃣ **Tạo khung Soroban trong đầu:**\",\"   - Tưởng tượng một khung gỗ màu vàng/nâu\",\"   - Có thanh ngang (beam) ở giữa chia 2 phần\",\"   - Phần trên: 1 hạt mỗi cột (hạt Trời)\",\"   - Phần dưới: 4 hạt mỗi cột (hạt Đất)\",\"\",\"2️⃣ **Chi tiết hạt:**\",\"   - Hạt hình tròn/oval, màu đen hoặc nâu\",\"   - Kích thước vừa đủ để thấy rõ\",\"   - Hạt \\\"sáng\\\" khi được gạt về thanh\",\"\",\"📐 **BƯỚC 2: KỸ THUẬT GHI NHỚ VỊ TRÍ**\",\"\",\"🔹 **Cột đơn vị (phải nhất):**\",\"   - Luôn bắt đầu từ cột này\",\"   - Hình dung nó LỚN hơn các cột khác\",\"\",\"🔹 **Cột chục (bên trái cột đơn vị):**\",\"   - Hình dung có chấm đỏ đánh dấu\",\"\",\"🔹 **Cột trăm, nghìn:**\",\"   - Thêm dần khi cần\",\"\",\"📐 **BƯỚC 3: HOẠT HÌNH TRONG ĐẦU**\",\"\",\"✨ **Khi cộng số:**\",\"   - \\\"Nhìn\\\" ngón tay ẢO gạt hạt lên\",\"   - Nghe tiếng \\\"click\\\" trong đầu\",\"   - Thấy hạt di chuyển CHẬM RÃI\",\"\",\"✨ **Khi trừ số:**\",\"   - \\\"Nhìn\\\" ngón tay ẢO gạt hạt xuống\",\"   - Hạt rời khỏi thanh\",\"\",\"💡 **MẸO QUAN TRỌNG:**\",\"   - Ban đầu làm RẤT CHẬM\",\"   - Nói thầm các bước trong đầu\",\"   - Luyện mỗi ngày 5-10 phút\"],\"practice\":[{\"type\":\"mental\",\"problem\":\"12 + 3\",\"answer\":15,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"15 + 4\",\"answer\":19,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"11 + 8\",\"answer\":19,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"13 + 6\",\"answer\":19,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"14 + 5\",\"answer\":19,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"16 + 3\",\"answer\":19,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"17 + 2\",\"answer\":19,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"19 - 4\",\"answer\":15,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"18 - 3\",\"answer\":15,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"17 - 2\",\"answer\":15,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"16 - 1\",\"answer\":15,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"15 - 5\",\"answer\":10,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"14 - 4\",\"answer\":10,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"13 - 3\",\"answer\":10,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"12 - 2\",\"answer\":10,\"timeLimit\":10}]}', 5, 18, 5, NULL, 1, 0, '2025-12-01 23:43:10.784', '2025-12-02 15:29:39.174'),
('2daa3cb2-c0b2-41eb-b78f-e6827b074591', 17, 2, '⚡ Tốc độ nâng cao', 'Luyện tính nhanh với số 2 chữ số', '{\"theory\":[\"⚡ **LUYỆN TỐC ĐỘ - CẤP ĐỘ 2**\",\"\",\"🎯 **MỤC TIÊU:**\",\"   - Tính 10 phép tính trong 60 giây\",\"   - Phép cộng/trừ 2 chữ số\",\"\",\"📐 **KỸ THUẬT:**\",\"\",\"1️⃣ **Xử lý song song:**\",\"   - Nhìn cả 2 số cùng lúc\",\"   - Ước lượng kết quả ngay\",\"\",\"2️⃣ **Pattern Recognition:**\",\"   - Nhận ra các mẫu quen thuộc\",\"   - 25 + 25 = 50 (nhớ ngay)\",\"   - 11 + 11 = 22 (không cần tính)\",\"\",\"3️⃣ **Làm tròn & điều chỉnh:**\",\"   - 28 + 15 ≈ 30 + 15 - 2 = 43\",\"   - Nhanh hơn tính từng hàng\",\"\",\"💡 **MẸO PRO:**\",\"   - Số tròn chục dễ hơn\",\"   - Đưa về số tròn nếu được\",\"   - Tin vào phản xạ của bạn!\"],\"practice\":[{\"type\":\"speed\",\"count\":5,\"difficulty\":\"medium\",\"timeLimit\":40},{\"type\":\"speed\",\"count\":8,\"difficulty\":\"medium\",\"timeLimit\":60},{\"type\":\"speed\",\"count\":10,\"difficulty\":\"medium\",\"timeLimit\":90}]}', 5, 12, 6, NULL, 2, 0, '2025-12-01 23:43:10.793', '2025-12-02 15:29:39.188'),
('2f601d68-5f70-4070-a72c-d718843fb3f5', 10, 1, '🔢 Số 1000-9999', 'Biểu diễn số 4 chữ số trên Soroban', '{\"theory\":[\"📍 Cột 4: Hàng nghìn (1000-9000)\",\"🔢 Ví dụ: 2345 = 2 nghìn + 3 trăm + 4 chục + 5 đơn vị\",\"💡 Soroban có thể tính số rất lớn!\",\"🎯 Mỗi cột hoạt động giống nhau\",\"✨ Áp dụng tất cả công thức đã học!\"],\"practice\":[{\"type\":\"create\",\"target\":1000},{\"type\":\"create\",\"target\":1234},{\"type\":\"create\",\"target\":2468},{\"type\":\"create\",\"target\":3579},{\"type\":\"create\",\"target\":4567},{\"type\":\"create\",\"target\":5678},{\"type\":\"create\",\"target\":6789},{\"type\":\"create\",\"target\":7890},{\"type\":\"create\",\"target\":8765},{\"type\":\"create\",\"target\":9999},{\"type\":\"create\",\"target\":5005},{\"type\":\"create\",\"target\":1001}]}', 4, 12, 5, NULL, 1, 0, '2025-12-01 23:43:10.748', '2025-12-02 15:29:39.113'),
('30ca50d9-f86f-4d86-8264-bbacd0f1183b', 18, 3, '🏆 Thi đấu nâng cao', 'Bài thi thử nâng cao', '{\"theory\":[\"🏆 **BÀI THI THỬ - CẤP 8**\",\"\",\"⏱️ **THÔNG TIN:**\",\"   - Thời gian: 5 phút\",\"   - Số câu: 20 câu\",\"   - Đỗ: Đúng ≥ 16 câu (80%)\",\"\",\"📐 **NỘI DUNG:**\",\"   - Cộng/trừ số 2-3 chữ số\",\"   - Mỗi phép tính 2-3 số\",\"\",\"🎯 **MỤC TIÊU NÂNG CAO:**\",\"\",\"✅ **Sau khi hoàn thành Level 18:**\",\"   - Tính nhẩm 2 chữ số trong 5 giây\",\"   - Độ chính xác > 90%\",\"   - Sẵn sàng thi cấp 10-8\",\"\",\"🚀 **TIẾP THEO:**\",\"   - Luyện tập mỗi ngày 10-15 phút\",\"   - Tăng dần độ khó\",\"   - Tham gia thi thử online\",\"   - Đăng ký thi chính thức\",\"\",\"🌟 **CHÚC MỪNG!**\",\"   Bạn đã hoàn thành chương trình cơ bản!\",\"   Tiếp tục luyện tập để thành master Soroban! 🏆\"],\"practice\":[{\"numbers\":[125,237],\"operation\":\"+\",\"answer\":362},{\"numbers\":[248,356],\"operation\":\"+\",\"answer\":604},{\"numbers\":[369,478],\"operation\":\"+\",\"answer\":847},{\"numbers\":[457,389],\"operation\":\"+\",\"answer\":846},{\"numbers\":[568,234],\"operation\":\"+\",\"answer\":802},{\"numbers\":[679,125],\"operation\":\"+\",\"answer\":804},{\"numbers\":[785,119],\"operation\":\"+\",\"answer\":904},{\"numbers\":[892,108],\"operation\":\"+\",\"answer\":1000},{\"numbers\":[500,-167],\"operation\":\"+\",\"answer\":333},{\"numbers\":[600,-278],\"operation\":\"+\",\"answer\":322},{\"numbers\":[700,-389],\"operation\":\"+\",\"answer\":311},{\"numbers\":[800,-499],\"operation\":\"+\",\"answer\":301},{\"numbers\":[900,-588],\"operation\":\"+\",\"answer\":312},{\"numbers\":[1000,-678],\"operation\":\"+\",\"answer\":322},{\"numbers\":[345,123,234],\"operation\":\"+\",\"answer\":702}]}', 6, 20, 7, NULL, 3, 0, '2025-12-01 23:43:10.802', '2025-12-02 15:29:39.201'),
('325f64c1-0dbb-402b-a43a-bd3503483c94', 11, 3, '✖️ Nhân với số 5, 6, 7', 'Nhân với các số lớn hơn', '{\"theory\":[\"📊 **BẢNG NHÂN 5, 6, 7**\",\"\",\"🔢 **NHÂN 5:** 5×1=5, 5×2=10, 5×3=15, 5×4=20, 5×5=25\",\"   5×6=30, 5×7=35, 5×8=40, 5×9=45\",\"\",\"🔢 **NHÂN 6:** 6×1=6, 6×2=12, 6×3=18, 6×4=24, 6×5=30\",\"   6×6=36, 6×7=42, 6×8=48, 6×9=54\",\"\",\"🔢 **NHÂN 7:** 7×1=7, 7×2=14, 7×3=21, 7×4=28, 7×5=35\",\"   7×6=42, 7×7=49, 7×8=56, 7×9=63\",\"\",\"💡 **MẸO:**\",\"   - Nhân 5: kết quả luôn tận cùng 0 hoặc 5\",\"   - 6×7 = 7×6 = 42\"],\"practice\":[{\"numbers\":[5,6],\"operation\":\"*\",\"answer\":30},{\"numbers\":[6,5],\"operation\":\"*\",\"answer\":30},{\"numbers\":[5,7],\"operation\":\"*\",\"answer\":35},{\"numbers\":[7,5],\"operation\":\"*\",\"answer\":35},{\"numbers\":[5,8],\"operation\":\"*\",\"answer\":40},{\"numbers\":[6,6],\"operation\":\"*\",\"answer\":36},{\"numbers\":[6,7],\"operation\":\"*\",\"answer\":42},{\"numbers\":[7,6],\"operation\":\"*\",\"answer\":42},{\"numbers\":[5,9],\"operation\":\"*\",\"answer\":45},{\"numbers\":[6,8],\"operation\":\"*\",\"answer\":48},{\"numbers\":[7,7],\"operation\":\"*\",\"answer\":49},{\"numbers\":[6,9],\"operation\":\"*\",\"answer\":54},{\"numbers\":[7,8],\"operation\":\"*\",\"answer\":56},{\"numbers\":[7,9],\"operation\":\"*\",\"answer\":63},{\"numbers\":[5,5],\"operation\":\"*\",\"answer\":25}]}', 1, 15, 7, NULL, 3, 0, '2025-12-02 13:32:42.192', '2025-12-02 15:29:39.130'),
('33b66174-b9c7-4b0c-b84e-1743e9d4d838', 2, 3, '➕ Luyện tập cộng dễ', 'Ôn tập và củng cố phép cộng đơn giản', '{\"theory\":[\"📝 Ôn lại 2 quy tắc cộng:\",\"1️⃣ Đủ hạt Đất → Gạt thêm hạt Đất lên\",\"2️⃣ Cần số ≥5 → Gạt hạt Trời xuống\",\"⚡ Hãy tính nhanh và chính xác!\",\"🎯 Mục tiêu: 10 phép tính trong 2 phút\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"1+1\",\"answer\":2},{\"type\":\"calc\",\"problem\":\"2+3\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"3+2\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"4+1\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"5+2\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"6+1\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"3+3\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"4+4\",\"answer\":8},{\"type\":\"calc\",\"problem\":\"7+2\",\"answer\":9},{\"type\":\"calc\",\"problem\":\"8+1\",\"answer\":9},{\"type\":\"calc\",\"problem\":\"2+2\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"6+3\",\"answer\":9},{\"type\":\"calc\",\"problem\":\"1+4\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"5+3\",\"answer\":8}]}', 1, 12, 7, NULL, 3, 0, '2025-12-02 12:52:37.018', '2025-12-02 15:29:39.029'),
('36895011-425c-4a40-bf30-e2c6914b754b', 1, 2, '🔢 Số 1-4: Các hạt Đất', 'Học cách tạo số 1, 2, 3, 4 bằng hạt Đất', '{\"theory\":[\"☝️ Số 1: Gạt 1 hạt Đất lên thanh ngang\",\"✌️ Số 2: Gạt 2 hạt Đất lên thanh ngang\",\"🤟 Số 3: Gạt 3 hạt Đất lên thanh ngang\",\"🖐️ Số 4: Gạt 4 hạt Đất lên thanh ngang\",\"💡 Nhớ: Mỗi hạt Đất có giá trị bằng 1\"],\"practice\":[{\"type\":\"create\",\"target\":1},{\"type\":\"create\",\"target\":2},{\"type\":\"create\",\"target\":3},{\"type\":\"create\",\"target\":4},{\"type\":\"create\",\"target\":1},{\"type\":\"create\",\"target\":3},{\"type\":\"create\",\"target\":2},{\"type\":\"create\",\"target\":4},{\"type\":\"create\",\"target\":4},{\"type\":\"create\",\"target\":1},{\"type\":\"create\",\"target\":2},{\"type\":\"create\",\"target\":3}]}', 1, 8, 5, NULL, 2, 0, '2025-12-01 23:43:10.676', '2025-12-02 15:29:39.014'),
('3e73761b-1471-49ca-a845-56257f041a28', 10, 3, '➖ Trừ 4 chữ số', 'Trừ số có 4 chữ số', '{\"theory\":[\"📏 Trừ số lớn: cẩn thận khi mượn!\",\"🔢 Ví dụ: 5432-2345\",\"💡 Khi mượn qua nhiều hàng, nhớ trừ dần\",\"🎯 Luyện tập nhiều để thành thạo!\",\"✨ Kiên nhẫn và chính xác!\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"3456-1234\",\"answer\":2222},{\"type\":\"calc\",\"problem\":\"5432-2345\",\"answer\":3087},{\"type\":\"calc\",\"problem\":\"6543-3456\",\"answer\":3087},{\"type\":\"calc\",\"problem\":\"7654-4567\",\"answer\":3087},{\"type\":\"calc\",\"problem\":\"8000-4567\",\"answer\":3433},{\"type\":\"calc\",\"problem\":\"7654-3789\",\"answer\":3865},{\"type\":\"calc\",\"problem\":\"9000-5678\",\"answer\":3322},{\"type\":\"calc\",\"problem\":\"8765-4321\",\"answer\":4444},{\"type\":\"calc\",\"problem\":\"9999-5555\",\"answer\":4444},{\"type\":\"calc\",\"problem\":\"9876-4567\",\"answer\":5309},{\"type\":\"calc\",\"problem\":\"5000-1234\",\"answer\":3766},{\"type\":\"calc\",\"problem\":\"7777-3333\",\"answer\":4444}]}', 5, 18, 7, NULL, 3, 0, '2025-12-01 23:43:10.754', '2025-12-02 15:29:39.122'),
('405bd71c-09a4-4706-8027-a45a9fb5c890', 9, 2, '➕ Cộng 3 chữ số', 'Cộng hai số có 3 chữ số', '{\"theory\":[\"📏 Vẫn tính từ PHẢI sang TRÁI\",\"🔢 Ví dụ: 234+156\",\"📝 Đơn vị: 4+6 = 10 (viết 0, nhớ 1)\",\"📝 Chục: 3+5+1 = 9\",\"📝 Trăm: 2+1 = 3\",\"✅ Kết quả: 234+156 = 390\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"123+234\",\"answer\":357},{\"type\":\"calc\",\"problem\":\"234+156\",\"answer\":390},{\"type\":\"calc\",\"problem\":\"345+234\",\"answer\":579},{\"type\":\"calc\",\"problem\":\"456+321\",\"answer\":777},{\"type\":\"calc\",\"problem\":\"456+389\",\"answer\":845},{\"type\":\"calc\",\"problem\":\"567+278\",\"answer\":845},{\"type\":\"calc\",\"problem\":\"234+567\",\"answer\":801},{\"type\":\"calc\",\"problem\":\"378+456\",\"answer\":834},{\"type\":\"calc\",\"problem\":\"489+367\",\"answer\":856},{\"type\":\"calc\",\"problem\":\"523+368\",\"answer\":891},{\"type\":\"calc\",\"problem\":\"199+201\",\"answer\":400},{\"type\":\"calc\",\"problem\":\"555+333\",\"answer\":888}]}', 4, 18, 6, NULL, 2, 0, '2025-12-01 23:43:10.744', '2025-12-02 15:29:39.108'),
('41da6db0-488c-4e7e-985f-285170816965', 7, 2, '🎯 Trừ kết hợp', 'Kết hợp mượn và dùng Bạn nhỏ khi trừ', '{\"theory\":[\"🎯 Trừ số lớn cũng cần kết hợp công thức!\",\"💡 Ví dụ: 11-6 cần mượn 10 và dùng Bạn nhỏ\",\"📝 Bước 1: 11-6 = 11 - (10-4) = 1+4\",\"📝 Bước 2: Cộng 4 dùng Bạn nhỏ: +4 = +5-1\",\"✅ Kết quả: 11-6 = 5\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"11-6\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"11-7\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"12-6\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"12-7\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"13-8\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"14-8\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"14-9\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"15-7\",\"answer\":8},{\"type\":\"calc\",\"problem\":\"15-8\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"16-9\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"17-8\",\"answer\":9},{\"type\":\"calc\",\"problem\":\"18-9\",\"answer\":9}]}', 4, 15, 6, NULL, 2, 0, '2025-12-01 23:43:10.730', '2025-12-02 15:29:39.089'),
('4390becc-a3af-427f-be40-03a93580c2e9', 13, 3, '➗ Chia cho 5, 6, 7', 'Chia với số lớn hơn', '{\"theory\":[\"📊 **BẢNG CHIA 5, 6, 7**\",\"\",\"🔢 **CHIA 5:** 5÷5=1, 10÷5=2, 15÷5=3, 20÷5=4, 25÷5=5\",\"   30÷5=6, 35÷5=7, 40÷5=8, 45÷5=9\",\"\",\"🔢 **CHIA 6:** 6÷6=1, 12÷6=2, 18÷6=3, 24÷6=4, 30÷6=5\",\"   36÷6=6, 42÷6=7, 48÷6=8, 54÷6=9\",\"\",\"🔢 **CHIA 7:** 7÷7=1, 14÷7=2, 21÷7=3, 28÷7=4, 35÷7=5\",\"   42÷7=6, 49÷7=7, 56÷7=8, 63÷7=9\",\"\",\"💡 **MẸO CHIA 5:**\",\"   - Số chia hết cho 5: tận cùng 0 hoặc 5\"],\"practice\":[{\"numbers\":[25,5],\"operation\":\"/\",\"answer\":5},{\"numbers\":[30,6],\"operation\":\"/\",\"answer\":5},{\"numbers\":[35,7],\"operation\":\"/\",\"answer\":5},{\"numbers\":[35,5],\"operation\":\"/\",\"answer\":7},{\"numbers\":[36,6],\"operation\":\"/\",\"answer\":6},{\"numbers\":[42,7],\"operation\":\"/\",\"answer\":6},{\"numbers\":[40,5],\"operation\":\"/\",\"answer\":8},{\"numbers\":[42,6],\"operation\":\"/\",\"answer\":7},{\"numbers\":[49,7],\"operation\":\"/\",\"answer\":7},{\"numbers\":[45,5],\"operation\":\"/\",\"answer\":9},{\"numbers\":[48,6],\"operation\":\"/\",\"answer\":8},{\"numbers\":[56,7],\"operation\":\"/\",\"answer\":8},{\"numbers\":[50,5],\"operation\":\"/\",\"answer\":10},{\"numbers\":[54,6],\"operation\":\"/\",\"answer\":9},{\"numbers\":[63,7],\"operation\":\"/\",\"answer\":9}]}', 1, 15, 7, NULL, 3, 0, '2025-12-02 13:32:42.231', '2025-12-02 15:29:39.152'),
('439898ce-d0ce-41fb-919c-51c428bed750', 11, 2, '✖️ Nhân với số 2, 3, 4', 'Luyện nhân với các số nhỏ', '{\"theory\":[\"📊 **BẢNG NHÂN 2, 3, 4**\",\"\",\"🔢 **NHÂN 2:** 2×1=2, 2×2=4, 2×3=6, 2×4=8, 2×5=10\",\"   2×6=12, 2×7=14, 2×8=16, 2×9=18\",\"\",\"🔢 **NHÂN 3:** 3×1=3, 3×2=6, 3×3=9, 3×4=12, 3×5=15\",\"   3×6=18, 3×7=21, 3×8=24, 3×9=27\",\"\",\"🔢 **NHÂN 4:** 4×1=4, 4×2=8, 4×3=12, 4×4=16, 4×5=20\",\"   4×6=24, 4×7=28, 4×8=32, 4×9=36\",\"\",\"💡 **MẸO:**\",\"   - Nhân 2 = gấp đôi\",\"   - Nhân 4 = nhân 2 hai lần\",\"   - 3×4 = 4×3 (giao hoán)\"],\"practice\":[{\"numbers\":[2,6],\"operation\":\"*\",\"answer\":12},{\"numbers\":[3,6],\"operation\":\"*\",\"answer\":18},{\"numbers\":[4,5],\"operation\":\"*\",\"answer\":20},{\"numbers\":[2,9],\"operation\":\"*\",\"answer\":18},{\"numbers\":[3,7],\"operation\":\"*\",\"answer\":21},{\"numbers\":[4,6],\"operation\":\"*\",\"answer\":24},{\"numbers\":[3,8],\"operation\":\"*\",\"answer\":24},{\"numbers\":[4,7],\"operation\":\"*\",\"answer\":28},{\"numbers\":[2,8],\"operation\":\"*\",\"answer\":16},{\"numbers\":[3,9],\"operation\":\"*\",\"answer\":27},{\"numbers\":[4,8],\"operation\":\"*\",\"answer\":32},{\"numbers\":[4,9],\"operation\":\"*\",\"answer\":36},{\"numbers\":[3,3],\"operation\":\"*\",\"answer\":9},{\"numbers\":[4,4],\"operation\":\"*\",\"answer\":16},{\"numbers\":[2,2],\"operation\":\"*\",\"answer\":4}]}', 3, 15, 6, NULL, 2, 0, '2025-12-01 23:43:10.760', '2025-12-02 15:29:39.128'),
('44930166-5e07-4a43-835c-977c2800c790', 3, 2, '➕ Cộng dùng Bạn nhỏ', 'Áp dụng Bạn nhỏ để cộng khi hết hạt Đất', '{\"theory\":[\"🎯 Khi hết hạt Đất, dùng công thức Bạn nhỏ:\",\"➕ +4 = Gạt Trời xuống, bỏ 1 Đất (+5-1)\",\"➕ +3 = Gạt Trời xuống, bỏ 2 Đất (+5-2)\",\"➕ +2 = Gạt Trời xuống, bỏ 3 Đất (+5-3)\",\"➕ +1 = Gạt Trời xuống, bỏ 4 Đất (+5-4)\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"1+4\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"2+3\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"3+2\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"4+1\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"2+4\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"3+4\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"4+4\",\"answer\":8},{\"type\":\"calc\",\"problem\":\"3+3\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"4+3\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"4+2\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"1+4\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"2+4\",\"answer\":6}]}', 2, 12, 6, NULL, 2, 0, '2025-12-01 23:43:10.701', '2025-12-02 15:29:39.039'),
('4942240f-5072-4154-a0a1-9376f6622f56', 17, 3, '⚡ Thử thách tốc độ', 'Bài tập tốc độ tổng hợp', '{\"theory\":[\"🏆 **THỬ THÁCH TỐC ĐỘ**\",\"\",\"🎯 **MỤC TIÊU CUỐI:**\",\"   - 15 phép tính trong 60 giây\",\"   - Độ chính xác > 90%\",\"\",\"📐 **CHIẾN THUẬT THI:**\",\"\",\"1️⃣ **Đọc lướt trước:**\",\"   - Nhìn nhanh tất cả các câu\",\"   - Làm câu dễ trước\",\"\",\"2️⃣ **Không quay lại:**\",\"   - Đã chọn đáp án thì đi tiếp\",\"   - Tiết kiệm thời gian\",\"\",\"3️⃣ **Ước lượng nhanh:**\",\"   - Loại đáp án sai rõ ràng\",\"   - Chọn đáp án gần nhất\",\"\",\"⏱️ **QUẢN LÝ THỜI GIAN:**\",\"   - Câu dễ: 2-3 giây\",\"   - Câu khó: 5-6 giây\",\"   - Câu rất khó: bỏ qua, quay lại sau\",\"\",\"💪 **TÂM LÝ THI:**\",\"   - Bình tĩnh, thở đều\",\"   - Tin vào bản thân\",\"   - Sai 1-2 câu không sao!\"],\"practice\":[{\"type\":\"speed\",\"count\":10,\"difficulty\":\"medium\",\"timeLimit\":60},{\"type\":\"speed\",\"count\":12,\"difficulty\":\"medium\",\"timeLimit\":75},{\"type\":\"speed\",\"count\":15,\"difficulty\":\"hard\",\"timeLimit\":90}]}', 6, 15, 7, NULL, 3, 0, '2025-12-01 23:43:10.795', '2025-12-02 15:29:39.191'),
('49c28d9a-08c3-4136-80ac-832e07b81fac', 18, 1, '🏆 Luật thi Soroban', 'Tìm hiểu các giải thi Soroban', '{\"theory\":[\"🏆 **GIẢI THI SOROBAN**\",\"\",\"📜 **CÁC CẤP ĐỘ THI:**\",\"\",\"🥉 **Cấp 10-7 (Beginner):**\",\"   - Cộng/trừ số 1-2 chữ số\",\"   - Thời gian: 3-5 phút\",\"   - Số câu: 10-20 câu\",\"\",\"🥈 **Cấp 6-4 (Intermediate):**\",\"   - Cộng/trừ số 3-4 chữ số\",\"   - Nhân/chia đơn giản\",\"   - Thời gian: 5-7 phút\",\"\",\"🥇 **Cấp 3-1 (Advanced):**\",\"   - Các phép tính phức tạp\",\"   - Thời gian ngắn hơn\",\"\",\"🏅 **Cấp Đan (Master):**\",\"   - Flash Anzan (tính nhẩm siêu tốc)\",\"   - Thi đấu quốc tế\",\"\",\"📐 **HÌNH THỨC THI:**\",\"   - Thi viết trên giấy\",\"   - Thi trên máy tính\",\"   - Thi đọc số (nghe và tính)\",\"   - Flash Anzan (nhìn số chớp nhoáng)\"],\"practice\":[{\"numbers\":[123,456],\"operation\":\"+\",\"answer\":579},{\"numbers\":[234,567],\"operation\":\"+\",\"answer\":801},{\"numbers\":[345,678],\"operation\":\"+\",\"answer\":1023},{\"numbers\":[456,789],\"operation\":\"+\",\"answer\":1245},{\"numbers\":[567,234],\"operation\":\"+\",\"answer\":801},{\"numbers\":[678,123],\"operation\":\"+\",\"answer\":801},{\"numbers\":[789,111],\"operation\":\"+\",\"answer\":900},{\"numbers\":[800,-234],\"operation\":\"+\",\"answer\":566},{\"numbers\":[700,-345],\"operation\":\"+\",\"answer\":355},{\"numbers\":[600,-456],\"operation\":\"+\",\"answer\":144},{\"numbers\":[500,-123],\"operation\":\"+\",\"answer\":377},{\"numbers\":[400,-156],\"operation\":\"+\",\"answer\":244},{\"numbers\":[300,-189],\"operation\":\"+\",\"answer\":111},{\"numbers\":[1000,-567],\"operation\":\"+\",\"answer\":433},{\"numbers\":[999,-111],\"operation\":\"+\",\"answer\":888}]}', 4, 15, 5, NULL, 1, 0, '2025-12-01 23:43:10.798', '2025-12-02 15:29:39.194'),
('4cacb999-0f54-42f2-8a21-cefae760744e', 16, 3, '🧠 Trừ nhẩm 2 chữ số', 'Anzan phép trừ nâng cao', '{\"theory\":[\"➖ **ANZAN PHÉP TRỪ 2 CHỮ SỐ**\",\"\",\"📐 **QUY TRÌNH:**\",\"\",\"💡 **VÍ DỤ: 45 - 23**\",\"   Bước 1: Hình dung 45 trên Soroban ảo\",\"   Bước 2: Trừ 3 ở cột đơn vị → 2\",\"   Bước 3: Trừ 2 ở cột chục → 2\",\"   Bước 4: Đọc: 22 ✅\",\"\",\"⚠️ **KHI CẦN MƯỢN:**\",\"\",\"💡 **VÍ DỤ: 52 - 18**\",\"   Bước 1: Hình dung 52\",\"   Bước 2: 2 - 8 không đủ!\",\"   Bước 3: Mượn 1 chục → 12 - 8 = 4\",\"   Bước 4: Cột chục: 5 - 1(mượn) - 1 = 3\",\"   Bước 5: Đọc: 34 ✅\",\"\",\"🎯 **KỸ THUẬT HÌNH DUNG MƯỢN:**\",\"   - Khi mượn, \\\"nhìn\\\" 1 hạt ở cột chục biến mất\",\"   - Đồng thời cột đơn vị \\\"sáng lên\\\" thêm 10\",\"   - Tưởng tượng như có ánh sáng chuyển từ trái sang phải\",\"\",\"💡 **MẸO:**\",\"   - Ước lượng trước: 52 - 18 ≈ 50 - 20 = 30\",\"   - Kết quả thực tế gần 30 → 34 ✅\"],\"practice\":[{\"type\":\"mental\",\"problem\":\"45 - 23\",\"answer\":22,\"timeLimit\":20},{\"type\":\"mental\",\"problem\":\"67 - 34\",\"answer\":33,\"timeLimit\":20},{\"type\":\"mental\",\"problem\":\"89 - 45\",\"answer\":44,\"timeLimit\":20},{\"type\":\"mental\",\"problem\":\"52 - 18\",\"answer\":34,\"timeLimit\":18},{\"type\":\"mental\",\"problem\":\"63 - 27\",\"answer\":36,\"timeLimit\":18},{\"type\":\"mental\",\"problem\":\"74 - 38\",\"answer\":36,\"timeLimit\":18},{\"type\":\"mental\",\"problem\":\"85 - 49\",\"answer\":36,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"91 - 56\",\"answer\":35,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"80 - 35\",\"answer\":45,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"70 - 28\",\"answer\":42,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"60 - 17\",\"answer\":43,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"50 - 26\",\"answer\":24,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"43 - 15\",\"answer\":28,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"36 - 19\",\"answer\":17,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"72 - 45\",\"answer\":27,\"timeLimit\":10}]}', 1, 15, 7, NULL, 3, 0, '2025-12-02 13:36:46.324', '2025-12-02 15:29:39.180'),
('546de298-5be9-4786-addf-b1bdc2126baf', 1, 4, '🔟 Số 10-99: Hai cột số', 'Học cách biểu diễn số có 2 chữ số', '{\"theory\":[\"📍 Cột bên PHẢI = hàng đơn vị (1-9)\",\"📍 Cột bên TRÁI = hàng chục (10, 20, 30...)\",\"🔢 Ví dụ: Số 23 = 2 ở cột chục + 3 ở cột đơn vị\",\"🔢 Ví dụ: Số 45 = 4 ở cột chục + 5 ở cột đơn vị\",\"💡 Đọc từ trái sang phải như cách ta đọc số!\"],\"practice\":[{\"type\":\"create\",\"target\":10},{\"type\":\"create\",\"target\":15},{\"type\":\"create\",\"target\":23},{\"type\":\"create\",\"target\":36},{\"type\":\"create\",\"target\":42},{\"type\":\"create\",\"target\":58},{\"type\":\"create\",\"target\":67},{\"type\":\"create\",\"target\":74},{\"type\":\"create\",\"target\":89},{\"type\":\"create\",\"target\":99},{\"type\":\"create\",\"target\":50},{\"type\":\"create\",\"target\":31}]}', 1, 10, 6, NULL, 4, 0, '2025-12-01 23:43:10.684', '2025-12-02 15:29:39.020'),
('5a9d3273-2609-47ae-aae9-14b1672eea02', 14, 3, '➗ Luyện tập chia', 'Tổng hợp các phép chia', '{\"theory\":[\"🏋️ **LUYỆN TẬP TỔNG HỢP CHIA**\",\"\",\"📋 **ÔN LẠI:**\",\"✅ Bảng chia 2-9\",\"✅ Chia số 2 chữ số cho 1 chữ số\",\"✅ Mối quan hệ nhân - chia\",\"\",\"💡 **MẸO TÍNH NHANH:**\",\"   🔹 Chia 5: nhân 2, chia 10\",\"   🔹 Chia 9: dùng quy tắc tổng chữ số\",\"\",\"🎯 **KIỂM TRA:** Luôn nhân lại để kiểm tra!\"],\"practice\":[{\"numbers\":[56,7],\"operation\":\"/\",\"answer\":8},{\"numbers\":[72,8],\"operation\":\"/\",\"answer\":9},{\"numbers\":[81,9],\"operation\":\"/\",\"answer\":9},{\"numbers\":[48,4],\"operation\":\"/\",\"answer\":12},{\"numbers\":[65,5],\"operation\":\"/\",\"answer\":13},{\"numbers\":[72,6],\"operation\":\"/\",\"answer\":12},{\"numbers\":[84,7],\"operation\":\"/\",\"answer\":12},{\"numbers\":[96,8],\"operation\":\"/\",\"answer\":12},{\"numbers\":[90,9],\"operation\":\"/\",\"answer\":10},{\"numbers\":[52,4],\"operation\":\"/\",\"answer\":13},{\"numbers\":[70,5],\"operation\":\"/\",\"answer\":14},{\"numbers\":[84,6],\"operation\":\"/\",\"answer\":14},{\"numbers\":[98,7],\"operation\":\"/\",\"answer\":14},{\"numbers\":[88,8],\"operation\":\"/\",\"answer\":11},{\"numbers\":[108,9],\"operation\":\"/\",\"answer\":12}]}', 1, 15, 7, NULL, 3, 0, '2025-12-02 13:32:42.252', '2025-12-02 15:29:39.160'),
('5d2155a2-541a-4456-9da3-56cdb126ae0c', 10, 2, '➕ Cộng 4 chữ số', 'Cộng số có 4 chữ số', '{\"theory\":[\"📏 Nguyên tắc không đổi: PHẢI sang TRÁI\",\"🔢 Ví dụ: 2345+1234\",\"📝 Đơn vị: 5+4 = 9\",\"📝 Chục: 4+3 = 7\",\"📝 Trăm: 3+2 = 5\",\"📝 Nghìn: 2+1 = 3\",\"✅ Kết quả: 2345+1234 = 3579\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"1234+1111\",\"answer\":2345},{\"type\":\"calc\",\"problem\":\"2345+1234\",\"answer\":3579},{\"type\":\"calc\",\"problem\":\"3456+2345\",\"answer\":5801},{\"type\":\"calc\",\"problem\":\"4567+2234\",\"answer\":6801},{\"type\":\"calc\",\"problem\":\"5678+2345\",\"answer\":8023},{\"type\":\"calc\",\"problem\":\"4567+3456\",\"answer\":8023},{\"type\":\"calc\",\"problem\":\"2468+1357\",\"answer\":3825},{\"type\":\"calc\",\"problem\":\"3579+2468\",\"answer\":6047},{\"type\":\"calc\",\"problem\":\"4680+3579\",\"answer\":8259},{\"type\":\"calc\",\"problem\":\"5000+4999\",\"answer\":9999},{\"type\":\"calc\",\"problem\":\"1111+2222\",\"answer\":3333},{\"type\":\"calc\",\"problem\":\"4444+5555\",\"answer\":9999}]}', 5, 18, 6, NULL, 2, 0, '2025-12-01 23:43:10.751', '2025-12-02 15:29:39.118'),
('5e03cf0f-c462-4196-b815-8f8c89a33735', 6, 1, '➖ Trừ dùng Bạn lớn', 'Trừ bằng cách mượn từ hàng chục', '{\"theory\":[\"🎯 Khi không đủ hạt để trừ, mượn từ hàng chục!\",\"➖ -9 = Bớt 1 chục, thêm bạn lớn của 9 (-10+1)\",\"➖ -8 = Bớt 1 chục, thêm bạn lớn của 8 (-10+2)\",\"➖ -7 = Bớt 1 chục, thêm bạn lớn của 7 (-10+3)\",\"💡 Công thức: -số = -10 + bạn lớn của số đó\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"10-1\",\"answer\":9},{\"type\":\"calc\",\"problem\":\"10-2\",\"answer\":8},{\"type\":\"calc\",\"problem\":\"10-3\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"10-4\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"10-5\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"10-9\",\"answer\":1},{\"type\":\"calc\",\"problem\":\"11-8\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"12-7\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"13-6\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"15-9\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"14-8\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"16-7\",\"answer\":9}]}', 3, 12, 5, NULL, 1, 0, '2025-12-01 23:43:10.725', '2025-12-02 15:29:39.075'),
('601da810-8f40-4f90-8cca-3e2966d4a6a9', 2, 2, '➕ Cộng với hạt Trời', 'Cộng khi kết quả từ 5 trở lên', '{\"theory\":[\"🔴 Khi cộng mà kết quả ≥ 5, cần dùng hạt Trời\",\"👇 0+5: Gạt hạt Trời xuống = 5\",\"👇 5+1: Có Trời rồi, gạt thêm 1 Đất = 6\",\"👇 5+2: Có Trời rồi, gạt thêm 2 Đất = 7\",\"💡 Hạt Trời giúp ta biểu diễn số từ 5-9!\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"0+5\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"5+1\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"5+2\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"5+3\",\"answer\":8},{\"type\":\"calc\",\"problem\":\"5+4\",\"answer\":9},{\"type\":\"calc\",\"problem\":\"6+1\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"6+2\",\"answer\":8},{\"type\":\"calc\",\"problem\":\"7+1\",\"answer\":8},{\"type\":\"calc\",\"problem\":\"7+2\",\"answer\":9},{\"type\":\"calc\",\"problem\":\"6+3\",\"answer\":9},{\"type\":\"calc\",\"problem\":\"8+1\",\"answer\":9},{\"type\":\"calc\",\"problem\":\"5+0\",\"answer\":5}]}', 1, 10, 6, NULL, 2, 0, '2025-12-01 23:43:10.693', '2025-12-02 15:16:05.928'),
('6220203e-ccc7-4307-b229-59e8651a0a83', 18, 2, '🏆 Mô phỏng thi', 'Bài thi thử cấp độ cơ bản', '{\"theory\":[\"📝 **BÀI THI THỬ - CẤP 10**\",\"\",\"⏱️ **THÔNG TIN:**\",\"   - Thời gian: 3 phút\",\"   - Số câu: 15 câu\",\"   - Đỗ: Đúng ≥ 12 câu (80%)\",\"\",\"📐 **NỘI DUNG:**\",\"   - Cộng/trừ số 1-2 chữ số\",\"   - Mỗi phép tính 2 số\",\"\",\"💡 **HƯỚNG DẪN:**\",\"   1. Đọc kỹ đề trước khi bắt đầu\",\"   2. Bắt đầu từ câu dễ nhất\",\"   3. Không dành quá 15 giây/câu\",\"   4. Kiểm tra lại nếu còn thời gian\",\"\",\"🎯 **CHIẾN THUẬT:**\",\"   - 15 câu ÷ 3 phút = 12 giây/câu\",\"   - Câu dễ: 8-10 giây\",\"   - Câu khó: 15-20 giây\",\"   - Để dành 30 giây kiểm tra\",\"\",\"💪 **SẴN SÀNG CHƯA?**\",\"   - Hít thở sâu 3 lần\",\"   - Tập trung 100%\",\"   - BẮT ĐẦU!\"],\"practice\":[{\"numbers\":[15,23],\"operation\":\"+\",\"answer\":38},{\"numbers\":[27,18],\"operation\":\"+\",\"answer\":45},{\"numbers\":[34,29],\"operation\":\"+\",\"answer\":63},{\"numbers\":[46,37],\"operation\":\"+\",\"answer\":83},{\"numbers\":[52,41],\"operation\":\"+\",\"answer\":93},{\"numbers\":[68,-25],\"operation\":\"+\",\"answer\":43},{\"numbers\":[75,-38],\"operation\":\"+\",\"answer\":37},{\"numbers\":[84,-46],\"operation\":\"+\",\"answer\":38},{\"numbers\":[91,-54],\"operation\":\"+\",\"answer\":37},{\"numbers\":[100,-67],\"operation\":\"+\",\"answer\":33},{\"numbers\":[33,44],\"operation\":\"+\",\"answer\":77},{\"numbers\":[55,22],\"operation\":\"+\",\"answer\":77},{\"numbers\":[66,11],\"operation\":\"+\",\"answer\":77},{\"numbers\":[88,-11],\"operation\":\"+\",\"answer\":77},{\"numbers\":[99,-22],\"operation\":\"+\",\"answer\":77}]}', 5, 18, 6, NULL, 2, 0, '2025-12-01 23:43:10.800', '2025-12-02 15:29:39.196'),
('6b4fa5a9-f9aa-48fd-89c1-a6d67ac5b8d3', 8, 1, '📝 Cộng 2 số (không nhớ)', 'Cộng hai số khi không cần nhớ sang hàng', '{\"theory\":[\"📏 Luôn tính từ PHẢI sang TRÁI (đơn vị trước)\",\"🔢 Ví dụ: 23+15\",\"📝 Bước 1: Cột đơn vị: 3+5 = 8\",\"📝 Bước 2: Cột chục: 2+1 = 3\",\"✅ Kết quả: 23+15 = 38\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"12+13\",\"answer\":25},{\"type\":\"calc\",\"problem\":\"23+15\",\"answer\":38},{\"type\":\"calc\",\"problem\":\"31+24\",\"answer\":55},{\"type\":\"calc\",\"problem\":\"42+36\",\"answer\":78},{\"type\":\"calc\",\"problem\":\"51+24\",\"answer\":75},{\"type\":\"calc\",\"problem\":\"14+32\",\"answer\":46},{\"type\":\"calc\",\"problem\":\"25+43\",\"answer\":68},{\"type\":\"calc\",\"problem\":\"61+27\",\"answer\":88},{\"type\":\"calc\",\"problem\":\"33+44\",\"answer\":77},{\"type\":\"calc\",\"problem\":\"52+36\",\"answer\":88},{\"type\":\"calc\",\"problem\":\"21+45\",\"answer\":66},{\"type\":\"calc\",\"problem\":\"34+52\",\"answer\":86}]}', 3, 12, 5, NULL, 1, 0, '2025-12-01 23:43:10.732', '2025-12-02 15:29:39.095'),
('71082834-fdd8-4aeb-add8-024e19467b2d', 7, 1, '🎯 Cộng kết hợp', 'Kết hợp cả Bạn nhỏ và Bạn lớn khi cộng', '{\"theory\":[\"🎯 Một số phép tính cần dùng CẢ HAI công thức!\",\"💡 Ví dụ: 6+7 cần dùng Bạn lớn và Bạn nhỏ\",\"📝 Bước 1: 6+7 = 6 + (10-3) = 16-3\",\"📝 Bước 2: Trừ 3 dùng Bạn nhỏ: -3 = -5+2\",\"✅ Kết quả: 6+7 = 13\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"6+6\",\"answer\":12},{\"type\":\"calc\",\"problem\":\"6+7\",\"answer\":13},{\"type\":\"calc\",\"problem\":\"7+6\",\"answer\":13},{\"type\":\"calc\",\"problem\":\"7+7\",\"answer\":14},{\"type\":\"calc\",\"problem\":\"8+6\",\"answer\":14},{\"type\":\"calc\",\"problem\":\"6+8\",\"answer\":14},{\"type\":\"calc\",\"problem\":\"9+6\",\"answer\":15},{\"type\":\"calc\",\"problem\":\"8+7\",\"answer\":15},{\"type\":\"calc\",\"problem\":\"9+7\",\"answer\":16},{\"type\":\"calc\",\"problem\":\"8+8\",\"answer\":16},{\"type\":\"calc\",\"problem\":\"9+8\",\"answer\":17},{\"type\":\"calc\",\"problem\":\"9+9\",\"answer\":18}]}', 4, 15, 5, NULL, 1, 0, '2025-12-01 23:43:10.728', '2025-12-02 15:29:39.086'),
('781818ef-db77-4bd5-857d-c1ed67c318ca', 8, 2, '📝 Cộng 2 số (có nhớ)', 'Cộng hai số khi cần nhớ sang hàng chục', '{\"theory\":[\"📏 Khi cột đơn vị ≥ 10, phải nhớ sang chục!\",\"🔢 Ví dụ: 28+35\",\"📝 Bước 1: Cột đơn vị: 8+5 = 13 (viết 3, nhớ 1)\",\"📝 Bước 2: Cột chục: 2+3+1 = 6\",\"✅ Kết quả: 28+35 = 63\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"18+15\",\"answer\":33},{\"type\":\"calc\",\"problem\":\"28+35\",\"answer\":63},{\"type\":\"calc\",\"problem\":\"37+28\",\"answer\":65},{\"type\":\"calc\",\"problem\":\"47+38\",\"answer\":85},{\"type\":\"calc\",\"problem\":\"56+29\",\"answer\":85},{\"type\":\"calc\",\"problem\":\"65+28\",\"answer\":93},{\"type\":\"calc\",\"problem\":\"49+36\",\"answer\":85},{\"type\":\"calc\",\"problem\":\"58+27\",\"answer\":85},{\"type\":\"calc\",\"problem\":\"39+45\",\"answer\":84},{\"type\":\"calc\",\"problem\":\"67+28\",\"answer\":95},{\"type\":\"calc\",\"problem\":\"78+17\",\"answer\":95},{\"type\":\"calc\",\"problem\":\"59+38\",\"answer\":97}]}', 4, 15, 6, NULL, 2, 0, '2025-12-01 23:43:10.735', '2025-12-02 15:29:39.097'),
('7fe0694d-af75-4631-bf75-91a4a5154ffe', 11, 1, '✖️ Khái niệm nhân', 'Hiểu phép nhân và cách nhân trên Soroban', '{\"theory\":[\"✖️ **PHÉP NHÂN LÀ GÌ?**\",\"\",\"🔹 Phép nhân là cộng liên tiếp:\",\"   3 × 4 = 4 + 4 + 4 = 12\",\"   5 × 3 = 3 + 3 + 3 + 3 + 3 = 15\",\"\",\"📐 **TRÊN SOROBAN:**\",\"   - Số bị nhân: đặt bên TRÁI\",\"   - Số nhân: đặt bên PHẢI hoặc nhớ\",\"   - Kết quả: tính dần từng bước\",\"\",\"💡 **VÍ DỤ: 3 × 2**\",\"   Bước 1: Cộng 3 lần đầu → 3\",\"   Bước 2: Cộng 3 lần thứ 2 → 6\",\"   ✅ Kết quả: 6\",\"\",\"🌟 **NHỚ BẢNG CỬU CHƯƠNG:**\",\"   2×1=2, 2×2=4, 2×3=6, 2×4=8, 2×5=10\"],\"practice\":[{\"numbers\":[2,3],\"operation\":\"*\",\"answer\":6},{\"numbers\":[3,2],\"operation\":\"*\",\"answer\":6},{\"numbers\":[2,4],\"operation\":\"*\",\"answer\":8},{\"numbers\":[4,2],\"operation\":\"*\",\"answer\":8},{\"numbers\":[2,5],\"operation\":\"*\",\"answer\":10},{\"numbers\":[5,2],\"operation\":\"*\",\"answer\":10},{\"numbers\":[3,3],\"operation\":\"*\",\"answer\":9},{\"numbers\":[2,6],\"operation\":\"*\",\"answer\":12},{\"numbers\":[3,4],\"operation\":\"*\",\"answer\":12},{\"numbers\":[4,3],\"operation\":\"*\",\"answer\":12},{\"numbers\":[2,7],\"operation\":\"*\",\"answer\":14},{\"numbers\":[2,8],\"operation\":\"*\",\"answer\":16},{\"numbers\":[2,9],\"operation\":\"*\",\"answer\":18},{\"numbers\":[3,5],\"operation\":\"*\",\"answer\":15},{\"numbers\":[5,3],\"operation\":\"*\",\"answer\":15}]}', 3, 12, 5, NULL, 1, 0, '2025-12-01 23:43:10.757', '2025-12-02 15:29:39.125'),
('82f7e2f4-106f-4d66-bddf-240987311d35', 6, 2, '➖ Trừ qua chục (nâng cao)', 'Luyện trừ khi phải mượn từ chục', '{\"theory\":[\"🎯 Trừ qua chục - các trường hợp đặc biệt:\",\"📌 11-9 = 11 - 10 + 1 = 2 (mượn chục, thêm 1)\",\"📌 12-8 = 12 - 10 + 2 = 4 (mượn chục, thêm 2)\",\"📌 13-7 = 13 - 10 + 3 = 6 (mượn chục, thêm 3)\",\"💡 Nhớ: -số = -10 + (10 - số)\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"11-9\",\"answer\":2},{\"type\":\"calc\",\"problem\":\"11-8\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"12-9\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"12-8\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"13-9\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"13-8\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"14-9\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"14-7\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"15-8\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"15-6\",\"answer\":9},{\"type\":\"calc\",\"problem\":\"16-9\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"17-8\",\"answer\":9}]}', 3, 12, 6, NULL, 2, 0, '2025-12-02 13:07:34.843', '2025-12-02 15:29:39.078'),
('8584b83a-16ee-406a-8156-f082b9b3bfcd', 5, 2, '➕ Cộng dùng Bạn lớn', 'Cộng bằng cách sang cột chục khi không đủ hạt', '{\"theory\":[\"🎯 Khi cộng quá 9, cần sang hàng chục!\",\"➕ +9 = Thêm 1 chục, bớt bạn lớn của 9 (+10-1)\",\"➕ +8 = Thêm 1 chục, bớt bạn lớn của 8 (+10-2)\",\"➕ +7 = Thêm 1 chục, bớt bạn lớn của 7 (+10-3)\",\"💡 Công thức: +số = +10 - bạn lớn của số đó\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"1+9\",\"answer\":10},{\"type\":\"calc\",\"problem\":\"2+8\",\"answer\":10},{\"type\":\"calc\",\"problem\":\"3+7\",\"answer\":10},{\"type\":\"calc\",\"problem\":\"4+6\",\"answer\":10},{\"type\":\"calc\",\"problem\":\"5+5\",\"answer\":10},{\"type\":\"calc\",\"problem\":\"2+9\",\"answer\":11},{\"type\":\"calc\",\"problem\":\"3+8\",\"answer\":11},{\"type\":\"calc\",\"problem\":\"4+7\",\"answer\":11},{\"type\":\"calc\",\"problem\":\"5+6\",\"answer\":11},{\"type\":\"calc\",\"problem\":\"6+5\",\"answer\":11},{\"type\":\"calc\",\"problem\":\"3+9\",\"answer\":12},{\"type\":\"calc\",\"problem\":\"4+8\",\"answer\":12}]}', 3, 12, 6, NULL, 2, 0, '2025-12-01 23:43:10.722', '2025-12-02 15:29:39.068'),
('86768348-1f69-4e37-be5a-c13aacc99bc2', 4, 2, '➖ Trừ dùng Bạn nhỏ', 'Áp dụng Bạn nhỏ để trừ khi thiếu hạt Đất', '{\"theory\":[\"🎯 Khi thiếu hạt Đất để trừ, dùng Bạn nhỏ:\",\"➖ -4 = Gạt Trời lên, thêm 1 Đất (-5+1)\",\"➖ -3 = Gạt Trời lên, thêm 2 Đất (-5+2)\",\"➖ -2 = Gạt Trời lên, thêm 3 Đất (-5+3)\",\"➖ -1 = Gạt Trời lên, thêm 4 Đất (-5+4)\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"5-1\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"5-2\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"5-3\",\"answer\":2},{\"type\":\"calc\",\"problem\":\"5-4\",\"answer\":1},{\"type\":\"calc\",\"problem\":\"6-1\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"6-2\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"7-3\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"8-4\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"9-4\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"7-2\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"6-3\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"8-3\",\"answer\":5}]}', 2, 12, 6, NULL, 2, 0, '2025-12-01 23:43:10.711', '2025-12-02 15:29:39.055'),
('8ab32b3c-2008-42bb-aa3d-ea613dd11ae6', 4, 3, '🏋️ Luyện tập Bạn nhỏ trừ', 'Thành thạo trừ với Bạn nhỏ qua nhiều bài tập', '{\"theory\":[\"⚡ Bí quyết nhanh:\",\"📌 Thấy -4 khi có Trời → Gạt Trời lên, thêm 1 Đất\",\"📌 Thấy -3 khi có Trời → Gạt Trời lên, thêm 2 Đất\",\"📌 Thấy -2 khi có Trời → Gạt Trời lên, thêm 3 Đất\",\"📌 Thấy -1 khi có Trời → Gạt Trời lên, thêm 4 Đất\",\"🎯 Mục tiêu: Phản xạ tự động!\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"5-1\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"5-2\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"5-3\",\"answer\":2},{\"type\":\"calc\",\"problem\":\"5-4\",\"answer\":1},{\"type\":\"calc\",\"problem\":\"6-1\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"6-2\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"6-3\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"6-4\",\"answer\":2},{\"type\":\"calc\",\"problem\":\"7-2\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"7-3\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"8-3\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"8-4\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"9-4\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"9-3\",\"answer\":6}]}', 2, 12, 7, NULL, 3, 0, '2025-12-02 12:52:37.051', '2025-12-02 15:29:39.059'),
('8ae369f6-0c84-49b9-947f-04959412d0ba', 12, 3, '✖️ Luyện tập nhân', 'Tổng hợp các phép nhân', '{\"theory\":[\"🏋️ **LUYỆN TẬP TỔNG HỢP NHÂN**\",\"\",\"📋 **ÔN LẠI:**\",\"✅ Bảng cửu chương 2-9\",\"✅ Nhân số 2 chữ số với 1 chữ số\",\"✅ Tính có nhớ\",\"\",\"💡 **MẸO TÍNH NHANH:**\",\"   🔹 Nhân 11: 11×n = n0 + n → 11×7 = 77\",\"   🔹 Nhân 5: chia 2, nhân 10 → 18×5 = 90\",\"   🔹 Nhân 9: nhân 10, trừ đi → 15×9 = 135\"],\"practice\":[{\"numbers\":[7,8],\"operation\":\"*\",\"answer\":56},{\"numbers\":[9,6],\"operation\":\"*\",\"answer\":54},{\"numbers\":[8,9],\"operation\":\"*\",\"answer\":72},{\"numbers\":[11,6],\"operation\":\"*\",\"answer\":66},{\"numbers\":[12,7],\"operation\":\"*\",\"answer\":84},{\"numbers\":[13,5],\"operation\":\"*\",\"answer\":65},{\"numbers\":[14,4],\"operation\":\"*\",\"answer\":56},{\"numbers\":[15,3],\"operation\":\"*\",\"answer\":45},{\"numbers\":[16,4],\"operation\":\"*\",\"answer\":64},{\"numbers\":[17,5],\"operation\":\"*\",\"answer\":85},{\"numbers\":[18,3],\"operation\":\"*\",\"answer\":54},{\"numbers\":[19,4],\"operation\":\"*\",\"answer\":76},{\"numbers\":[21,3],\"operation\":\"*\",\"answer\":63},{\"numbers\":[22,4],\"operation\":\"*\",\"answer\":88},{\"numbers\":[25,3],\"operation\":\"*\",\"answer\":75}]}', 1, 15, 7, NULL, 3, 0, '2025-12-02 13:32:42.212', '2025-12-02 15:29:39.141'),
('8e869214-f637-4ece-a67d-bde2f837ebcd', 14, 2, '➗ Chia số 2 chữ số', 'Chia số lớn với 1 chữ số', '{\"theory\":[\"📝 **CHIA SỐ 2 CHỮ SỐ CHO 1 CHỮ SỐ**\",\"\",\"🔹 **CÁCH LÀM:**\",\"   1. Chia hàng chục trước\",\"   2. Lấy dư, gộp với hàng đơn vị\",\"   3. Tiếp tục chia\",\"\",\"💡 **VÍ DỤ: 84 ÷ 4**\",\"   Bước 1: 8 ÷ 4 = 2\",\"   Bước 2: 4 ÷ 4 = 1\",\"   ✅ Kết quả: 21\",\"\",\"🎯 **KIỂM TRA:** Thương × Số chia = Số bị chia\"],\"practice\":[{\"numbers\":[42,2],\"operation\":\"/\",\"answer\":21},{\"numbers\":[63,3],\"operation\":\"/\",\"answer\":21},{\"numbers\":[84,4],\"operation\":\"/\",\"answer\":21},{\"numbers\":[55,5],\"operation\":\"/\",\"answer\":11},{\"numbers\":[66,6],\"operation\":\"/\",\"answer\":11},{\"numbers\":[77,7],\"operation\":\"/\",\"answer\":11},{\"numbers\":[48,2],\"operation\":\"/\",\"answer\":24},{\"numbers\":[69,3],\"operation\":\"/\",\"answer\":23},{\"numbers\":[96,4],\"operation\":\"/\",\"answer\":24},{\"numbers\":[75,5],\"operation\":\"/\",\"answer\":15},{\"numbers\":[78,6],\"operation\":\"/\",\"answer\":13},{\"numbers\":[91,7],\"operation\":\"/\",\"answer\":13},{\"numbers\":[88,8],\"operation\":\"/\",\"answer\":11},{\"numbers\":[99,9],\"operation\":\"/\",\"answer\":11},{\"numbers\":[96,8],\"operation\":\"/\",\"answer\":12}]}', 5, 20, 6, NULL, 2, 0, '2025-12-01 23:43:10.776', '2025-12-02 15:29:39.158'),
('8f0ea558-22f6-441b-81f0-0d4a72960dd7', 2, 1, '➕ Cộng 1-2 (đủ hạt)', 'Cộng khi có đủ hạt Đất để gạt', '{\"theory\":[\"✨ Cộng = Gạt thêm hạt Đất lên thanh ngang\",\"👆 1+1: Có 1 hạt, gạt thêm 1 hạt = 2 hạt\",\"👆 2+1: Có 2 hạt, gạt thêm 1 hạt = 3 hạt\",\"👆 1+2: Có 1 hạt, gạt thêm 2 hạt = 3 hạt\",\"💡 Chỉ áp dụng khi còn đủ hạt Đất để gạt!\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"1+1\",\"answer\":2},{\"type\":\"calc\",\"problem\":\"1+2\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"2+1\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"2+2\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"1+3\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"3+1\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"1+1\",\"answer\":2},{\"type\":\"calc\",\"problem\":\"2+1\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"1+2\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"2+2\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"0+3\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"0+4\",\"answer\":4}]}', 1, 10, 5, NULL, 1, 0, '2025-12-01 23:43:10.687', '2025-12-02 15:29:39.025'),
('9230834e-c5d2-4989-9bc4-d1338ce73aef', 15, 2, '🧠 Tưởng tượng số 1-9', 'Hình dung các số trên Soroban ảo', '{\"theory\":[\"🖼️ **HÌNH DUNG SỐ 0-9 TRONG ĐẦU**\",\"\",\"🔹 **SỐ 0:** Tất cả hạt xa thanh ngang (tối)\",\"   Hình dung: 🟤 / 🟤🟤🟤🟤\",\"\",\"🔹 **SỐ 1-4:** Chỉ có hạt dưới gần thanh (sáng)\",\"   1: 🟤 / 🟡🟤🟤🟤\",\"   2: 🟤 / 🟡🟡🟤🟤\",\"   3: 🟤 / 🟡🟡🟡🟤\",\"   4: 🟤 / 🟡🟡🟡🟡\",\"\",\"🔹 **SỐ 5:** Chỉ có hạt trên gần thanh (sáng)\",\"   5: 🟡 / 🟤🟤🟤🟤\",\"\",\"🔹 **SỐ 6-9:** Cả hạt trên và hạt dưới gần thanh\",\"   6: 🟡 / 🟡🟤🟤🟤\",\"   7: 🟡 / 🟡🟡🟤🟤\",\"   8: 🟡 / 🟡🟡🟡🟤\",\"   9: 🟡 / 🟡🟡🟡🟡\",\"\",\"🎯 **BÀI TẬP:**\",\"1. Nhắm mắt, hình dung số 0\",\"2. \\\"Gạt\\\" hạt để tạo số 1, 2, 3...\",\"3. Luyện đến khi thấy rõ ràng\"],\"practice\":[{\"type\":\"mental\",\"problem\":\"5 + 1\",\"answer\":6,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"5 + 2\",\"answer\":7,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"5 + 3\",\"answer\":8,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"5 + 4\",\"answer\":9,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"6 + 1\",\"answer\":7,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"7 + 1\",\"answer\":8,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"8 + 1\",\"answer\":9,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"6 + 2\",\"answer\":8,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"7 + 2\",\"answer\":9,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"6 + 3\",\"answer\":9,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"9 - 1\",\"answer\":8,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"8 - 1\",\"answer\":7,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"7 - 1\",\"answer\":6,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"6 - 1\",\"answer\":5,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"5 - 1\",\"answer\":4,\"timeLimit\":12}]}', 5, 15, 6, NULL, 2, 0, '2025-12-01 23:43:10.781', '2025-12-02 15:29:39.168');
INSERT INTO `lessons` (`id`, `levelId`, `lessonId`, `title`, `description`, `content`, `difficulty`, `duration`, `stars`, `videoUrl`, `order`, `isLocked`, `createdAt`, `updatedAt`) VALUES
('92414a7b-3caa-4d31-8924-04174341ccbd', 12, 1, '✖️ Nhân với số 8, 9', 'Hoàn thành bảng cửu chương', '{\"theory\":[\"📊 **BẢNG NHÂN 8, 9**\",\"\",\"🔢 **NHÂN 8:** 8×1=8, 8×2=16, 8×3=24, 8×4=32, 8×5=40\",\"   8×6=48, 8×7=56, 8×8=64, 8×9=72\",\"\",\"🔢 **NHÂN 9:** 9×1=9, 9×2=18, 9×3=27, 9×4=36, 9×5=45\",\"   9×6=54, 9×7=63, 9×8=72, 9×9=81\",\"\",\"💡 **MẸO NHÂN 9:**\",\"   9×n: hàng chục = n-1, hàng đơn vị = 10-n\",\"   9×7: 7-1=6, 10-7=3 → 63 ✅\",\"\",\"🎯 **MẸO NHÂN 8:**\",\"   8×n = 10×n - 2×n\",\"   8×7 = 70 - 14 = 56\"],\"practice\":[{\"numbers\":[8,6],\"operation\":\"*\",\"answer\":48},{\"numbers\":[8,7],\"operation\":\"*\",\"answer\":56},{\"numbers\":[8,8],\"operation\":\"*\",\"answer\":64},{\"numbers\":[8,9],\"operation\":\"*\",\"answer\":72},{\"numbers\":[9,6],\"operation\":\"*\",\"answer\":54},{\"numbers\":[9,7],\"operation\":\"*\",\"answer\":63},{\"numbers\":[9,8],\"operation\":\"*\",\"answer\":72},{\"numbers\":[9,9],\"operation\":\"*\",\"answer\":81},{\"numbers\":[8,3],\"operation\":\"*\",\"answer\":24},{\"numbers\":[8,4],\"operation\":\"*\",\"answer\":32},{\"numbers\":[8,5],\"operation\":\"*\",\"answer\":40},{\"numbers\":[9,3],\"operation\":\"*\",\"answer\":27},{\"numbers\":[9,4],\"operation\":\"*\",\"answer\":36},{\"numbers\":[9,5],\"operation\":\"*\",\"answer\":45},{\"numbers\":[8,2],\"operation\":\"*\",\"answer\":16}]}', 4, 18, 5, NULL, 1, 0, '2025-12-01 23:43:10.762', '2025-12-02 15:29:39.136'),
('954bd731-37ac-4040-9f5d-36b71b73f2f6', 15, 3, '🧠 Phép tính nhẩm cơ bản', 'Cộng trừ đơn giản bằng Soroban ảo', '{\"theory\":[\"🧮 **TÍNH NHẨM VỚI SOROBAN ẢO**\",\"\",\"📐 **QUY TRÌNH ANZAN:**\",\"\",\"1️⃣ **Đọc số đầu tiên**\",\"   → Hình dung số đó trên Soroban ảo\",\"\",\"2️⃣ **Đọc phép tính**\",\"   → Chuẩn bị \\\"gạt\\\" hạt trong đầu\",\"\",\"3️⃣ **Thực hiện di chuyển ẢO**\",\"   → Tưởng tượng tay gạt hạt\",\"   → NHÌN hạt di chuyển trong đầu\",\"\",\"4️⃣ **Đọc kết quả**\",\"   → Nhìn Soroban ảo, đọc số hiện tại\",\"\",\"💡 **VÍ DỤ: 3 + 2 = 5**\",\"   Bước 1: Hình dung số 3 (🟡🟡🟡 gần thanh)\",\"   Bước 2: Dùng Bạn nhỏ! +5, -3\",\"   Bước 3: Đọc: 🟡 / 🟤🟤🟤🟤 = 5 ✅\",\"\",\"🎯 **MẸO:**\",\"   - Bắt đầu với phép tính đơn giản\",\"   - Làm CHẬM và RÕ RÀNG\",\"   - Tăng tốc dần khi quen\"],\"practice\":[{\"type\":\"mental\",\"problem\":\"2 + 5\",\"answer\":7,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"3 + 5\",\"answer\":8,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"4 + 5\",\"answer\":9,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"1 + 6\",\"answer\":7,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"2 + 6\",\"answer\":8,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"3 + 6\",\"answer\":9,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"1 + 7\",\"answer\":8,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"2 + 7\",\"answer\":9,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"1 + 8\",\"answer\":9,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"9 - 2\",\"answer\":7,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"9 - 3\",\"answer\":6,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"9 - 4\",\"answer\":5,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"8 - 3\",\"answer\":5,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"7 - 2\",\"answer\":5,\"timeLimit\":10},{\"type\":\"mental\",\"problem\":\"6 - 1\",\"answer\":5,\"timeLimit\":10}]}', 1, 15, 7, NULL, 3, 0, '2025-12-02 13:32:42.270', '2025-12-02 15:29:39.171'),
('9ac25c33-11e9-419e-b47c-2219d07f731d', 14, 1, '➗ Chia cho 8, 9', 'Hoàn thành bảng chia', '{\"theory\":[\"📊 **BẢNG CHIA 8, 9**\",\"\",\"🔢 **CHIA 8:** 8÷8=1, 16÷8=2, 24÷8=3, 32÷8=4, 40÷8=5\",\"   48÷8=6, 56÷8=7, 64÷8=8, 72÷8=9\",\"\",\"🔢 **CHIA 9:** 9÷9=1, 18÷9=2, 27÷9=3, 36÷9=4, 45÷9=5\",\"   54÷9=6, 63÷9=7, 72÷9=8, 81÷9=9\",\"\",\"💡 **MẸO:**\",\"   - Chia 8: nhớ bảng nhân 8 ngược lại\",\"   - Chia 9: tổng chữ số chia hết cho 9\",\"\",\"🎯 **VÍ DỤ:** 72 chia được cho cả 8 và 9!\"],\"practice\":[{\"numbers\":[24,8],\"operation\":\"/\",\"answer\":3},{\"numbers\":[27,9],\"operation\":\"/\",\"answer\":3},{\"numbers\":[32,8],\"operation\":\"/\",\"answer\":4},{\"numbers\":[36,9],\"operation\":\"/\",\"answer\":4},{\"numbers\":[40,8],\"operation\":\"/\",\"answer\":5},{\"numbers\":[45,9],\"operation\":\"/\",\"answer\":5},{\"numbers\":[48,8],\"operation\":\"/\",\"answer\":6},{\"numbers\":[54,9],\"operation\":\"/\",\"answer\":6},{\"numbers\":[56,8],\"operation\":\"/\",\"answer\":7},{\"numbers\":[63,9],\"operation\":\"/\",\"answer\":7},{\"numbers\":[64,8],\"operation\":\"/\",\"answer\":8},{\"numbers\":[72,9],\"operation\":\"/\",\"answer\":8},{\"numbers\":[72,8],\"operation\":\"/\",\"answer\":9},{\"numbers\":[81,9],\"operation\":\"/\",\"answer\":9},{\"numbers\":[80,8],\"operation\":\"/\",\"answer\":10}]}', 4, 18, 5, NULL, 1, 0, '2025-12-01 23:43:10.773', '2025-12-02 15:29:39.155'),
('a5e66aec-0cbf-4d78-8b5c-d291a38fd9da', 9, 3, '➖ Trừ 3 chữ số', 'Trừ hai số có 3 chữ số', '{\"theory\":[\"📏 Trừ cũng từ PHẢI sang TRÁI\",\"🔢 Ví dụ: 543-217\",\"📝 Đơn vị: 3-7 → mượn: 13-7 = 6\",\"📝 Chục: 4-1-1 = 2\",\"📝 Trăm: 5-2 = 3\",\"✅ Kết quả: 543-217 = 326\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"456-123\",\"answer\":333},{\"type\":\"calc\",\"problem\":\"543-217\",\"answer\":326},{\"type\":\"calc\",\"problem\":\"678-345\",\"answer\":333},{\"type\":\"calc\",\"problem\":\"789-456\",\"answer\":333},{\"type\":\"calc\",\"problem\":\"800-456\",\"answer\":344},{\"type\":\"calc\",\"problem\":\"725-389\",\"answer\":336},{\"type\":\"calc\",\"problem\":\"912-567\",\"answer\":345},{\"type\":\"calc\",\"problem\":\"654-278\",\"answer\":376},{\"type\":\"calc\",\"problem\":\"876-489\",\"answer\":387},{\"type\":\"calc\",\"problem\":\"999-456\",\"answer\":543},{\"type\":\"calc\",\"problem\":\"500-123\",\"answer\":377},{\"type\":\"calc\",\"problem\":\"700-399\",\"answer\":301}]}', 4, 18, 7, NULL, 3, 0, '2025-12-01 23:43:10.746', '2025-12-02 15:29:39.111'),
('a6ce0ac1-908d-4b32-872a-2bfb8d628a01', 17, 1, '⚡ Tốc độ cơ bản', 'Luyện tính nhanh với số đơn', '{\"theory\":[\"⚡ **LUYỆN TỐC ĐỘ - CẤP ĐỘ 1**\",\"\",\"🎯 **MỤC TIÊU:**\",\"   - Tính 10 phép tính trong 30 giây\",\"   - Phép cộng/trừ 1 chữ số\",\"\",\"📐 **KỸ THUẬT TĂNG TỐC:**\",\"\",\"1️⃣ **Không nói thầm:**\",\"   - Đừng đọc \\\"3 cộng 4 bằng...\\\"\",\"   - Chỉ NHÌN số → Thấy kết quả\",\"\",\"2️⃣ **Phản xạ tự động:**\",\"   - 3 + 4 → 7 (không cần nghĩ)\",\"   - Như nhìn chữ → đọc được ngay\",\"\",\"3️⃣ **Nhịp đều:**\",\"   - Giữ nhịp 3 giây/câu\",\"   - Đừng dừng lại quá lâu ở câu khó\",\"\",\"💡 **BÀI TẬP:**\",\"   - Nhìn số → Gạt Soroban ảo → Đọc kết quả\",\"   - Mỗi bước dưới 1 giây\",\"   - Lặp lại nhiều lần\"],\"practice\":[{\"type\":\"speed\",\"count\":5,\"difficulty\":\"easy\",\"timeLimit\":30},{\"type\":\"speed\",\"count\":8,\"difficulty\":\"easy\",\"timeLimit\":45},{\"type\":\"speed\",\"count\":10,\"difficulty\":\"easy\",\"timeLimit\":60}]}', 5, 12, 5, NULL, 1, 0, '2025-12-01 23:43:10.791', '2025-12-02 15:29:39.185'),
('b6f2ccc2-bda2-4674-8268-9f2b5d0e1bda', 3, 1, '🤝 Làm quen Bạn nhỏ', 'Học về các cặp số cộng lại bằng 5', '{\"theory\":[\"🌟 BẠN NHỎ là hai số cộng lại = 5\",\"👫 1 và 4 là bạn nhỏ của nhau (1+4=5)\",\"👫 2 và 3 là bạn nhỏ của nhau (2+3=5)\",\"💡 Khi hết hạt Đất để cộng, ta dùng Bạn nhỏ!\",\"🎯 Công thức: +N = +5 - bạn nhỏ của N\"],\"practice\":[{\"type\":\"friend5\",\"question\":\"Bạn nhỏ của 1 là mấy?\",\"answer\":4},{\"type\":\"friend5\",\"question\":\"Bạn nhỏ của 4 là mấy?\",\"answer\":1},{\"type\":\"friend5\",\"question\":\"Bạn nhỏ của 2 là mấy?\",\"answer\":3},{\"type\":\"friend5\",\"question\":\"Bạn nhỏ của 3 là mấy?\",\"answer\":2},{\"type\":\"friend5\",\"question\":\"Bạn nhỏ của 1 là mấy?\",\"answer\":4},{\"type\":\"friend5\",\"question\":\"Bạn nhỏ của 2 là mấy?\",\"answer\":3},{\"type\":\"friend5\",\"question\":\"Bạn nhỏ của 3 là mấy?\",\"answer\":2},{\"type\":\"friend5\",\"question\":\"Bạn nhỏ của 4 là mấy?\",\"answer\":1},{\"type\":\"friend5\",\"question\":\"1 + ? = 5\",\"answer\":4},{\"type\":\"friend5\",\"question\":\"2 + ? = 5\",\"answer\":3},{\"type\":\"friend5\",\"question\":\"3 + ? = 5\",\"answer\":2},{\"type\":\"friend5\",\"question\":\"4 + ? = 5\",\"answer\":1}]}', 2, 10, 5, NULL, 1, 0, '2025-12-01 23:43:10.697', '2025-12-02 15:29:39.035'),
('c4166dd9-9b5c-4712-8e66-2d527d5fa44a', 13, 2, '➗ Chia cho 2, 3, 4', 'Luyện chia với số nhỏ', '{\"theory\":[\"📊 **BẢNG CHIA 2, 3, 4**\",\"\",\"🔢 **CHIA 2:** 2÷2=1, 4÷2=2, 6÷2=3, 8÷2=4, 10÷2=5\",\"   12÷2=6, 14÷2=7, 16÷2=8, 18÷2=9\",\"\",\"🔢 **CHIA 3:** 3÷3=1, 6÷3=2, 9÷3=3, 12÷3=4, 15÷3=5\",\"   18÷3=6, 21÷3=7, 24÷3=8, 27÷3=9\",\"\",\"🔢 **CHIA 4:** 4÷4=1, 8÷4=2, 12÷4=3, 16÷4=4, 20÷4=5\",\"   24÷4=6, 28÷4=7, 32÷4=8, 36÷4=9\",\"\",\"💡 **MẸO:**\",\"   - Chia 2 = lấy một nửa\",\"   - Chia 4 = chia 2 hai lần\"],\"practice\":[{\"numbers\":[18,2],\"operation\":\"/\",\"answer\":9},{\"numbers\":[21,3],\"operation\":\"/\",\"answer\":7},{\"numbers\":[24,4],\"operation\":\"/\",\"answer\":6},{\"numbers\":[14,2],\"operation\":\"/\",\"answer\":7},{\"numbers\":[24,3],\"operation\":\"/\",\"answer\":8},{\"numbers\":[28,4],\"operation\":\"/\",\"answer\":7},{\"numbers\":[20,2],\"operation\":\"/\",\"answer\":10},{\"numbers\":[27,3],\"operation\":\"/\",\"answer\":9},{\"numbers\":[32,4],\"operation\":\"/\",\"answer\":8},{\"numbers\":[22,2],\"operation\":\"/\",\"answer\":11},{\"numbers\":[30,3],\"operation\":\"/\",\"answer\":10},{\"numbers\":[36,4],\"operation\":\"/\",\"answer\":9},{\"numbers\":[24,2],\"operation\":\"/\",\"answer\":12},{\"numbers\":[33,3],\"operation\":\"/\",\"answer\":11},{\"numbers\":[40,4],\"operation\":\"/\",\"answer\":10}]}', 4, 15, 6, NULL, 2, 0, '2025-12-01 23:43:10.769', '2025-12-02 15:29:39.146'),
('c4c07827-ad27-4b70-9bbd-7552afefe61f', 5, 1, '🤝 Làm quen Bạn lớn', 'Học về các cặp số cộng lại bằng 10', '{\"theory\":[\"🌟 BẠN LỚN là hai số cộng lại = 10\",\"👫 1 và 9 là bạn lớn của nhau (1+9=10)\",\"👫 2 và 8 là bạn lớn của nhau (2+8=10)\",\"👫 3 và 7 là bạn lớn của nhau (3+7=10)\",\"👫 4 và 6 là bạn lớn của nhau (4+6=10)\",\"👫 5 và 5 là bạn lớn của nhau (5+5=10)\"],\"practice\":[{\"type\":\"friend10\",\"question\":\"Bạn lớn của 1 là mấy?\",\"answer\":9},{\"type\":\"friend10\",\"question\":\"Bạn lớn của 9 là mấy?\",\"answer\":1},{\"type\":\"friend10\",\"question\":\"Bạn lớn của 2 là mấy?\",\"answer\":8},{\"type\":\"friend10\",\"question\":\"Bạn lớn của 8 là mấy?\",\"answer\":2},{\"type\":\"friend10\",\"question\":\"Bạn lớn của 3 là mấy?\",\"answer\":7},{\"type\":\"friend10\",\"question\":\"Bạn lớn của 7 là mấy?\",\"answer\":3},{\"type\":\"friend10\",\"question\":\"Bạn lớn của 4 là mấy?\",\"answer\":6},{\"type\":\"friend10\",\"question\":\"Bạn lớn của 6 là mấy?\",\"answer\":4},{\"type\":\"friend10\",\"question\":\"Bạn lớn của 5 là mấy?\",\"answer\":5},{\"type\":\"friend10\",\"question\":\"1 + ? = 10\",\"answer\":9},{\"type\":\"friend10\",\"question\":\"4 + ? = 10\",\"answer\":6},{\"type\":\"friend10\",\"question\":\"7 + ? = 10\",\"answer\":3}]}', 3, 10, 5, NULL, 1, 0, '2025-12-01 23:43:10.718', '2025-12-02 15:29:39.062'),
('d09fa8e3-d0fb-4af5-a46c-62ff9080147d', 4, 1, '➖ Trừ đơn giản', 'Trừ khi có đủ hạt để bỏ', '{\"theory\":[\"✨ Trừ = Gạt hạt ra xa thanh ngang\",\"👇 Trừ hạt Đất: Gạt hạt Đất xuống (ra xa thanh)\",\"👆 Trừ hạt Trời: Gạt hạt Trời lên (ra xa thanh)\",\"🔢 Ví dụ: 4-2 = Có 4 Đất, gạt bớt 2 Đất = còn 2\",\"💡 Chỉ áp dụng khi có đủ hạt để gạt bỏ!\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"2-1\",\"answer\":1},{\"type\":\"calc\",\"problem\":\"3-1\",\"answer\":2},{\"type\":\"calc\",\"problem\":\"3-2\",\"answer\":1},{\"type\":\"calc\",\"problem\":\"4-1\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"4-2\",\"answer\":2},{\"type\":\"calc\",\"problem\":\"4-3\",\"answer\":1},{\"type\":\"calc\",\"problem\":\"9-3\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"8-2\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"7-1\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"9-4\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"8-3\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"7-2\",\"answer\":5}]}', 2, 10, 5, NULL, 1, 0, '2025-12-01 23:43:10.706', '2025-12-02 15:29:39.049'),
('d4a52d73-15c3-4301-9ca7-248042b7d7fc', 5, 3, '🏋️ Luyện tập Bạn lớn cộng', 'Thành thạo cộng với Bạn lớn qua nhiều bài tập', '{\"theory\":[\"⚡ Bí quyết nhanh:\",\"📌 Thấy +9 → Sang chục, bỏ 1\",\"📌 Thấy +8 → Sang chục, bỏ 2\",\"📌 Thấy +7 → Sang chục, bỏ 3\",\"📌 Thấy +6 → Sang chục, bỏ 4\",\"🎯 Luyện cho đến khi phản xạ tự động!\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"1+9\",\"answer\":10},{\"type\":\"calc\",\"problem\":\"2+9\",\"answer\":11},{\"type\":\"calc\",\"problem\":\"3+9\",\"answer\":12},{\"type\":\"calc\",\"problem\":\"4+9\",\"answer\":13},{\"type\":\"calc\",\"problem\":\"5+9\",\"answer\":14},{\"type\":\"calc\",\"problem\":\"1+8\",\"answer\":9},{\"type\":\"calc\",\"problem\":\"2+8\",\"answer\":10},{\"type\":\"calc\",\"problem\":\"3+8\",\"answer\":11},{\"type\":\"calc\",\"problem\":\"4+8\",\"answer\":12},{\"type\":\"calc\",\"problem\":\"5+8\",\"answer\":13},{\"type\":\"calc\",\"problem\":\"6+7\",\"answer\":13},{\"type\":\"calc\",\"problem\":\"7+6\",\"answer\":13},{\"type\":\"calc\",\"problem\":\"8+5\",\"answer\":13},{\"type\":\"calc\",\"problem\":\"9+4\",\"answer\":13}]}', 3, 12, 7, NULL, 3, 0, '2025-12-02 12:52:37.060', '2025-12-02 15:29:39.072'),
('d617552d-cb17-445e-9c82-93de80194548', 8, 3, '📝 Trừ 2 chữ số', 'Trừ hai số có 2 chữ số', '{\"theory\":[\"📏 Trừ cũng từ PHẢI sang TRÁI\",\"🔢 Ví dụ: 56-23 (không mượn)\",\"📝 Cột đơn vị: 6-3 = 3, Cột chục: 5-2 = 3 → 33\",\"🔢 Ví dụ: 72-48 (có mượn)\",\"📝 Cột đơn vị: 2<8, mượn 1 chục → 12-8 = 4\",\"📝 Cột chục: 7-1-4 = 2 → Kết quả: 24\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"35-12\",\"answer\":23},{\"type\":\"calc\",\"problem\":\"56-23\",\"answer\":33},{\"type\":\"calc\",\"problem\":\"48-15\",\"answer\":33},{\"type\":\"calc\",\"problem\":\"67-34\",\"answer\":33},{\"type\":\"calc\",\"problem\":\"72-48\",\"answer\":24},{\"type\":\"calc\",\"problem\":\"83-57\",\"answer\":26},{\"type\":\"calc\",\"problem\":\"91-45\",\"answer\":46},{\"type\":\"calc\",\"problem\":\"64-38\",\"answer\":26},{\"type\":\"calc\",\"problem\":\"75-49\",\"answer\":26},{\"type\":\"calc\",\"problem\":\"82-56\",\"answer\":26},{\"type\":\"calc\",\"problem\":\"93-67\",\"answer\":26},{\"type\":\"calc\",\"problem\":\"70-35\",\"answer\":35}]}', 4, 15, 7, NULL, 3, 0, '2025-12-01 23:43:10.737', '2025-12-02 15:29:39.103'),
('d7ceb613-ec7e-4386-9974-3eb1302b8161', 6, 3, '🏋️ Luyện tập Bạn lớn trừ', 'Thành thạo trừ với Bạn lớn', '{\"theory\":[\"⚡ Bí quyết nhanh:\",\"📌 Thấy -9 → Mượn chục, thêm 1\",\"📌 Thấy -8 → Mượn chục, thêm 2\",\"📌 Thấy -7 → Mượn chục, thêm 3\",\"📌 Thấy -6 → Mượn chục, thêm 4\",\"🎯 Luyện cho đến khi phản xạ tự động!\"],\"practice\":[{\"type\":\"calc\",\"problem\":\"10-9\",\"answer\":1},{\"type\":\"calc\",\"problem\":\"10-8\",\"answer\":2},{\"type\":\"calc\",\"problem\":\"10-7\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"10-6\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"11-9\",\"answer\":2},{\"type\":\"calc\",\"problem\":\"12-9\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"13-9\",\"answer\":4},{\"type\":\"calc\",\"problem\":\"14-9\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"15-9\",\"answer\":6},{\"type\":\"calc\",\"problem\":\"11-8\",\"answer\":3},{\"type\":\"calc\",\"problem\":\"12-7\",\"answer\":5},{\"type\":\"calc\",\"problem\":\"13-6\",\"answer\":7},{\"type\":\"calc\",\"problem\":\"14-5\",\"answer\":9},{\"type\":\"calc\",\"problem\":\"18-9\",\"answer\":9}]}', 3, 12, 7, NULL, 3, 0, '2025-12-02 13:07:34.849', '2025-12-02 15:29:39.081'),
('d9a6c629-4536-4105-94de-8eb16b746807', 15, 1, '🧠 Giới thiệu Anzan', 'Bắt đầu tập tính nhẩm với Soroban ảo', '{\"theory\":[\"🧠 **ANZAN LÀ GÌ?**\",\"\",\"✨ Anzan (暗算) = Tính toán trong đầu\",\"   - \\\"An\\\" (暗) = tối, ẩn\",\"   - \\\"Zan\\\" (算) = tính toán\",\"\",\"🎯 **SOROBAN ẢO:**\",\"Thay vì dùng Soroban thật, bạn sẽ TƯỞNG TƯỢNG\",\"một chiếc Soroban trong đầu và di chuyển các\",\"hạt trong tưởng tượng!\",\"\",\"📐 **CÁCH HÌNH DUNG SOROBAN ẢO:**\",\"\",\"1️⃣ **Nhắm mắt lại** (hoặc nhìn vào khoảng trống)\",\"\",\"2️⃣ **Tưởng tượng khung Soroban:**\",\"   - Thanh ngang ở giữa\",\"   - 5 hạt mỗi cột (1 trên, 4 dưới)\",\"   - Bắt đầu với hình ảnh số 0\",\"\",\"3️⃣ **Hình dung RÕ RÀNG:**\",\"   - Màu sắc hạt (đen/nâu)\",\"   - Thanh gỗ vàng\",\"   - Vị trí từng hạt\",\"\",\"💡 **BÀI TẬP TẬP TRUNG:**\",\"   - Nhắm mắt 10 giây\",\"   - Hình dung Soroban trống\",\"   - Giữ hình ảnh ổn định\"],\"practice\":[{\"type\":\"mental\",\"problem\":\"1 + 1\",\"answer\":2,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"2 + 1\",\"answer\":3,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"1 + 2\",\"answer\":3,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"2 + 2\",\"answer\":4,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"3 + 1\",\"answer\":4,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"1 + 3\",\"answer\":4,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"2 + 3\",\"answer\":5,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"3 + 2\",\"answer\":5,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"4 + 1\",\"answer\":5,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"3 + 3\",\"answer\":6,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"4 + 2\",\"answer\":6,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"5 + 1\",\"answer\":6,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"3 + 4\",\"answer\":7,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"4 + 3\",\"answer\":7,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"4 + 4\",\"answer\":8,\"timeLimit\":15}]}', 5, 12, 5, NULL, 1, 0, '2025-12-01 23:43:10.778', '2025-12-02 15:29:39.163'),
('e7ed51eb-7a7e-4dab-8058-920d36347898', 16, 2, '🧠 Tính nhẩm 2 chữ số', 'Anzan với số 2 chữ số', '{\"theory\":[\"🔢 **ANZAN VỚI SỐ 2 CHỮ SỐ**\",\"\",\"📐 **CÁCH HÌNH DUNG SỐ 2 CHỮ SỐ:**\",\"\",\"💡 **VÍ DỤ: Số 23**\",\"   - Hình dung 2 CỘT Soroban:\",\"   - Cột TRÁI (hàng chục): số 2 → 🟤 / 🟡🟡🟤🟤\",\"   - Cột PHẢI (hàng đơn vị): số 3 → 🟤 / 🟡🟡🟡🟤\",\"\",\"💡 **VÍ DỤ: Số 57**\",\"   - Cột TRÁI (chục): 5 → 🟡 / 🟤🟤🟤🟤\",\"   - Cột PHẢI (đơn vị): 7 → 🟡 / 🟡🟡🟤🟤\",\"\",\"📐 **PHÉP CỘNG 2 CHỮ SỐ:**\",\"\",\"💡 **VÍ DỤ: 23 + 14**\",\"   Bước 1: Hình dung 23 (2 cột)\",\"   Bước 2: Cộng 4 vào cột đơn vị → 7\",\"   Bước 3: Cộng 1 vào cột chục → 3\",\"   Bước 4: Đọc: 37 ✅\",\"\",\"⚠️ **KHI CÓ NHỚ:**\",\"   VD: 28 + 15\",\"   - Cột đơn vị: 8 + 5 = 13 → ghi 3, nhớ 1\",\"   - Cột chục: 2 + 1 + 1(nhớ) = 4\",\"   - Kết quả: 43 ✅\",\"\",\"🎯 **MẸO:**\",\"   - LUÔN bắt đầu từ cột PHẢI (đơn vị)\",\"   - Nhớ số cần nhớ bằng hình ảnh \\\"chấm đỏ\\\"\"],\"practice\":[{\"type\":\"mental\",\"problem\":\"23 + 14\",\"answer\":37,\"timeLimit\":20},{\"type\":\"mental\",\"problem\":\"31 + 25\",\"answer\":56,\"timeLimit\":20},{\"type\":\"mental\",\"problem\":\"42 + 33\",\"answer\":75,\"timeLimit\":20},{\"type\":\"mental\",\"problem\":\"15 + 24\",\"answer\":39,\"timeLimit\":18},{\"type\":\"mental\",\"problem\":\"28 + 15\",\"answer\":43,\"timeLimit\":18},{\"type\":\"mental\",\"problem\":\"37 + 26\",\"answer\":63,\"timeLimit\":18},{\"type\":\"mental\",\"problem\":\"45 + 38\",\"answer\":83,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"56 + 27\",\"answer\":83,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"63 + 18\",\"answer\":81,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"47 + 35\",\"answer\":82,\"timeLimit\":15},{\"type\":\"mental\",\"problem\":\"38 + 44\",\"answer\":82,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"29 + 53\",\"answer\":82,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"54 + 28\",\"answer\":82,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"67 + 15\",\"answer\":82,\"timeLimit\":12},{\"type\":\"mental\",\"problem\":\"71 + 11\",\"answer\":82,\"timeLimit\":10}]}', 6, 18, 6, NULL, 2, 0, '2025-12-01 23:43:10.786', '2025-12-02 15:29:39.177'),
('f1b962fd-1db0-46e9-bf72-f41476c6a180', 9, 1, '💯 Số 100-999', 'Biểu diễn số 3 chữ số trên Soroban', '{\"theory\":[\"📍 Cột 1 (phải): Hàng đơn vị (1-9)\",\"📍 Cột 2: Hàng chục (10-90)\",\"📍 Cột 3: Hàng trăm (100-900)\",\"🔢 Ví dụ: 456 = 4 trăm + 5 chục + 6 đơn vị\",\"💡 Đọc và gạt từ TRÁI sang PHẢI!\"],\"practice\":[{\"type\":\"create\",\"target\":100},{\"type\":\"create\",\"target\":123},{\"type\":\"create\",\"target\":256},{\"type\":\"create\",\"target\":389},{\"type\":\"create\",\"target\":456},{\"type\":\"create\",\"target\":527},{\"type\":\"create\",\"target\":648},{\"type\":\"create\",\"target\":789},{\"type\":\"create\",\"target\":835},{\"type\":\"create\",\"target\":999},{\"type\":\"create\",\"target\":501},{\"type\":\"create\",\"target\":750}]}', 3, 12, 5, NULL, 1, 0, '2025-12-01 23:43:10.741', '2025-12-02 15:29:39.106'),
('f565906b-09f7-4409-ae23-4b4a4a74dfd3', 12, 2, '✖️ Nhân số 2 chữ số', 'Nhân số lớn với 1 chữ số', '{\"theory\":[\"📝 **NHÂN SỐ 2 CHỮ SỐ VỚI 1 CHỮ SỐ**\",\"\",\"🔹 **CÁCH LÀM:**\",\"   1. Nhân hàng đơn vị trước\",\"   2. Nhân hàng chục sau\",\"   3. Cộng kết quả (có nhớ nếu cần)\",\"\",\"💡 **VÍ DỤ: 23 × 4**\",\"   Bước 1: 3 × 4 = 12 (viết 2, nhớ 1)\",\"   Bước 2: 2 × 4 = 8, + 1 = 9\",\"   ✅ Kết quả: 92\",\"\",\"🎯 **TRÊN SOROBAN:**\",\"   - Đặt 23 ở cột trái\",\"   - Nhân từ phải qua trái\",\"   - Ghi kết quả sang cột phải\"],\"practice\":[{\"numbers\":[12,3],\"operation\":\"*\",\"answer\":36},{\"numbers\":[13,4],\"operation\":\"*\",\"answer\":52},{\"numbers\":[14,5],\"operation\":\"*\",\"answer\":70},{\"numbers\":[15,6],\"operation\":\"*\",\"answer\":90},{\"numbers\":[21,4],\"operation\":\"*\",\"answer\":84},{\"numbers\":[22,3],\"operation\":\"*\",\"answer\":66},{\"numbers\":[23,4],\"operation\":\"*\",\"answer\":92},{\"numbers\":[24,5],\"operation\":\"*\",\"answer\":120},{\"numbers\":[11,7],\"operation\":\"*\",\"answer\":77},{\"numbers\":[11,8],\"operation\":\"*\",\"answer\":88},{\"numbers\":[11,9],\"operation\":\"*\",\"answer\":99},{\"numbers\":[12,5],\"operation\":\"*\",\"answer\":60},{\"numbers\":[13,6],\"operation\":\"*\",\"answer\":78},{\"numbers\":[25,4],\"operation\":\"*\",\"answer\":100},{\"numbers\":[16,5],\"operation\":\"*\",\"answer\":80}]}', 5, 20, 6, NULL, 2, 0, '2025-12-01 23:43:10.764', '2025-12-02 15:29:39.139');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `levels`
--

CREATE TABLE `levels` (
  `id` int NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `order` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `levels`
--

INSERT INTO `levels` (`id`, `name`, `icon`, `description`, `order`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Làm quen', '🌱', 'Làm quen với bàn tính Soroban, cách cầm và gạt hạt', 1, 1, '2025-12-02 12:06:04.773', '2025-12-02 12:06:04.773'),
(2, 'Cộng dễ', '➕', 'Học phép cộng đơn giản trên Soroban', 2, 1, '2025-12-02 12:06:04.783', '2025-12-02 12:06:04.783'),
(3, 'Bạn nhỏ +', '🖐️', 'Phép cộng với bạn nhỏ (số từ 1-4)', 3, 1, '2025-12-02 12:06:04.786', '2025-12-02 12:06:04.786'),
(4, 'Bạn nhỏ -', '✋', 'Phép trừ với bạn nhỏ (số từ 1-4)', 4, 1, '2025-12-02 12:06:04.791', '2025-12-02 12:06:04.791'),
(5, 'Bạn lớn +', '🔟', 'Phép cộng với bạn lớn (số 5)', 5, 1, '2025-12-02 12:06:04.794', '2025-12-02 12:06:04.794'),
(6, 'Bạn lớn -', '🎯', 'Phép trừ với bạn lớn (số 5)', 6, 1, '2025-12-02 12:06:04.797', '2025-12-02 12:06:04.797'),
(7, 'Kết hợp', '🎨', 'Kết hợp bạn nhỏ và bạn lớn', 7, 1, '2025-12-02 12:06:04.800', '2025-12-02 12:06:04.800'),
(8, '2 chữ số', '🔢', 'Tính toán với số có 2 chữ số', 8, 1, '2025-12-02 12:06:04.803', '2025-12-02 12:06:04.803'),
(9, '3 chữ số', '💯', 'Tính toán với số có 3 chữ số', 9, 1, '2025-12-02 12:06:04.808', '2025-12-02 12:06:04.808'),
(10, '4 chữ số', '🏅', 'Tính toán với số có 4 chữ số', 10, 1, '2025-12-02 12:06:04.811', '2025-12-02 12:06:04.811'),
(11, 'Nhân cơ bản', '✖️', 'Học phép nhân cơ bản trên Soroban', 11, 1, '2025-12-02 12:06:04.814', '2025-12-02 12:06:04.814'),
(12, 'Nhân nâng cao', '🔥', 'Phép nhân nâng cao với số lớn', 12, 1, '2025-12-02 12:06:04.817', '2025-12-02 12:06:04.817'),
(13, 'Chia cơ bản', '➗', 'Học phép chia cơ bản trên Soroban', 13, 1, '2025-12-02 12:06:04.822', '2025-12-02 12:06:04.822'),
(14, 'Chia nâng cao', '🌟', 'Phép chia nâng cao với số lớn', 14, 1, '2025-12-02 12:06:04.825', '2025-12-02 12:06:04.825'),
(15, 'Tính nhẩm 1', '🧠', 'Luyện tính nhẩm cơ bản (Anzan)', 15, 1, '2025-12-02 12:06:04.828', '2025-12-02 12:06:04.828'),
(16, 'Tính nhẩm 2', '🚀', 'Luyện tính nhẩm nâng cao', 16, 1, '2025-12-02 12:06:04.831', '2025-12-02 12:06:04.831'),
(17, 'Tốc độ', '⚡', 'Luyện tính nhanh, tăng tốc độ', 17, 1, '2025-12-02 12:06:04.834', '2025-12-02 12:06:04.834'),
(18, 'Thi đấu', '🏆', 'Chuẩn bị kỹ năng thi đấu Soroban', 18, 1, '2025-12-02 12:06:04.839', '2025-12-02 12:06:04.839');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` text COLLATE utf8mb4_unicode_ci,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `notifications`
--

INSERT INTO `notifications` (`id`, `userId`, `type`, `title`, `message`, `data`, `isRead`, `createdAt`) VALUES
('061eebf5-b281-481c-b6a7-f78be3ef0fba', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"🎓 Cử nhân Soroban\"!', '{\"achievementId\":\"99e251d4-4e37-4d12-8389-f1a6f376cfcb\"}', 0, '2025-12-02 08:27:31.444'),
('14dd7053-5120-4e76-ac6d-d6e8d3265f66', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"🔥🔥 Lửa cháy rực\"!', '{\"achievementId\":\"25978449-6a13-45a8-803e-934f35b6a0d7\"}', 0, '2025-12-02 08:27:31.397'),
('2da1817b-f904-497d-9065-20ba80d01c05', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa \"Chính xác tuyệt đối\"!', '{\"achievementId\":\"289d1235-dae4-48f3-bc6a-71c5af21124f\"}', 0, '2025-12-01 16:21:27.536'),
('38594a7b-7216-4590-90fb-536dee3aac96', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa \"Tay nhanh\"!', '{\"achievementId\":\"36b1aac8-2347-4036-af76-d1eb47f71fb9\"}', 0, '2025-12-02 02:13:08.851'),
('3b03357f-11ea-49cb-a506-a889ae6743f3', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"💪 Chiến binh tập sự\"!', '{\"achievementId\":\"19790820-f051-42c8-bde3-fd32cb922a92\"}', 0, '2025-12-02 08:27:31.389'),
('3b288307-59cd-4425-8233-d5e36d0b618e', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"Chuỗi ngày 3\"!', '{\"achievementId\":\"34a498b0-e88b-424d-94e7-401b004e11b5\"}', 0, '2025-12-01 04:32:24.753'),
('3b66329b-3d0a-48aa-8ffb-932bcfe4f37f', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'quest', 'Nhiệm vụ hoàn thành!', 'Bạn đã hoàn thành nhiệm vụ \"🌅 Khởi động buổi sáng\"! Hãy nhận phần thưởng!', '{\"questId\":\"a420b80a-5af4-4dd8-af64-81f2ffc5cccb\"}', 0, '2025-12-04 16:41:26.863'),
('5a645cc0-3396-488a-a2b7-8d86b4f2808d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"🥷 Ninja số học\"!', '{\"achievementId\":\"4c4dcc86-dd6b-498e-87a4-d62a2b9e49e3\"}', 0, '2025-12-02 13:25:30.156'),
('61d29632-19c7-4333-8b32-849fbe8c053e', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"⚔️ Kiếm sĩ Soroban\"!', '{\"achievementId\":\"094a4ef2-688a-4c4a-b93a-d1d5cfd82ba1\"}', 0, '2025-12-02 08:27:31.364'),
('629602ba-6f9e-4a6c-874c-d4acb8f83653', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"✋ Năm ngón đầu tiên\"!', '{\"achievementId\":\"2e39fa3b-42d9-484a-8754-507b260a7091\"}', 0, '2025-12-02 08:27:31.408'),
('72db7805-ccab-4b1b-b0bb-6b03fb9d5bbf', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'quest', 'Nhiệm vụ hoàn thành!', 'Bạn đã hoàn thành nhiệm vụ \"💪 Luyện tập siêng năng\"! Hãy nhận phần thưởng!', '{\"questId\":\"65fd055f-45b2-4da2-9588-88c4f529b7c3\"}', 0, '2025-12-02 08:36:41.506'),
('73b36119-0b47-4a8b-9447-eb2c5e78fc1d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"👨‍🏫 Thạc sĩ tính nhẩm\"!', '{\"achievementId\":\"857d790f-f686-49ea-ad20-e8dd92e69837\"}', 0, '2025-12-02 13:31:44.777'),
('7812e006-f36c-4ca4-aeb5-5dddd3fd3d32', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"📚 Học giả nhỏ tuổi\"!', '{\"achievementId\":\"a7e27792-dab5-4bb0-863f-2eb5c3de0e78\"}', 0, '2025-12-02 08:27:31.454'),
('79859231-c67d-466d-b366-4a19d3c2ac99', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"Học sinh chăm chỉ\"!', '{\"achievementId\":\"2b99823c-6fbd-46ee-8bac-194ca28a74eb\"}', 0, '2025-12-01 13:52:15.742'),
('7c950d4a-b2dc-43d8-9dd0-e0a5c2ab7f23', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"Người mới\"!', '{\"achievementId\":\"ba626f48-a70b-44ae-a8ba-92353771175a\"}', 0, '2025-12-01 08:38:50.576'),
('81949da4-4c72-4193-8aa6-1d9d9ec17f91', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"🔥 Ngọn lửa nhỏ\"!', '{\"achievementId\":\"38c742e6-f8d4-44f3-8c4d-f25219842a17\"}', 0, '2025-12-02 08:27:31.421'),
('93403d94-da80-49f9-96df-a827319481f8', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'quest', 'Nhiệm vụ hoàn thành!', 'Bạn đã hoàn thành nhiệm vụ \"💪 Siêng năng luyện tập\"! Hãy nhận phần thưởng!', '{\"questId\":\"21f04697-b80f-439c-bfa9-d67d275421a6\"}', 0, '2025-12-04 16:43:21.491'),
('a743948a-a50c-4226-9f28-26dd5dbf7aba', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"Chăm chỉ\"!', '{\"achievementId\":\"a5dc49b8-8059-4fd6-8ca5-02ba7a5111bb\"}', 0, '2025-12-01 13:52:15.757'),
('b0d92503-d349-4365-a661-95f144c10adf', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'quest', 'Nhiệm vụ hoàn thành!', 'Bạn đã hoàn thành nhiệm vụ \"Luyện tập hàng ngày\"! Hãy nhận phần thưởng!', '{\"questId\":\"c526bc2f-1d1d-4c80-a8e0-aeb162e80dfa\"}', 0, '2025-12-01 15:06:10.484'),
('c0a57495-4476-4e92-87ea-26d82ca7a5f9', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"📖 Môn đồ Soroban\"!', '{\"achievementId\":\"39e7cfef-3d23-4319-8c01-4e274d707881\"}', 0, '2025-12-02 08:27:31.430'),
('c839a50d-b8db-4cdb-851c-bb3c83804f3a', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"Người mới bắt đầu\"!', '{\"achievementId\":\"3f461173-2a11-4e8d-b4ee-b5917ef19fe9\"}', 0, '2025-12-01 04:32:24.766'),
('ccdedf7b-4665-4daf-93f9-b81d3f8bf0cd', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"🌱 Hạt giống Soroban\"!', '{\"achievementId\":\"c7ac1446-5cb0-480a-b8e6-9a6da5f117fb\"}', 0, '2025-12-02 08:27:31.463'),
('d26ebb63-dd13-4777-bcc4-1d23a3a6836c', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'quest', 'Nhiệm vụ hoàn thành!', 'Bạn đã hoàn thành nhiệm vụ \"🌅 Khởi động buổi sáng\"! Hãy nhận phần thưởng!', '{\"questId\":\"ba8f7308-3ee8-4ea2-bff5-648135fc9a38\"}', 0, '2025-12-02 08:33:59.842'),
('e4eb75b5-57b7-4b1a-b039-0c3e350cca99', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'quest', 'Nhiệm vụ hoàn thành!', 'Bạn đã hoàn thành nhiệm vụ \"Chiến binh cuối tuần\"! Hãy nhận phần thưởng!', '{\"questId\":\"824d6f7f-6ace-4311-81c8-7c63ed7c617b\"}', 0, '2025-12-01 16:22:20.421'),
('edd13ff3-1ceb-4652-804c-050a86ab6dab', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'quest', 'Nhiệm vụ hoàn thành!', 'Bạn đã hoàn thành nhiệm vụ \"🏋️ Vận động viên Soroban\"! Hãy nhận phần thưởng!', '{\"questId\":\"6fac83ac-dee8-48ec-9136-a6d53d48313d\"}', 0, '2025-12-02 13:20:14.205'),
('f1ad5dbc-7ed7-4a1d-b165-dd26759cb8d7', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"Chuỗi 7 ngày\"!', '{\"achievementId\":\"128d916d-7096-4272-be49-e58f98f47723\"}', 0, '2025-12-01 08:38:50.550'),
('f28b87f5-e25d-476f-9eba-e9f25a2b6386', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'quest', 'Nhiệm vụ hoàn thành!', 'Bạn đã hoàn thành nhiệm vụ \"Luyện tập\"! Hãy nhận phần thưởng!', '{\"questId\":\"505a156a-e63d-4353-85c5-da4f744e8879\"}', 0, '2025-12-01 15:06:10.464'),
('fd22ca58-632b-4241-819a-a315bc7af2ff', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'achievement', 'Thành tích mới!', 'Bạn đã mở khóa thành tích \"Chuỗi ngày 7\"!', '{\"achievementId\":\"4daf951d-c622-44c8-ae74-a74274e6064d\"}', 0, '2025-12-01 04:32:24.778');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `progress`
--

CREATE TABLE `progress` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `levelId` int NOT NULL,
  `lessonId` int NOT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `starsEarned` int NOT NULL DEFAULT '0',
  `timeSpent` int NOT NULL DEFAULT '0',
  `accuracy` double NOT NULL DEFAULT '0',
  `completedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `progress`
--

INSERT INTO `progress` (`id`, `userId`, `levelId`, `lessonId`, `completed`, `starsEarned`, `timeSpent`, `accuracy`, `completedAt`, `createdAt`, `updatedAt`) VALUES
('07cd462a-94c5-4b5b-85b3-3c81eb280895', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 3, 3, 1, 4, 27, 133.3333333333333, '2025-12-01 13:56:52.003', '2025-12-01 13:56:52.006', '2025-12-01 13:56:52.006'),
('082408f7-45b5-4ffe-8ebd-9eeeeb61a0dc', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 2, 2, 1, 4, 71, 110, '2025-12-01 13:39:27.219', '2025-12-01 13:39:27.221', '2025-12-01 13:39:27.221'),
('0f92242b-5441-4566-85b6-a3314f794ed1', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 9, 1, 1, 5, 92, 390, '2025-12-01 14:17:34.095', '2025-12-01 14:17:34.097', '2025-12-02 15:29:39.209'),
('14ed665b-4c57-4d6c-a4b7-8cf33465796b', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 4, 2, 1, 4, 126, 110, '2025-12-01 14:01:35.523', '2025-12-01 14:01:35.525', '2025-12-01 14:01:35.525'),
('16cd5a17-6909-4f8c-a290-26ea3f960e1d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 5, 2, 1, 4, 50, 110, '2025-12-01 14:07:28.247', '2025-12-01 14:07:28.249', '2025-12-01 14:07:28.249'),
('2df3fec6-f264-4207-9898-dc6beb2ab40d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 11, 2, 1, 4, 327, 110, '2025-12-02 13:37:15.817', '2025-12-02 13:37:15.818', '2025-12-02 13:37:15.818'),
('36b48e49-3fc7-47d6-8612-36ac28432d20', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 9, 2, 1, 4, 346, 110, '2025-12-01 14:24:04.005', '2025-12-01 14:24:04.006', '2025-12-01 14:24:04.006'),
('37694cfd-1502-4b44-a9a7-cd50ddaea5c3', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 1, 2, 1, 5, 75, 490.0000000000001, '2025-12-04 18:51:44.022', '2025-12-01 13:33:10.075', '2025-12-04 18:51:44.024'),
('4ba191ee-e550-4130-8ad5-9bd01deaf67e', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 2, 3, 1, 4, 90, 120, '2025-12-01 13:41:06.023', '2025-12-01 13:41:06.024', '2025-12-01 13:41:06.024'),
('4ce1dbf4-831d-43c9-b8ec-f17d8b3b6532', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 7, 3, 1, 7, 124, 107.1428571428571, '2025-12-02 13:25:30.132', '2025-12-02 13:25:30.133', '2025-12-02 15:29:39.223'),
('4df128c6-14b8-4582-a402-1d97f2f58d37', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 1, 3, 1, 6, 236, 440.0000000000001, '2025-12-04 16:29:09.638', '2025-12-01 13:35:24.853', '2025-12-04 16:29:09.641'),
('5bf8788a-d262-4976-a920-cf90c69df9e6', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 10, 1, 1, 5, 133, 430, '2025-12-01 13:46:59.055', '2025-12-01 13:46:59.056', '2025-12-02 15:29:39.228'),
('6889f7bc-f1b6-4804-b2cf-c4b2065d942a', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 6, 3, 1, 4, 35, 125, '2025-12-01 14:14:06.450', '2025-12-01 14:14:06.452', '2025-12-01 14:14:06.452'),
('75b0b16e-699b-4b3d-99ef-6dcfaca825fa', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 4, 1, 1, 4, 64, 110, '2025-12-01 13:58:57.389', '2025-12-01 13:58:57.391', '2025-12-01 13:58:57.391'),
('7cd79998-1e0f-41bd-b4f7-ef09c50e4d8f', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 6, 2, 1, 6, 32, 100, '2025-12-05 14:42:12.476', '2025-12-01 14:13:28.468', '2025-12-05 14:42:12.477'),
('873d07a4-5db0-417f-aab8-e0bc71982915', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 1, 4, 1, 6, 73, 800, '2025-12-01 13:36:45.543', '2025-12-01 13:36:45.545', '2025-12-02 15:29:39.235'),
('8a575bbc-0954-4698-a0ed-1365646a14c0', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 3, 2, 1, 4, 66, 110, '2025-12-01 13:56:21.823', '2025-12-01 13:56:21.824', '2025-12-01 13:56:21.824'),
('930fc02b-9978-4c2c-bd30-890718d91cb8', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 2, 1, 1, 4, 137, 110, '2025-12-02 09:39:07.277', '2025-12-01 13:38:11.174', '2025-12-02 09:39:07.278'),
('983952fa-6042-4da7-bcd3-80a041e8c5af', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 5, 1, 1, 3, 195, 100, '2025-12-01 14:06:04.655', '2025-12-01 14:06:04.657', '2025-12-01 14:06:04.657'),
('9f3e37b5-09f2-46b8-ae45-c8cbb95c9a26', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 1, 1, 1, 6, 23, 116.6666666666667, '2025-12-04 18:59:46.091', '2025-12-01 04:32:24.706', '2025-12-04 18:59:46.093'),
('b3907ae4-735d-46b3-80b2-4d9200a3bc87', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 17, 1, 1, 2, 34, 66.66666666666666, '2025-12-02 14:40:50.131', '2025-12-02 14:40:50.134', '2025-12-02 14:40:50.134'),
('dd6f1b49-234a-4247-ae93-0eff5055b240', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 3, 1, 1, 4, 131, 112.5, '2025-12-01 13:55:11.391', '2025-12-01 13:55:11.393', '2025-12-01 13:55:11.393'),
('e41d9ec4-0966-4f09-b653-888ed8f1f1e5', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 4, 3, 1, 4, 29, 120, '2025-12-01 14:02:06.508', '2025-12-01 14:02:06.510', '2025-12-01 14:02:06.510'),
('e5707820-d4c0-443d-a9ed-703ce19d3358', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 6, 1, 1, 4, 88, 110, '2025-12-01 14:12:19.685', '2025-12-01 14:12:19.687', '2025-12-01 14:12:19.687'),
('e80aab79-bbac-4830-835c-292c213d4861', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 7, 1, 1, 4, 103, 110, '2025-12-01 13:43:16.354', '2025-12-01 13:43:16.356', '2025-12-01 13:43:16.356'),
('e986f2a0-8d0d-43c9-85c7-62f228eb5598', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 7, 2, 1, 6, 482, 100, '2025-12-05 13:42:11.608', '2025-12-01 13:52:15.699', '2025-12-05 13:42:11.610'),
('ed97a5d7-4b8c-461f-9827-8f03928accae', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 11, 1, 1, 4, 191, 110, '2025-12-02 13:31:44.730', '2025-12-02 13:31:44.732', '2025-12-02 13:31:44.732'),
('facb2aee-6a64-43df-ab57-31a8035f30ad', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 5, 3, 1, 4, 25, 125, '2025-12-01 14:07:55.959', '2025-12-01 14:07:55.961', '2025-12-01 14:07:55.961');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `purchases`
--

CREATE TABLE `purchases` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `itemId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `totalPrice` int NOT NULL,
  `purchasedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quests`
--

CREATE TABLE `quests` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirement` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stars` int NOT NULL DEFAULT '50',
  `diamonds` int NOT NULL DEFAULT '10',
  `expiresAt` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `quests`
--

INSERT INTO `quests` (`id`, `title`, `description`, `type`, `category`, `requirement`, `stars`, `diamonds`, `expiresAt`, `isActive`, `createdAt`) VALUES
('12e6b36d-958a-4310-8b6c-a4282341b526', '📖 Học bài mới', 'Hoàn thành 1 bài học hôm nay', 'daily', 'lesson', '{\"type\":\"complete_lessons\",\"count\":1,\"metric\":\"lessons_completed_today\"}', 20, 2, NULL, 1, '2025-12-02 23:32:00.497'),
('1754d0fe-98fc-41bf-b6e1-95b81de82969', '👑 Hoàn thành chương trình', 'Hoàn thành tất cả 18 màn chơi', 'special', 'mastery', '{\"type\":\"complete_levels\",\"count\":18,\"metric\":\"levels_completed\"}', 300, 50, NULL, 1, '2025-12-02 23:32:00.529'),
('178a5de6-6432-4041-ad9d-6ae8776f6618', '🎖️ Chiến binh kiên cường', 'Học 14 ngày liên tiếp (2 tuần)', 'special', 'streak', '{\"type\":\"login_streak\",\"count\":14,\"metric\":\"max_streak\"}', 150, 30, NULL, 1, '2025-12-02 23:32:00.525'),
('1b659a1c-1e19-4dab-aea6-c6f682357fe8', '🎯 Chính xác cao', 'Làm đúng 5 bài liên tiếp', 'daily', 'accuracy', '{\"type\":\"accuracy_streak\",\"count\":5,\"metric\":\"accurate_exercises_streak\"}', 20, 3, NULL, 1, '2025-12-02 23:32:00.506'),
('21f04697-b80f-439c-bfa9-d67d275421a6', '💪 Siêng năng luyện tập', 'Hoàn thành 15 bài tập trong ngày', 'daily', 'practice', '{\"type\":\"complete_exercises\",\"count\":15,\"metric\":\"exercises_completed_today\"}', 25, 3, NULL, 1, '2025-12-02 23:32:00.504'),
('27dd6f79-1f39-4399-b5fc-cc12f370e229', '🔥 Ngọn lửa bền bỉ', 'Học 5 ngày liên tiếp', 'weekly', 'streak', '{\"type\":\"login_streak\",\"count\":5,\"metric\":\"current_streak\"}', 60, 10, NULL, 1, '2025-12-02 23:32:00.517'),
('4be2017c-68e0-4e56-a33d-7add72dfccd8', '🧠 Bậc thầy tính nhẩm', 'Làm đúng 50 bài tập (tổng cộng)', 'special', 'accuracy', '{\"type\":\"accurate_exercises\",\"count\":50,\"metric\":\"total_accurate_exercises\"}', 100, 20, NULL, 1, '2025-12-02 23:32:00.523'),
('76cec951-1687-4238-9f42-61494e860568', '🏆 Nhà vô địch', 'Làm đúng 10 bài tập trong tuần', 'weekly', 'accuracy', '{\"type\":\"perfect_exercises\",\"count\":10,\"metric\":\"perfect_exercises_week\"}', 40, 6, NULL, 1, '2025-12-02 23:32:00.519'),
('9737f655-8d48-4224-b4e3-296168383146', '📚 Tuần học tập', 'Hoàn thành 3 bài học trong tuần', 'weekly', 'lesson', '{\"type\":\"complete_lessons\",\"count\":3,\"metric\":\"lessons_completed_week\"}', 50, 8, NULL, 1, '2025-12-02 23:32:00.509'),
('9ea7900b-69af-439c-a211-25850ed3601a', '🏋️ Vận động viên', 'Hoàn thành 40 bài tập trong tuần', 'weekly', 'practice', '{\"type\":\"complete_exercises\",\"count\":40,\"metric\":\"exercises_completed_week\"}', 50, 8, NULL, 1, '2025-12-02 23:32:00.514'),
('a420b80a-5af4-4dd8-af64-81f2ffc5cccb', '🌅 Khởi động buổi sáng', 'Làm 5 bài tập luyện tập', 'daily', 'practice', '{\"type\":\"complete_exercises\",\"count\":5,\"metric\":\"exercises_completed_today\"}', 15, 2, NULL, 1, '2025-12-02 23:32:00.501'),
('fe2158f8-d457-461c-8d4e-6d6033ef44c3', '🌟 Ngôi sao học tập', 'Hoàn thành 3 màn chơi (level)', 'special', 'mastery', '{\"type\":\"complete_levels\",\"count\":3,\"metric\":\"levels_completed\"}', 100, 20, NULL, 1, '2025-12-02 23:32:00.521');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shop_items`
--

CREATE TABLE `shop_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` int NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `shop_items`
--

INSERT INTO `shop_items` (`id`, `name`, `description`, `icon`, `category`, `price`, `type`, `data`, `isActive`, `createdAt`) VALUES
('2865a464-48b3-48db-96dd-05efa1fe5c6a', 'Avatar Ninja', 'Avatar độc đáo hình ninja', '🥷', 'avatar', 50, 'permanent', '{\"avatarId\":\"ninja\"}', 1, '2025-10-17 09:39:02.532'),
('2de03f8b-764d-493f-bb46-46b89d0e6943', 'Theme Rừng nhiệt đới', 'Giao diện rừng xanh mát', '🌴', 'theme', 150, 'permanent', '{\"themeId\":\"forest\"}', 1, '2025-10-17 09:39:02.555'),
('2f4a4349-6238-4138-bdc8-dedda44b48ed', 'Avatar Robot', 'Avatar robot công nghệ cao', '🤖', 'avatar', 50, 'permanent', '{\"avatarId\":\"robot\"}', 1, '2025-10-17 09:39:02.535'),
('356a05e1-d1a0-42fe-9cbb-6750eb133d53', 'Gấp đôi sao', 'Nhận gấp đôi sao trong 1 giờ', '⭐', 'power-up', 30, 'consumable', '{\"powerUpType\":\"double_stars\",\"duration\":3600}', 1, '2025-10-17 09:39:02.548'),
('61c8a707-3cba-427b-a58b-4a778eb420ab', 'Gợi ý', '5 lần gợi ý', '💡', 'power-up', 10, 'consumable', '{\"powerUpType\":\"hint\",\"uses\":5}', 1, '2025-12-01 06:57:46.811'),
('ad4c1894-7c2a-4f86-a8ce-d4f7d982dd51', 'Gợi ý thông minh', 'Nhận gợi ý khi làm bài', '💡', 'power-up', 10, 'consumable', '{\"powerUpType\":\"hint\",\"uses\":5}', 1, '2025-10-17 09:39:02.541'),
('e52cedb2-8828-4d66-9099-21a6415b2912', 'Avatar Công chúa', 'Avatar công chúa xinh đẹp', '👸', 'avatar', 50, 'permanent', '{\"avatarId\":\"princess\"}', 1, '2025-10-17 09:39:02.538'),
('f327adbb-5221-4f98-b93b-976eb5266cc4', 'Theme Tối', 'Giao diện tối bảo vệ mắt', '🌙', 'theme', 100, 'permanent', '{\"themeId\":\"dark\"}', 1, '2025-10-17 09:39:02.551'),
('f5337186-4f2c-4ef3-9b1f-6801cf4b4a3a', 'Thời gian thêm', 'Thêm 30 giây làm bài', '⏱️', 'power-up', 15, 'consumable', '{\"powerUpType\":\"time\",\"seconds\":30}', 1, '2025-10-17 09:39:02.545');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` int NOT NULL DEFAULT '1',
  `totalStars` int NOT NULL DEFAULT '0',
  `diamonds` int NOT NULL DEFAULT '5',
  `streak` int NOT NULL DEFAULT '0',
  `lastLoginDate` datetime(3) DEFAULT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'student',
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `totalEXP` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `password`, `name`, `avatar`, `level`, `totalStars`, `diamonds`, `streak`, `lastLoginDate`, `role`, `parentId`, `createdAt`, `updatedAt`, `totalEXP`) VALUES
('225b14be-eb2e-488d-a846-80c908bed2a3', 'diana@sorokids.com', 'diana_pham', '$2a$12$R42gRfgYKsHaTZe8FxhrsuufWQXP2LT6ZBNfEPagm0KuNq4lnT4tq', 'Diana Phạm', NULL, 6, 590, 75, 12, '2025-10-16 01:05:54.060', 'student', NULL, '2025-10-17 09:47:39.685', '2025-10-17 09:47:39.685', 0),
('35c7b6b5-a7f9-4d2a-b00d-2fe1caea8097', 'fiona@sorokids.com', 'fiona_hoang', '$2a$12$T6am5Lw8cpauicg7zPKohOLNncokyg4cToRMUvtoL.d6g7RnZdnay', 'Fiona Hoàng', NULL, 5, 480, 55, 7, '2025-10-17 05:54:48.735', 'student', NULL, '2025-10-17 09:47:40.261', '2025-10-17 09:47:40.261', 0),
('402ddf1f-c764-44ed-ab8d-8617610a6b1a', 'demo1@sorokids.com', 'demo1', '$2a$12$SKF1Qe9rvvFLFBi/LOqyNe65Z2tnn/IhJUzMDLLeTDboyJcupWymC', 'demo1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo1', 1, 0, 5, 0, NULL, 'student', NULL, '2025-12-06 01:52:19.652', '2025-12-06 01:52:19.652', 0),
('56b75061-c50c-47dd-9c24-6b4a283da7ba', 'bob@sorokids.com', 'bob_tran', '$2a$12$4YshKkBK8aB6vwQAct39aui0lDeBcyhVygjhESXZIZJfdfRt/UsKG', 'Bob Trần', NULL, 7, 720, 95, 10, '2025-10-12 06:35:56.720', 'student', NULL, '2025-10-17 09:47:39.110', '2025-10-17 09:47:39.110', 0),
('720875cb-95c3-4721-9d96-83f832b3afeb', 'alice@sorokids.com', 'alice_nguyen', '$2a$12$fETr6d6wOIJ12xizs2t8J.qXn7jx1o9wPfIi9Exc4zI.SV1s2DSYq', 'Alice Nguyễn', NULL, 8, 850, 120, 15, '2025-10-13 21:57:24.754', 'student', NULL, '2025-10-17 09:47:38.814', '2025-10-17 09:47:38.814', 0),
('8a447ac4-69a7-49ca-970d-23620d30041b', 'hannah@sorokids.com', 'hannah_bui', '$2a$12$RFid1GbL5nFgq8E7b3V1QONGFm2Bnwywvw1bzebyEf8oo7sYyneem', 'Hannah Bùi', NULL, 4, 380, 40, 6, '2025-10-12 21:28:45.086', 'student', NULL, '2025-10-17 09:47:40.833', '2025-10-17 09:47:40.833', 0),
('947b52a4-5b84-487a-b984-ff3a3804c52c', 'charlie@sorokids.com', 'charlie_le', '$2a$12$rlEQ7gtVwkG3ONIMHY027.DMdBJUCIt/IJKau.ZscLM0sOVBCBWzq', 'Charlie Lê', NULL, 6, 680, 80, 8, '2025-10-12 05:24:20.132', 'student', NULL, '2025-10-17 09:47:39.398', '2025-10-17 09:47:39.398', 0),
('bc8600b6-27cf-488a-beae-f328134daa30', 'ivan@sorokids.com', 'ivan_do', '$2a$12$ThsiO5DKABjDfY.sBEI5A.HZHZw2FzMczubhF1BRm0e.OzxjZyvy2', 'Ivan Đỗ', NULL, 3, 340, 35, 3, '2025-10-11 12:03:06.882', 'student', NULL, '2025-10-17 09:47:41.126', '2025-10-17 09:47:41.126', 0),
('bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'demo@sorokids.com', 'demo_user', '$2a$12$V7WdKslWgIOYK4zyGaTi7uF2AMR7EDuPb8Qjujc6g2uo79H6N12O.', 'Demo User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo', 50, 7479, 540, 7, '2025-10-17 09:47:38.508', 'student', NULL, '2025-10-17 09:47:38.519', '2025-12-05 14:42:12.488', 10920),
('c483119f-54b8-4b33-97fc-efbbdc9397c1', 'julia@sorokids.com', 'julia_ngo', '$2a$12$wJ/DaexNwYyFUeUEFNHhoOtoYNegc1pcnFjxDB.Ol/y/k6JYVwhOi', 'Julia Ngô', NULL, 3, 290, 30, 2, '2025-10-16 09:54:26.754', 'student', NULL, '2025-10-17 09:47:41.406', '2025-10-17 09:47:41.406', 0),
('e4b494f5-2197-4e41-aeef-328eda1ce2a1', 'george@sorokids.com', 'george_dang', '$2a$12$XNMZL61uQdURndwqfyhYK.XDjp0hUXRFmllzVt1pItFbfqwPKInCO', 'George Đặng', NULL, 4, 420, 45, 4, '2025-10-11 21:56:37.660', 'student', NULL, '2025-10-17 09:47:40.541', '2025-10-17 09:47:40.541', 0),
('fd19579c-80fb-4ea7-9ce2-79c4afed99b8', 'evan@sorokids.com', 'evan_vo', '$2a$12$GC1UD0kUenR3Qz9DcAFA2O0M9x3VTjbDJ8cH/4eFulJQGyBbTAPRq', 'Evan Võ', NULL, 5, 520, 60, 5, '2025-10-10 20:11:03.468', 'student', NULL, '2025-10-17 09:47:39.970', '2025-10-17 09:47:39.970', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_achievements`
--

CREATE TABLE `user_achievements` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `achievementId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unlockedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user_achievements`
--

INSERT INTO `user_achievements` (`id`, `userId`, `achievementId`, `unlockedAt`) VALUES
('2ef2d4ec-d596-4791-a83e-743572e3f047', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '38c742e6-f8d4-44f3-8c4d-f25219842a17', '2025-12-02 08:27:31.412'),
('5032d5c2-d640-46da-a4a9-ee0083577e54', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '19790820-f051-42c8-bde3-fd32cb922a92', '2025-12-02 08:27:31.383'),
('51c08c09-2d37-48ca-a8e9-a702177b639d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'a7e27792-dab5-4bb0-863f-2eb5c3de0e78', '2025-12-02 08:27:31.446'),
('5566256f-a7e0-4b67-8ce7-8b27fca9dada', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '39e7cfef-3d23-4319-8c01-4e274d707881', '2025-12-02 08:27:31.424'),
('5f3f0024-0933-46d2-b4c8-5d2e7bc50fd8', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '4c4dcc86-dd6b-498e-87a4-d62a2b9e49e3', '2025-12-02 13:25:30.149'),
('63e0675f-b19a-40ac-8cc2-f6594127ebd3', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '25978449-6a13-45a8-803e-934f35b6a0d7', '2025-12-02 08:27:31.392'),
('669203b5-d5cc-4db7-8fe4-5791608ca2ce', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '99e251d4-4e37-4d12-8389-f1a6f376cfcb', '2025-12-02 08:27:31.438'),
('8b1cb5af-32d3-44c4-8826-aa9b03254c18', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '2e39fa3b-42d9-484a-8754-507b260a7091', '2025-12-02 08:27:31.400'),
('c830c449-8b5c-467a-9c80-6a16981758f1', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'c7ac1446-5cb0-480a-b8e6-9a6da5f117fb', '2025-12-02 08:27:31.457'),
('c89e9d53-3971-48af-866e-ab632401dd5f', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '094a4ef2-688a-4c4a-b93a-d1d5cfd82ba1', '2025-12-02 08:27:31.357'),
('e1e845f4-d29b-46c9-a186-f7d297abff9d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '857d790f-f686-49ea-ad20-e8dd92e69837', '2025-12-02 13:31:44.767');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_quests`
--

CREATE TABLE `user_quests` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `questId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `progress` int NOT NULL DEFAULT '0',
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `claimedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user_quests`
--

INSERT INTO `user_quests` (`id`, `userId`, `questId`, `progress`, `completed`, `claimedAt`, `createdAt`) VALUES
('283d460f-32b2-4c5f-8b54-e851d85ef81d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '1754d0fe-98fc-41bf-b6e1-95b81de82969', 7, 0, NULL, '2025-12-02 23:32:56.273'),
('3f3f43d9-f71f-4521-b2e0-25c58003dd7c', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '27dd6f79-1f39-4399-b5fc-cc12f370e229', 5, 1, '2025-12-02 23:33:15.685', '2025-12-02 23:32:56.266'),
('4461d146-f58f-49ba-80a9-3ac6adb7d911', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '9ea7900b-69af-439c-a211-25850ed3601a', 40, 1, '2025-12-02 23:33:32.627', '2025-12-02 23:32:56.264'),
('5d7df87f-9298-478a-9841-e941ca1751a9', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'a420b80a-5af4-4dd8-af64-81f2ffc5cccb', 5, 1, '2025-12-04 16:55:04.678', '2025-12-04 16:40:36.785'),
('7af8b2a4-e9bc-4ee9-9e39-906099748707', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '9737f655-8d48-4224-b4e3-296168383146', 3, 1, '2025-12-02 23:33:24.236', '2025-12-02 23:32:56.264'),
('888aa1a9-e1ea-4b2d-ac1e-bf46e406cfa9', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '21f04697-b80f-439c-bfa9-d67d275421a6', 15, 1, '2025-12-04 16:55:13.222', '2025-12-04 16:40:36.780'),
('9a55c503-48f0-43c9-8605-6b634ef1f3c0', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '1b659a1c-1e19-4dab-aea6-c6f682357fe8', 5, 1, '2025-12-02 23:33:10.559', '2025-12-02 23:32:56.265'),
('a92df894-5c85-4221-a0ac-dc5862f51ce1', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '178a5de6-6432-4041-ad9d-6ae8776f6618', 2, 0, NULL, '2025-12-02 23:32:56.266'),
('b0e4da3b-dfd9-46c1-a869-026b380f6799', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '76cec951-1687-4238-9f42-61494e860568', 10, 1, '2025-12-02 23:33:27.817', '2025-12-02 23:32:56.264'),
('c9529607-8306-46c5-a21d-c42866699e91', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '4be2017c-68e0-4e56-a33d-7add72dfccd8', 50, 1, '2025-12-02 23:33:20.940', '2025-12-02 23:32:56.265'),
('e6b62568-9160-4468-b470-cf51f89c143d', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', 'fe2158f8-d457-461c-8d4e-6d6033ef44c3', 3, 1, '2025-12-02 23:33:36.349', '2025-12-02 23:32:56.272'),
('f9b73d81-293a-492f-88fa-88307b52256b', 'bcb5bc4c-e50b-4c4a-b518-ba4a3ce638fb', '12e6b36d-958a-4310-8b6c-a4282341b526', 1, 1, '2025-12-04 16:30:01.505', '2025-12-04 16:29:22.500');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('36a61f0f-1143-4f9c-9ca8-fb3d553e096a', '14b9703e17fa05fcd8f41359803f8b1bea5d76d9052b3377c9e86c8bd8d5fddb', NULL, '20251202120249_add_level_table', 'A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20251202120249_add_level_table\n\nDatabase error code: 1452\n\nDatabase error:\nCannot add or update a child row: a foreign key constraint fails (`sorokids`.`#sql-2a20_39`, CONSTRAINT `lessons_levelId_fkey` FOREIGN KEY (`levelId`) REFERENCES `levels` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE)\n\nPlease check the query number 2 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20251202120249_add_level_table\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20251202120249_add_level_table\"\n             at schema-engine\\core\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:226', '2025-12-02 12:03:15.491', '2025-12-02 12:02:49.807', 0),
('4c297010-ef2d-4d44-bb0b-68c659990fe8', 'cd48e9d63f8ad9aa52ed117d6040ffecbdb27408d785cf5d5de48d08a7b57329', '2025-10-17 09:38:44.766', '20251017093843_init', NULL, NULL, '2025-10-17 09:38:43.713', 1),
('63135a22-bdf9-49c0-a9b8-e84950643beb', '122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec', '2025-10-17 09:44:22.897', '20251017094325_add_new_features', NULL, NULL, '2025-10-17 09:44:22.892', 1),
('9f836558-cc12-497c-9668-c058e5be5fe8', '554dc8d88e0b2c21501ce503c9d2fa954143224384510027ff448f3f5777bdda', '2025-12-02 02:34:25.555', '20251202023425_add_compete_results', NULL, NULL, '2025-12-02 02:34:25.477', 1),
('e0a89908-f231-4e79-ae6d-c917f6005202', '38fca0b0a053b87d537ff8e6b101cd58696548c2387c44cf6eb15b4e71cd270c', '2025-12-01 12:26:05.092', '20251201122605_add_total_exp', NULL, NULL, '2025-12-01 12:26:05.041', 1);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `achievements_name_key` (`name`);

--
-- Chỉ mục cho bảng `challenges`
--
ALTER TABLE `challenges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `challenges_creatorId_fkey` (`creatorId`);

--
-- Chỉ mục cho bảng `challenge_participations`
--
ALTER TABLE `challenge_participations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `challenge_participations_userId_challengeId_key` (`userId`,`challengeId`),
  ADD KEY `challenge_participations_challengeId_fkey` (`challengeId`);

--
-- Chỉ mục cho bảng `compete_results`
--
ALTER TABLE `compete_results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `compete_results_userId_arenaId_key` (`userId`,`arenaId`),
  ADD KEY `compete_results_arenaId_correct_totalTime_idx` (`arenaId`,`correct`,`totalTime`);

--
-- Chỉ mục cho bảng `exercise_results`
--
ALTER TABLE `exercise_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exercise_results_userId_createdAt_idx` (`userId`,`createdAt`);

--
-- Chỉ mục cho bảng `friends`
--
ALTER TABLE `friends`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `friends_userId_friendId_key` (`userId`,`friendId`),
  ADD KEY `friends_friendId_fkey` (`friendId`);

--
-- Chỉ mục cho bảng `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lessons_levelId_lessonId_key` (`levelId`,`lessonId`);

--
-- Chỉ mục cho bảng `levels`
--
ALTER TABLE `levels`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_userId_isRead_createdAt_idx` (`userId`,`isRead`,`createdAt`);

--
-- Chỉ mục cho bảng `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `progress_userId_levelId_lessonId_key` (`userId`,`levelId`,`lessonId`);

--
-- Chỉ mục cho bảng `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchases_userId_fkey` (`userId`),
  ADD KEY `purchases_itemId_fkey` (`itemId`);

--
-- Chỉ mục cho bảng `quests`
--
ALTER TABLE `quests`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `shop_items`
--
ALTER TABLE `shop_items`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_username_key` (`username`);

--
-- Chỉ mục cho bảng `user_achievements`
--
ALTER TABLE `user_achievements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_achievements_userId_achievementId_key` (`userId`,`achievementId`),
  ADD KEY `user_achievements_achievementId_fkey` (`achievementId`);

--
-- Chỉ mục cho bảng `user_quests`
--
ALTER TABLE `user_quests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_quests_userId_questId_key` (`userId`,`questId`),
  ADD KEY `user_quests_questId_fkey` (`questId`);

--
-- Chỉ mục cho bảng `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `challenges`
--
ALTER TABLE `challenges`
  ADD CONSTRAINT `challenges_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `challenge_participations`
--
ALTER TABLE `challenge_participations`
  ADD CONSTRAINT `challenge_participations_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `challenges` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `challenge_participations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `compete_results`
--
ALTER TABLE `compete_results`
  ADD CONSTRAINT `compete_results_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `exercise_results`
--
ALTER TABLE `exercise_results`
  ADD CONSTRAINT `exercise_results_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `friends`
--
ALTER TABLE `friends`
  ADD CONSTRAINT `friends_friendId_fkey` FOREIGN KEY (`friendId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `friends_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `progress`
--
ALTER TABLE `progress`
  ADD CONSTRAINT `progress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `shop_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `user_achievements`
--
ALTER TABLE `user_achievements`
  ADD CONSTRAINT `user_achievements_achievementId_fkey` FOREIGN KEY (`achievementId`) REFERENCES `achievements` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_achievements_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `user_quests`
--
ALTER TABLE `user_quests`
  ADD CONSTRAINT `user_quests_questId_fkey` FOREIGN KEY (`questId`) REFERENCES `quests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_quests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
