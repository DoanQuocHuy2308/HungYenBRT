-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: hungyenbrt
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '3234c103-031b-11f1-ad27-b48c9d8e705e:1-21286';

--
-- Table structure for table `discount_field_values`
--

DROP TABLE IF EXISTS `discount_field_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discount_field_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_Discount_Field` int NOT NULL,
  `id_discountRegistration` int NOT NULL,
  `field_Value` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_Discount_Field` (`id_Discount_Field`),
  KEY `id_discountRegistration` (`id_discountRegistration`),
  CONSTRAINT `discount_field_values_ibfk_133` FOREIGN KEY (`id_Discount_Field`) REFERENCES `discount_fields` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `discount_field_values_ibfk_134` FOREIGN KEY (`id_discountRegistration`) REFERENCES `discount_registrations` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discount_field_values`
--

LOCK TABLES `discount_field_values` WRITE;
/*!40000 ALTER TABLE `discount_field_values` DISABLE KEYS */;
/*!40000 ALTER TABLE `discount_field_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discount_fields`
--

DROP TABLE IF EXISTS `discount_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discount_fields` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_Discount_Type` int NOT NULL,
  `field_Name` varchar(255) NOT NULL,
  `field_Type` enum('text','image') DEFAULT 'text' COMMENT 'Loại dữ liệu: text (nhập liệu) hoặc image (tải ảnh)',
  `is_Required` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_Discount_Type` (`id_Discount_Type`),
  CONSTRAINT `discount_fields_ibfk_1` FOREIGN KEY (`id_Discount_Type`) REFERENCES `discount_types` (`Id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discount_fields`
--

LOCK TABLES `discount_fields` WRITE;
/*!40000 ALTER TABLE `discount_fields` DISABLE KEYS */;
INSERT INTO `discount_fields` VALUES (4,1,'Họ và Tên:','text',1),(5,1,'Ngày Sinh','text',1),(6,1,'Quê Quán','text',1),(7,1,'Trường Học:','text',1),(8,1,'Niên Khoán','text',1),(9,1,'Ngày Hết Hạn','text',1),(10,1,'Ảnh Căn Cước mặt Trước','image',1),(11,1,'Ảnh căn cước mặt sau','image',1),(12,1,'Ảnh thẻ Mặt Trước','image',1),(13,1,'Ảnh Thẻ mặt sau ','image',1);
/*!40000 ALTER TABLE `discount_fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discount_registrations`
--

DROP TABLE IF EXISTS `discount_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discount_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_User` char(36) NOT NULL,
  `id_Discount_Type` int NOT NULL,
  `status` enum('pending','approved','rejected','expired') DEFAULT 'pending' COMMENT 'pending=chờ duyệt | approved=đã duyệt | rejected=từ chối | expired=hết hạn',
  `registration_Date` datetime DEFAULT NULL,
  `validation_Date` datetime DEFAULT NULL COMMENT 'Ngày duyệt hồ sơ',
  `expiry_date` date DEFAULT NULL COMMENT 'Ngày hết hạn ưu đãi (sau khi được duyệt)',
  `rejected_reason` text COMMENT 'Lý do từ chối hồ sơ',
  `approved_by` char(36) DEFAULT NULL COMMENT 'UUID nhân viên đã duyệt hồ sơ',
  `PromotionCode` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_User` (`id_User`),
  KEY `id_Discount_Type` (`id_Discount_Type`),
  CONSTRAINT `discount_registrations_ibfk_135` FOREIGN KEY (`id_User`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `discount_registrations_ibfk_136` FOREIGN KEY (`id_Discount_Type`) REFERENCES `discount_types` (`Id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discount_registrations`
--

LOCK TABLES `discount_registrations` WRITE;
/*!40000 ALTER TABLE `discount_registrations` DISABLE KEYS */;
INSERT INTO `discount_registrations` VALUES (4,'d2426c1a-195b-4ec4-8d38-75baad2c29f3',2,'approved','2026-05-05 17:45:30','2026-05-05 17:47:40','2027-07-31',NULL,NULL,'NG-JF9E-77JW');
/*!40000 ALTER TABLE `discount_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discount_types`
--

DROP TABLE IF EXISTS `discount_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discount_types` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `DiscountPercentage` int NOT NULL COMMENT 'Phần trăm giảm (0-100)',
  `is_free` tinyint(1) DEFAULT '0' COMMENT 'true = miễn phí hoàn toàn (bỏ qua DiscountPercentage khi tính giá)',
  `max_discount_value` decimal(10,2) DEFAULT NULL COMMENT 'Giá trị giảm tối đa (VND). NULL = không giới hạn',
  `requires_document` tinyint(1) DEFAULT '1' COMMENT 'Có yêu cầu nộp giấy tờ chứng minh không',
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discount_types`
--

LOCK TABLES `discount_types` WRITE;
/*!40000 ALTER TABLE `discount_types` DISABLE KEYS */;
INSERT INTO `discount_types` VALUES (1,'Học Sinh/Sinh Viên','giảm 50% cho sinh viên, học sinh',50,0,NULL,1,0),(2,'Người Khuyết Tật','người khuyết tật',100,0,NULL,1,0);
/*!40000 ALTER TABLE `discount_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `Id` char(36) NOT NULL,
  `Id_User` char(36) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Chuyên dùng để Auth Staff Portal, băm bằng bcrypt',
  `shiftStart` time DEFAULT NULL COMMENT 'Giờ bắt đầu ca (VD: 06:00:00). Đã đổi từ DATE sang TIME để chuẩn thiết kế',
  `shiftEnd` time DEFAULT NULL COMMENT 'Giờ kết thúc ca (VD: 14:00:00).',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_User` (`Id_User`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `employees_username` (`username`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`Id_User`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES ('1af1d1ae-e496-4e59-865a-010ec6bcdcda','e347ed38-1d53-4260-a976-f4599bd4f2c8','staff','$2b$10$lXQWOR58QCkaT0YXEKTrkOG70fYZzz8bJb1qgFdwq1WhD8OihETkS','00:00:00','12:30:00'),('4496e4ce-da89-4fbe-af6d-0a87b0737ea5','0bb5e2a2-cee9-4275-984e-32b01d23b91f','admin','$2b$10$bJNWqPj2/U/CD8p0RCW22.KXhlA3YC7bGYFoZm0IYkLc1/1tgycVS','06:00:00','14:00:00');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `station_code` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'Đình Cao','Bến xe ngã tư Đình Cao',NULL,20.65500000,106.05900000,1,'2026-04-21 17:56:28'),(2,'Tiên Tiến','Trạm Tiên Tiến',NULL,20.67100000,106.06000000,2,'2026-04-21 17:56:28'),(3,'Quang Hưng','Ngã tư Quang Hưng',NULL,20.68500000,106.06200000,3,'2026-04-21 17:56:28'),(4,'Đoàn Đào','Trạm Đoàn Đào Cầu Ràm',NULL,20.93200000,106.05500000,4,'2026-04-21 17:56:28'),(5,'Trần Cao','Trung tâm Thị trấn Trần Cao',NULL,20.96500000,105.93200000,5,'2026-04-21 17:56:28');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Code` varchar(50) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Description` text,
  `IsActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Code` (`Code`),
  UNIQUE KEY `Code_2` (`Code`),
  UNIQUE KEY `Code_3` (`Code`),
  UNIQUE KEY `Code_4` (`Code`),
  UNIQUE KEY `Code_5` (`Code`),
  UNIQUE KEY `Code_6` (`Code`),
  UNIQUE KEY `Code_7` (`Code`),
  UNIQUE KEY `Code_8` (`Code`),
  UNIQUE KEY `Code_9` (`Code`),
  UNIQUE KEY `Code_10` (`Code`),
  UNIQUE KEY `Code_11` (`Code`),
  UNIQUE KEY `Code_12` (`Code`),
  UNIQUE KEY `Code_13` (`Code`),
  UNIQUE KEY `Code_14` (`Code`),
  UNIQUE KEY `Code_15` (`Code`),
  UNIQUE KEY `Code_16` (`Code`),
  UNIQUE KEY `Code_17` (`Code`),
  UNIQUE KEY `Code_18` (`Code`),
  UNIQUE KEY `Code_19` (`Code`),
  UNIQUE KEY `Code_20` (`Code`),
  UNIQUE KEY `Code_21` (`Code`),
  UNIQUE KEY `Code_22` (`Code`),
  UNIQUE KEY `Code_23` (`Code`),
  UNIQUE KEY `Code_24` (`Code`),
  UNIQUE KEY `Code_25` (`Code`),
  UNIQUE KEY `Code_26` (`Code`),
  UNIQUE KEY `Code_27` (`Code`),
  UNIQUE KEY `Code_28` (`Code`),
  UNIQUE KEY `Code_29` (`Code`),
  UNIQUE KEY `Code_30` (`Code`),
  UNIQUE KEY `Code_31` (`Code`),
  UNIQUE KEY `Code_32` (`Code`),
  UNIQUE KEY `Code_33` (`Code`),
  UNIQUE KEY `Code_34` (`Code`),
  UNIQUE KEY `Code_35` (`Code`),
  UNIQUE KEY `Code_36` (`Code`),
  UNIQUE KEY `Code_37` (`Code`),
  UNIQUE KEY `Code_38` (`Code`),
  UNIQUE KEY `Code_39` (`Code`),
  UNIQUE KEY `Code_40` (`Code`),
  UNIQUE KEY `Code_41` (`Code`),
  UNIQUE KEY `Code_42` (`Code`),
  UNIQUE KEY `Code_43` (`Code`),
  UNIQUE KEY `Code_44` (`Code`),
  UNIQUE KEY `Code_45` (`Code`),
  UNIQUE KEY `Code_46` (`Code`),
  UNIQUE KEY `Code_47` (`Code`),
  UNIQUE KEY `Code_48` (`Code`),
  UNIQUE KEY `Code_49` (`Code`),
  UNIQUE KEY `Code_50` (`Code`),
  UNIQUE KEY `Code_51` (`Code`),
  UNIQUE KEY `Code_52` (`Code`),
  UNIQUE KEY `Code_53` (`Code`),
  UNIQUE KEY `Code_54` (`Code`),
  UNIQUE KEY `Code_55` (`Code`),
  UNIQUE KEY `Code_56` (`Code`),
  UNIQUE KEY `Code_57` (`Code`),
  UNIQUE KEY `Code_58` (`Code`),
  UNIQUE KEY `Code_59` (`Code`),
  UNIQUE KEY `Code_60` (`Code`),
  UNIQUE KEY `Code_61` (`Code`),
  UNIQUE KEY `Code_62` (`Code`),
  UNIQUE KEY `Code_63` (`Code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
INSERT INTO `payment_methods` VALUES (1,'CASH','Tiền mặt','Thanh toán trực tiếp bằng tiền mặt tại quầy',1,'2026-04-21 17:56:28','2026-04-21 17:56:28'),(2,'BANKING','Chuyển khoản / QRPay','Thanh toán chuyển khoản hoặc quét mã QR',1,'2026-04-21 17:56:28','2026-04-21 17:56:28'),(3,'WALLET','Ví điện tử','Thanh toán qua Momo, ZaloPay, VNPay...',1,'2026-04-21 17:56:28','2026-04-21 20:40:56'),(4,'ZALOPAY','ZaloPay','Thanh toán qua ví ZaloPay (quét mã QR)',1,'2026-05-05 16:16:41','2026-05-05 16:16:41');
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `PaymentMethod` varchar(255) NOT NULL,
  `TransactionId` varchar(255) NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,'Tiền mặt','53d66385-8a72-4cfb-bf00-851e901bf794',10000.00,'2026-04-21 20:26:19'),(2,'Chuyển khoản / QRPay','8d670f20-9f4f-4fac-922e-edbf54d48dc1',10000.00,'2026-04-21 20:44:16'),(3,'Tiền mặt','902616bf-3065-450b-acf7-d14dc7ef0786',10000.00,'2026-04-21 20:26:24'),(4,'Tiền mặt','cfcad2a3-c523-4c45-a2ea-e99598762306',10000.00,'2026-04-21 20:19:40'),(5,'Tiền mặt','e275767d-7a45-4c3d-b179-e9fe98903437',20000.00,'2026-04-21 20:27:17'),(6,'Chuyển khoản / QRPay','fa7d068b-d18f-4452-9f42-96db22dddd2c',70000.00,'2026-04-21 20:35:59'),(7,'Ví điện tử','59e92b93-0370-4850-b309-969206179e2f',10000.00,'2026-04-22 15:39:53'),(8,'Tiền mặt','e8716669-06e3-4566-b63e-cedab8009bf8',10000.00,'2026-04-22 15:45:57'),(9,'Tiền mặt','722eec4f-102e-4e2a-8aef-cb1fa34472b7',10000.00,'2026-04-22 15:46:46'),(10,'Chuyển khoản / QRPay','3c6db3f5-8e40-4eb2-867c-3429d668b81e',10000.00,'2026-04-22 15:47:23'),(11,'Chuyển khoản / QRPay','a3d9ba77-446a-4e6c-8fd2-cca09cc2486f',10000.00,'2026-04-22 15:53:14'),(12,'Chuyển khoản / QRPay','c74a9293-1798-4672-a71a-8da64352e7e6',10000.00,'2026-04-22 15:55:22'),(13,'Chuyển khoản / QRPay','09da386f-134c-4a59-888d-318d82a1deb8',10000.00,'2026-04-22 18:02:29'),(14,'Chuyển khoản / QRPay','93f2fefa-a4e0-4cd4-ac87-1ab7cdee19d1',10000.00,'2026-04-22 18:07:13'),(15,'Chuyển khoản / QRPay','c33bfae0-c6d6-4e75-82bc-cee9716bd6a3',10000.00,'2026-04-22 18:11:28'),(16,'Chuyển khoản / QRPay','BRT-WSTBZF',10000.00,'2026-04-22 18:15:53'),(25,'Tiền mặt','MOB-1776976309138',10000.00,'2026-04-23 20:31:48'),(28,'Tiền mặt','MOB-1777194009563',10000.00,'2026-04-26 09:00:10'),(30,'Tiền mặt','MOB-1777195261724',10000.00,'2026-04-26 09:21:02'),(31,'Tiền mặt','MOB-1777234525004',50000.00,'2026-04-26 20:15:24'),(32,'Tiền mặt','MOB-1777235848518',50000.00,'2026-04-26 20:37:27'),(35,'Tiền mặt','MOB-1777237734227',21000.00,'2026-04-26 21:08:53'),(36,'Tiền mặt','MOB-1777237761802',30000.00,'2026-04-26 21:09:20'),(37,'Ví điện tử','BRT-T-RLU04E',0.00,'2026-04-30 08:15:51'),(38,'Tiền mặt','BRT-FX2Z4P',12000.00,'2026-04-30 17:26:35'),(39,'Chuyển khoản / QRPay','BRT-L6FJR5',10000.00,'2026-04-30 18:32:31'),(40,'Chuyển khoản / QRPay','BRT-8622R5',7000.00,'2026-04-30 19:05:53'),(41,'Ví điện tử','BRT-AC6P6H',10000.00,'2026-04-30 21:22:04'),(42,'Ví điện tử','BRT-UO6XCQ',2000.00,'2026-05-05 16:01:23'),(43,'ZaloPay','260506_MOSWJGPA',7000.00,'2026-05-05 17:28:54'),(44,'Tiền mặt','MOB-1778002694519',300000.00,'2026-05-05 17:38:14'),(45,'Tiền mặt','BRT-T-DCBAXQ',0.00,'2026-05-05 17:53:44'),(46,'ZaloPay','BRT-T-WYJ6SV',0.00,'2026-05-05 17:59:51'),(47,'ZaloPay','260506_MOSZIW9H',7000.00,'2026-05-05 18:52:02'),(48,'ZaloPay','260506_MOT06FPR',7000.00,'2026-05-05 19:10:28'),(49,'Chuyển khoản / QRPay','MOB-1778008291693',7000.00,'2026-05-05 19:11:31'),(50,'Ví điện tử','260506_MOT0C1U7',300000.00,'2026-05-05 19:14:50'),(51,'Ví điện tử','0VND_1778009831060_MOT159X8',0.00,'2026-05-05 19:37:12'),(52,'ZaloPay','260512_MP1JC0BH',12000.00,'2026-05-11 18:29:19'),(53,'ZaloPay','260512_MP1K38DZ',50000.00,'2026-05-11 18:50:11'),(54,'ZaloPay','260512_MP23BAZJ',14000.00,'2026-05-12 03:48:04'),(55,'Tiền mặt','MOB-1778595746517',10000.00,'2026-05-12 14:22:27');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `Code` varchar(255) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `DiscountAmount` decimal(10,2) DEFAULT NULL,
  `DiscountPercent` decimal(5,2) DEFAULT NULL,
  `StartDate` datetime NOT NULL,
  `EndDate` datetime NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `ImageUrl` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`Code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES ('KT01','Ưu đãi người khuyết tật ','okk',NULL,100.00,'2026-04-30 17:00:00','2119-12-30 17:00:00',1,'http://localhost:3000/uploads/banner-1778003224093-249228826.jpg','2026-05-05 17:47:25'),('NG01','Ưu đãi người cao tuổi ','ưu đãi cho người cao tuổi ',NULL,100.00,'2025-12-31 17:00:00','2128-12-31 17:00:00',1,'http://localhost:3000/uploads/banner-1776798677336-9492540.png','2026-04-21 19:11:19');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin','Quan tri vien he thong, co toan quyen truy cap','2026-04-20 19:05:31'),(2,'Staff','Nhan vien BRT, phu trach ban ve va kiem soat','2026-04-20 19:05:31'),(3,'Customer','Khach hang su dung dich vu xe buyt BRT','2026-04-20 19:05:31');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_categories`
--

DROP TABLE IF EXISTS `ticket_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL COMMENT 'TRIP | TIME | PROMO',
  `name` varchar(100) NOT NULL,
  `description` text,
  `requires_route` tinyint(1) DEFAULT '0' COMMENT 'Nếu true: Bắt buộc chọn điểm đi/điểm đến (Thường dùng cho Vé Lượt)',
  `requires_kyc_default` tinyint(1) DEFAULT '0' COMMENT 'Cờ mặc định xem danh mục này có cần xác thực danh tính/khuôn mặt không',
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  UNIQUE KEY `code_3` (`code`),
  UNIQUE KEY `code_4` (`code`),
  UNIQUE KEY `code_5` (`code`),
  UNIQUE KEY `code_6` (`code`),
  UNIQUE KEY `code_7` (`code`),
  UNIQUE KEY `code_8` (`code`),
  UNIQUE KEY `code_9` (`code`),
  UNIQUE KEY `code_10` (`code`),
  UNIQUE KEY `code_11` (`code`),
  UNIQUE KEY `code_12` (`code`),
  UNIQUE KEY `code_13` (`code`),
  UNIQUE KEY `code_14` (`code`),
  UNIQUE KEY `code_15` (`code`),
  UNIQUE KEY `code_16` (`code`),
  UNIQUE KEY `code_17` (`code`),
  UNIQUE KEY `code_18` (`code`),
  UNIQUE KEY `code_19` (`code`),
  UNIQUE KEY `code_20` (`code`),
  UNIQUE KEY `code_21` (`code`),
  UNIQUE KEY `code_22` (`code`),
  UNIQUE KEY `code_23` (`code`),
  UNIQUE KEY `code_24` (`code`),
  UNIQUE KEY `code_25` (`code`),
  UNIQUE KEY `code_26` (`code`),
  UNIQUE KEY `code_27` (`code`),
  UNIQUE KEY `code_28` (`code`),
  UNIQUE KEY `code_29` (`code`),
  UNIQUE KEY `code_30` (`code`),
  UNIQUE KEY `code_31` (`code`),
  UNIQUE KEY `code_32` (`code`),
  UNIQUE KEY `code_33` (`code`),
  UNIQUE KEY `code_34` (`code`),
  UNIQUE KEY `code_35` (`code`),
  UNIQUE KEY `code_36` (`code`),
  UNIQUE KEY `code_37` (`code`),
  UNIQUE KEY `code_38` (`code`),
  UNIQUE KEY `code_39` (`code`),
  UNIQUE KEY `code_40` (`code`),
  UNIQUE KEY `code_41` (`code`),
  UNIQUE KEY `code_42` (`code`),
  UNIQUE KEY `code_43` (`code`),
  UNIQUE KEY `code_44` (`code`),
  UNIQUE KEY `code_45` (`code`),
  UNIQUE KEY `code_46` (`code`),
  UNIQUE KEY `code_47` (`code`),
  UNIQUE KEY `code_48` (`code`),
  UNIQUE KEY `code_49` (`code`),
  UNIQUE KEY `code_50` (`code`),
  UNIQUE KEY `code_51` (`code`),
  UNIQUE KEY `code_52` (`code`),
  UNIQUE KEY `code_53` (`code`),
  UNIQUE KEY `code_54` (`code`),
  UNIQUE KEY `code_55` (`code`),
  UNIQUE KEY `code_56` (`code`),
  UNIQUE KEY `code_57` (`code`),
  UNIQUE KEY `code_58` (`code`),
  UNIQUE KEY `code_59` (`code`),
  UNIQUE KEY `code_60` (`code`),
  UNIQUE KEY `code_61` (`code`),
  UNIQUE KEY `code_62` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_categories`
--

LOCK TABLES `ticket_categories` WRITE;
/*!40000 ALTER TABLE `ticket_categories` DISABLE KEYS */;
INSERT INTO `ticket_categories` VALUES (1,'BRT_L','Vé Lượt','vé dùng chỉ 1 lần',1,0,1,1),(2,'BRT_T','Vé Thời Gian','Vé thời gian dùng cho nhiều lần',0,1,2,1),(3,'BRT_D','Vé Ưu Đãi','Vé này chỉ được dùng khi đăng ký thành công ưu đãi',0,1,3,1);
/*!40000 ALTER TABLE `ticket_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_details`
--

DROP TABLE IF EXISTS `ticket_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_details` (
  `id` char(36) NOT NULL,
  `id_order` char(36) NOT NULL,
  `id_ticket_type` int NOT NULL,
  `from_location` int DEFAULT NULL,
  `to_location` int DEFAULT NULL,
  `qr_token` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Token dùng để sinh mã QR xoay vòng hoặc cố định',
  `price` decimal(10,2) NOT NULL COMMENT 'Giá của riêng chiếc vé này tại thời điểm mua',
  `status` enum('UNUSED','ACTIVE','USED','EXPIRED','LOCKED') DEFAULT 'UNUSED' COMMENT 'Trạng thái sử dụng của riêng chiếc vé này',
  `is_in_system` tinyint(1) DEFAULT '0' COMMENT 'Đang ở trong hệ thống (Đã vào ga nhưng chưa ra)',
  `last_station_id` int DEFAULT NULL,
  `start_date` datetime DEFAULT NULL COMMENT 'Ngày bắt đầu sử dụng (thường set khi quét lần đầu)',
  `end_date` datetime DEFAULT NULL COMMENT 'Ngày hết hạn',
  `is_free` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_token` (`qr_token`),
  UNIQUE KEY `qr_token_2` (`qr_token`),
  UNIQUE KEY `qr_token_3` (`qr_token`),
  UNIQUE KEY `qr_token_4` (`qr_token`),
  UNIQUE KEY `qr_token_5` (`qr_token`),
  UNIQUE KEY `qr_token_6` (`qr_token`),
  UNIQUE KEY `qr_token_7` (`qr_token`),
  UNIQUE KEY `qr_token_8` (`qr_token`),
  UNIQUE KEY `qr_token_9` (`qr_token`),
  UNIQUE KEY `qr_token_10` (`qr_token`),
  UNIQUE KEY `qr_token_11` (`qr_token`),
  UNIQUE KEY `qr_token_12` (`qr_token`),
  UNIQUE KEY `qr_token_13` (`qr_token`),
  UNIQUE KEY `qr_token_14` (`qr_token`),
  UNIQUE KEY `qr_token_15` (`qr_token`),
  UNIQUE KEY `qr_token_16` (`qr_token`),
  UNIQUE KEY `qr_token_17` (`qr_token`),
  UNIQUE KEY `qr_token_18` (`qr_token`),
  UNIQUE KEY `qr_token_19` (`qr_token`),
  UNIQUE KEY `qr_token_20` (`qr_token`),
  UNIQUE KEY `qr_token_21` (`qr_token`),
  UNIQUE KEY `qr_token_22` (`qr_token`),
  UNIQUE KEY `qr_token_23` (`qr_token`),
  UNIQUE KEY `qr_token_24` (`qr_token`),
  UNIQUE KEY `qr_token_25` (`qr_token`),
  UNIQUE KEY `qr_token_26` (`qr_token`),
  UNIQUE KEY `qr_token_27` (`qr_token`),
  UNIQUE KEY `qr_token_28` (`qr_token`),
  UNIQUE KEY `qr_token_29` (`qr_token`),
  UNIQUE KEY `qr_token_30` (`qr_token`),
  UNIQUE KEY `qr_token_31` (`qr_token`),
  UNIQUE KEY `qr_token_32` (`qr_token`),
  UNIQUE KEY `qr_token_33` (`qr_token`),
  UNIQUE KEY `qr_token_34` (`qr_token`),
  UNIQUE KEY `qr_token_35` (`qr_token`),
  UNIQUE KEY `qr_token_36` (`qr_token`),
  UNIQUE KEY `qr_token_37` (`qr_token`),
  UNIQUE KEY `qr_token_38` (`qr_token`),
  UNIQUE KEY `qr_token_39` (`qr_token`),
  UNIQUE KEY `qr_token_40` (`qr_token`),
  UNIQUE KEY `qr_token_41` (`qr_token`),
  UNIQUE KEY `qr_token_42` (`qr_token`),
  UNIQUE KEY `qr_token_43` (`qr_token`),
  UNIQUE KEY `qr_token_44` (`qr_token`),
  UNIQUE KEY `qr_token_45` (`qr_token`),
  UNIQUE KEY `qr_token_46` (`qr_token`),
  UNIQUE KEY `qr_token_47` (`qr_token`),
  UNIQUE KEY `qr_token_48` (`qr_token`),
  UNIQUE KEY `qr_token_49` (`qr_token`),
  UNIQUE KEY `qr_token_50` (`qr_token`),
  UNIQUE KEY `qr_token_51` (`qr_token`),
  UNIQUE KEY `qr_token_52` (`qr_token`),
  UNIQUE KEY `qr_token_53` (`qr_token`),
  UNIQUE KEY `qr_token_54` (`qr_token`),
  UNIQUE KEY `qr_token_55` (`qr_token`),
  UNIQUE KEY `qr_token_56` (`qr_token`),
  UNIQUE KEY `qr_token_57` (`qr_token`),
  UNIQUE KEY `qr_token_58` (`qr_token`),
  KEY `last_station_id` (`last_station_id`),
  KEY `id_order` (`id_order`),
  KEY `id_ticket_type` (`id_ticket_type`),
  KEY `from_location` (`from_location`),
  KEY `to_location` (`to_location`),
  CONSTRAINT `ticket_details_ibfk_296` FOREIGN KEY (`id_order`) REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ticket_details_ibfk_297` FOREIGN KEY (`id_ticket_type`) REFERENCES `ticket_types` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ticket_details_ibfk_298` FOREIGN KEY (`from_location`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ticket_details_ibfk_299` FOREIGN KEY (`to_location`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_details`
--

LOCK TABLES `ticket_details` WRITE;
/*!40000 ALTER TABLE `ticket_details` DISABLE KEYS */;
INSERT INTO `ticket_details` VALUES ('181351d8-5add-4f2b-b7f0-c8f375ccdcee','300dac80-41ae-47be-acb8-e5804385dfab',2,NULL,NULL,'3ec37198-cf7e-4e8e-b448-1c160de28559',50000.00,'ACTIVE',0,NULL,'2026-05-11 18:58:30','2026-05-12 18:58:30',0,'2026-05-11 18:50:11','2026-05-11 18:58:30'),('18393477-bf79-4b8b-85a4-ac6f1208747f','488b62de-1e0d-44e7-b524-1980f9522935',1,1,4,'288d964c-f11b-476a-a21f-e0e44a8560e7',10000.00,'UNUSED',0,NULL,NULL,NULL,0,'2026-04-26 21:09:20','2026-04-26 21:09:20'),('1e8d56f2-31e4-421f-9191-7d34988e39b5','f9b51c1d-ecf2-48f1-83d0-44b078d1e6f5',3,NULL,NULL,'80c737fb-6230-4ed0-b137-99a744966472',50000.00,'ACTIVE',0,NULL,'2026-04-26 20:16:00','2026-05-26 20:16:00',0,'2026-04-26 20:15:24','2026-04-26 20:16:00'),('254c7ce5-725b-42df-be39-7bac45589556','d65fb944-cd0f-4363-8665-cd2010b2229c',1,1,5,'aa9c8e2a-224a-4405-b60b-af00c1c86dfe',12000.00,'USED',0,NULL,NULL,NULL,0,'2026-04-30 17:26:35','2026-04-30 17:27:23'),('30b3ad4b-7fae-4c99-ae97-4c4fc442e8e2','fe9617b7-6d17-4aff-984f-82ad39379ba1',1,1,5,'d7fb7327-53e4-408e-a457-5eef321abd16',12000.00,'ACTIVE',0,NULL,NULL,NULL,0,'2026-05-11 18:29:19','2026-05-11 18:39:33'),('5048e400-a544-479b-8dec-981900da4c3b','67d863fe-0c6e-4b75-9f77-74ee5e1b41cf',1,1,3,'89a752a0-2be0-4a27-b874-1355fc87db14',7000.00,'UNUSED',0,NULL,NULL,NULL,0,'2026-05-05 17:28:54','2026-05-05 17:28:54'),('51aa9c57-3f8b-45d2-b39a-4de36d8b9c91','4cbc0f5f-2157-4b4f-a59b-53674e1ab03d',1,1,4,'1672283c-693f-45fe-b4b6-dd444195bb28',10000.00,'USED',0,NULL,NULL,NULL,0,'2026-04-30 18:32:31','2026-04-30 18:34:25'),('58c312e2-c3f5-4204-a035-56720919398f','488b62de-1e0d-44e7-b524-1980f9522935',1,1,4,'423fa179-8088-4853-8760-dbf84ace4b34',10000.00,'UNUSED',0,NULL,NULL,NULL,0,'2026-04-26 21:09:20','2026-04-26 21:09:20'),('5953b9d2-acd4-4de1-8182-dad2f16198a0','1d6d7151-b620-42cf-87e8-edff7ac4b8bd',3,NULL,NULL,'1c00e48a-c0d9-4954-82be-045d0494c8a9',0.00,'ACTIVE',0,NULL,'2026-05-05 19:37:21','2026-06-04 19:37:21',0,'2026-05-05 19:37:12','2026-05-05 19:37:21'),('679564f9-a736-4945-9cfa-c4d910a8338e','d0a9d67f-96c9-4ba5-8501-cf5dcd0ed1d6',1,1,5,'a2b8289d-91cb-4d4e-9e0a-5c742cd5cb08',12000.00,'ACTIVE',0,NULL,NULL,NULL,0,'2026-05-12 14:22:27','2026-05-12 14:29:23'),('6c824547-a5cc-448b-ab41-10949330b519','3b7587c7-13fc-4f03-8a62-073e836f9057',1,1,3,'f08349f2-89b7-46a1-bc04-26263e3491bd',7000.00,'USED',0,NULL,NULL,NULL,0,'2026-04-26 21:08:53','2026-04-30 10:30:18'),('6e6b422d-8be9-4384-87ee-8b54787c55c6','7b908879-4191-4353-a903-a6a3053db57c',3,NULL,NULL,'5c02bdb1-48ab-11f1-8060-50ebf6d46ff9',0.00,'ACTIVE',0,NULL,'2026-05-05 17:53:44','2026-06-04 17:53:44',0,'2026-05-05 17:53:44','2026-05-05 17:53:44'),('76ce5838-00d2-4c5c-91eb-7ebaa96dced8','fcbde160-d1a4-45e5-85b7-2c0a2beb514a',1,1,3,'5269dbe4-4dd7-4f92-8ef6-2b498c093874',7000.00,'USED',0,NULL,NULL,NULL,0,'2026-05-05 19:10:28','2026-05-11 18:44:13'),('99e3db01-672f-4161-96f5-803bd93a8541','7116d7a4-5112-4580-b730-2eab9c755b5f',1,1,4,'899a2a0a-25d5-4e26-85a2-c1e376e07099',10000.00,'USED',0,NULL,NULL,NULL,0,'2026-04-26 09:21:02','2026-04-30 10:15:06'),('9acdec82-2d38-448c-940f-f8b3834ffabb','6afab2e5-901f-4515-bd8d-7daa61c764ba',1,1,2,'d7892a33-7bef-4650-8744-fcf5024063db',2000.00,'UNUSED',0,NULL,NULL,NULL,0,'2026-05-05 16:01:23','2026-05-05 16:01:23'),('9ce531d5-0431-4bb7-a5ce-f52ec8098015','2cc95d1d-7865-4c58-a0c9-b75335c2b3be',1,1,5,'ee81b25a-179b-4ed9-b261-5b1a3de63984',12000.00,'USED',0,NULL,NULL,NULL,0,'2026-05-12 03:48:04','2026-05-12 03:49:52'),('9d90cf41-3950-4f4b-944f-76ab5d656934','389fa9a4-e5b7-40b6-a8df-13ee18b3e2c0',1,1,5,'32461fe0-44ce-4256-9aa6-68eba8a660ed',12000.00,'USED',0,NULL,NULL,NULL,0,'2026-05-05 19:11:31','2026-05-05 19:17:32'),('a8aa81db-5757-41b2-8d47-36240b04c32d','3b7587c7-13fc-4f03-8a62-073e836f9057',1,1,3,'2f349671-b1be-4147-a6b8-cd4de5b77273',7000.00,'USED',0,NULL,NULL,NULL,0,'2026-04-26 21:08:53','2026-04-30 10:29:54'),('ab351b47-7719-4486-8dce-121ed8056fbd','96613aaa-310e-4615-a75a-c08c655a38d3',3,NULL,NULL,'6421b9f0-59ce-4cec-8bd8-b1af7f3d344a',300000.00,'UNUSED',0,NULL,NULL,NULL,0,'2026-05-05 17:38:14','2026-05-05 17:38:14'),('b63560b0-7a62-4e90-a0d6-c4ca9e656264','91843e90-ef8a-40d9-bf7f-ea8ae15cec9d',1,1,4,'9889d294-33cf-419f-8d15-566ee7898090',10000.00,'USED',0,NULL,NULL,NULL,0,'2026-04-26 09:00:10','2026-04-26 09:00:59'),('bcc03c09-dcf9-4952-90b6-9e887dcca1a0','d9c9dbd1-9cde-4e8b-ac28-39a39780ef1d',1,1,5,'03406e2a-ab85-48db-b746-4f7d8a6cc5fa',12000.00,'USED',0,NULL,NULL,NULL,0,'2026-04-30 21:22:04','2026-05-05 16:56:56'),('bed6efc6-b962-4021-a5d5-87f4105921d1','3b7587c7-13fc-4f03-8a62-073e836f9057',1,1,3,'9293c9ad-f425-4a2b-ae5b-19112781659f',7000.00,'USED',0,NULL,NULL,NULL,0,'2026-04-26 21:08:53','2026-04-27 07:18:07'),('c07a3e45-9684-4aa9-9a01-9ae16a30becd','f1a527cf-bf01-4472-b00b-ee1913d01e4e',3,NULL,NULL,'55e131b7-07d3-4b8d-99b4-4142ee8dc725',50000.00,'ACTIVE',0,NULL,'2026-04-26 20:38:04','2026-05-26 20:38:04',0,'2026-04-26 20:37:27','2026-04-26 20:38:04'),('c4900460-cefe-493f-996b-916550d72f82','42585e4b-29c4-4c52-a69f-5a6486225f85',3,NULL,NULL,'36b695fc-48ac-11f1-8060-50ebf6d46ff9',0.00,'ACTIVE',0,NULL,'2026-05-05 17:59:51','2026-06-04 17:59:51',0,'2026-05-05 17:59:51','2026-05-05 17:59:51'),('d2b29c25-a92d-4633-b150-ee8dafbccf81','2cc95d1d-7865-4c58-a0c9-b75335c2b3be',1,1,5,'f1a6c589-82a3-4ac9-90e2-12fda015bb80',12000.00,'UNUSED',0,NULL,NULL,NULL,0,'2026-05-12 03:48:04','2026-05-12 14:17:30'),('da9a11d8-538d-4e9c-8bbe-a675121d6b9c','488b62de-1e0d-44e7-b524-1980f9522935',1,1,4,'89338275-7cc5-4d7b-82df-bb4cf8b1bb89',10000.00,'USED',0,NULL,NULL,NULL,0,'2026-04-26 21:09:20','2026-05-05 15:43:13'),('e14da65e-f8d7-48fd-9ce0-afd687d743d5','277d33f5-9e73-4eea-b04a-f911304876dc',1,1,3,'07629eb5-229c-445d-aa8f-b8ae24b74417',7000.00,'ACTIVE',0,NULL,NULL,NULL,0,'2026-05-05 18:52:02','2026-05-11 19:00:18'),('e7a2abb4-6717-410e-ab29-14f45152f277','2af90f6c-67b0-46d1-9727-40a5534ac462',1,1,5,'a4bcc05d-b36f-47e3-b6e3-c903a074b2d9',7000.00,'USED',0,NULL,NULL,NULL,0,'2026-04-30 19:05:53','2026-05-05 16:57:08'),('ec25523b-76a7-4f89-86b3-b7c23454d7ee','6d2b8849-b4da-4465-bb1a-c56b8a7449f1',1,1,5,'f062ac51-6e2f-48d2-92df-6b27fe586e91',10000.00,'UNUSED',0,NULL,NULL,NULL,0,'2026-04-23 20:31:48','2026-04-23 20:31:48'),('f6e5cd3e-d446-4082-b27b-03b977497305','2cd90b7e-8232-4038-ad4b-fcc5b0572819',3,NULL,NULL,'cd4ff507-446c-11f1-8060-50ebf6d46ff9',0.00,'ACTIVE',0,NULL,'2026-04-30 08:15:51','2026-05-30 08:15:51',0,'2026-04-30 08:15:51','2026-04-30 08:15:51'),('f9d540f4-3c53-4d17-9e71-7aafa19e7978','a1d289fd-938c-48e0-8294-1ce6a56d4d59',3,NULL,NULL,'939be5be-f607-4b80-a20f-25085ff534f4',300000.00,'ACTIVE',0,NULL,'2026-05-05 19:15:36','2026-06-04 19:15:36',0,'2026-05-05 19:14:50','2026-05-05 19:15:36');
/*!40000 ALTER TABLE `ticket_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_location`
--

DROP TABLE IF EXISTS `ticket_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_location` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Ticket` char(36) NOT NULL,
  `Id_Location` int NOT NULL,
  `Created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `unique_ticket_location` (`Id_Ticket`,`Id_Location`),
  KEY `idx_ticket_whitelist` (`Id_Ticket`),
  KEY `idx_location_whitelist` (`Id_Location`),
  CONSTRAINT `ticket_location_ibfk_109` FOREIGN KEY (`Id_Ticket`) REFERENCES `ticket_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ticket_location_ibfk_110` FOREIGN KEY (`Id_Location`) REFERENCES `locations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=319 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_location`
--

LOCK TABLES `ticket_location` WRITE;
/*!40000 ALTER TABLE `ticket_location` DISABLE KEYS */;
INSERT INTO `ticket_location` VALUES (154,'ec25523b-76a7-4f89-86b3-b7c23454d7ee',1,'2026-04-23 20:31:48'),(155,'ec25523b-76a7-4f89-86b3-b7c23454d7ee',2,'2026-04-23 20:31:48'),(156,'ec25523b-76a7-4f89-86b3-b7c23454d7ee',3,'2026-04-23 20:31:48'),(157,'ec25523b-76a7-4f89-86b3-b7c23454d7ee',4,'2026-04-23 20:31:48'),(158,'ec25523b-76a7-4f89-86b3-b7c23454d7ee',5,'2026-04-23 20:31:48'),(169,'b63560b0-7a62-4e90-a0d6-c4ca9e656264',1,'2026-04-26 09:00:10'),(170,'b63560b0-7a62-4e90-a0d6-c4ca9e656264',2,'2026-04-26 09:00:10'),(171,'b63560b0-7a62-4e90-a0d6-c4ca9e656264',3,'2026-04-26 09:00:10'),(172,'b63560b0-7a62-4e90-a0d6-c4ca9e656264',4,'2026-04-26 09:00:10'),(178,'99e3db01-672f-4161-96f5-803bd93a8541',1,'2026-04-26 09:21:02'),(179,'99e3db01-672f-4161-96f5-803bd93a8541',2,'2026-04-26 09:21:02'),(180,'99e3db01-672f-4161-96f5-803bd93a8541',3,'2026-04-26 09:21:02'),(181,'99e3db01-672f-4161-96f5-803bd93a8541',4,'2026-04-26 09:21:02'),(182,'1e8d56f2-31e4-421f-9191-7d34988e39b5',1,'2026-04-26 20:15:24'),(183,'1e8d56f2-31e4-421f-9191-7d34988e39b5',2,'2026-04-26 20:15:24'),(184,'1e8d56f2-31e4-421f-9191-7d34988e39b5',3,'2026-04-26 20:15:24'),(185,'1e8d56f2-31e4-421f-9191-7d34988e39b5',4,'2026-04-26 20:15:24'),(186,'1e8d56f2-31e4-421f-9191-7d34988e39b5',5,'2026-04-26 20:15:24'),(187,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,'2026-04-26 20:37:27'),(188,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',2,'2026-04-26 20:37:27'),(189,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',3,'2026-04-26 20:37:27'),(190,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',4,'2026-04-26 20:37:27'),(191,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',5,'2026-04-26 20:37:27'),(213,'a8aa81db-5757-41b2-8d47-36240b04c32d',1,'2026-04-26 21:08:53'),(214,'a8aa81db-5757-41b2-8d47-36240b04c32d',2,'2026-04-26 21:08:53'),(215,'a8aa81db-5757-41b2-8d47-36240b04c32d',3,'2026-04-26 21:08:53'),(216,'bed6efc6-b962-4021-a5d5-87f4105921d1',1,'2026-04-26 21:08:53'),(217,'bed6efc6-b962-4021-a5d5-87f4105921d1',2,'2026-04-26 21:08:53'),(218,'bed6efc6-b962-4021-a5d5-87f4105921d1',3,'2026-04-26 21:08:53'),(219,'6c824547-a5cc-448b-ab41-10949330b519',1,'2026-04-26 21:08:53'),(220,'6c824547-a5cc-448b-ab41-10949330b519',2,'2026-04-26 21:08:53'),(221,'6c824547-a5cc-448b-ab41-10949330b519',3,'2026-04-26 21:08:53'),(222,'18393477-bf79-4b8b-85a4-ac6f1208747f',1,'2026-04-26 21:09:20'),(223,'18393477-bf79-4b8b-85a4-ac6f1208747f',2,'2026-04-26 21:09:20'),(224,'18393477-bf79-4b8b-85a4-ac6f1208747f',3,'2026-04-26 21:09:20'),(225,'18393477-bf79-4b8b-85a4-ac6f1208747f',4,'2026-04-26 21:09:20'),(226,'da9a11d8-538d-4e9c-8bbe-a675121d6b9c',1,'2026-04-26 21:09:20'),(227,'da9a11d8-538d-4e9c-8bbe-a675121d6b9c',2,'2026-04-26 21:09:20'),(228,'da9a11d8-538d-4e9c-8bbe-a675121d6b9c',3,'2026-04-26 21:09:20'),(229,'da9a11d8-538d-4e9c-8bbe-a675121d6b9c',4,'2026-04-26 21:09:20'),(230,'58c312e2-c3f5-4204-a035-56720919398f',1,'2026-04-26 21:09:20'),(231,'58c312e2-c3f5-4204-a035-56720919398f',2,'2026-04-26 21:09:20'),(232,'58c312e2-c3f5-4204-a035-56720919398f',3,'2026-04-26 21:09:20'),(233,'58c312e2-c3f5-4204-a035-56720919398f',4,'2026-04-26 21:09:20'),(234,'f6e5cd3e-d446-4082-b27b-03b977497305',1,'2026-04-30 08:15:51'),(235,'f6e5cd3e-d446-4082-b27b-03b977497305',2,'2026-04-30 08:15:51'),(236,'f6e5cd3e-d446-4082-b27b-03b977497305',3,'2026-04-30 08:15:51'),(237,'f6e5cd3e-d446-4082-b27b-03b977497305',4,'2026-04-30 08:15:51'),(238,'f6e5cd3e-d446-4082-b27b-03b977497305',5,'2026-04-30 08:15:51'),(239,'254c7ce5-725b-42df-be39-7bac45589556',1,'2026-04-30 17:26:35'),(240,'254c7ce5-725b-42df-be39-7bac45589556',2,'2026-04-30 17:26:35'),(241,'254c7ce5-725b-42df-be39-7bac45589556',3,'2026-04-30 17:26:35'),(242,'254c7ce5-725b-42df-be39-7bac45589556',4,'2026-04-30 17:26:35'),(243,'254c7ce5-725b-42df-be39-7bac45589556',5,'2026-04-30 17:26:35'),(244,'51aa9c57-3f8b-45d2-b39a-4de36d8b9c91',1,'2026-04-30 18:32:31'),(245,'51aa9c57-3f8b-45d2-b39a-4de36d8b9c91',2,'2026-04-30 18:32:31'),(246,'51aa9c57-3f8b-45d2-b39a-4de36d8b9c91',3,'2026-04-30 18:32:31'),(247,'51aa9c57-3f8b-45d2-b39a-4de36d8b9c91',4,'2026-04-30 18:32:31'),(248,'e7a2abb4-6717-410e-ab29-14f45152f277',1,'2026-04-30 19:05:53'),(249,'e7a2abb4-6717-410e-ab29-14f45152f277',2,'2026-04-30 19:05:53'),(250,'e7a2abb4-6717-410e-ab29-14f45152f277',3,'2026-04-30 19:05:53'),(251,'bcc03c09-dcf9-4952-90b6-9e887dcca1a0',1,'2026-04-30 21:22:04'),(252,'bcc03c09-dcf9-4952-90b6-9e887dcca1a0',2,'2026-04-30 21:22:04'),(253,'bcc03c09-dcf9-4952-90b6-9e887dcca1a0',3,'2026-04-30 21:22:04'),(254,'bcc03c09-dcf9-4952-90b6-9e887dcca1a0',4,'2026-04-30 21:22:04'),(255,'9acdec82-2d38-448c-940f-f8b3834ffabb',1,'2026-05-05 16:01:23'),(256,'9acdec82-2d38-448c-940f-f8b3834ffabb',2,'2026-05-05 16:01:23'),(257,'5048e400-a544-479b-8dec-981900da4c3b',1,'2026-05-05 17:28:54'),(258,'5048e400-a544-479b-8dec-981900da4c3b',2,'2026-05-05 17:28:54'),(259,'5048e400-a544-479b-8dec-981900da4c3b',3,'2026-05-05 17:28:54'),(260,'ab351b47-7719-4486-8dce-121ed8056fbd',1,'2026-05-05 17:38:14'),(261,'ab351b47-7719-4486-8dce-121ed8056fbd',2,'2026-05-05 17:38:14'),(262,'ab351b47-7719-4486-8dce-121ed8056fbd',3,'2026-05-05 17:38:14'),(263,'ab351b47-7719-4486-8dce-121ed8056fbd',4,'2026-05-05 17:38:14'),(264,'ab351b47-7719-4486-8dce-121ed8056fbd',5,'2026-05-05 17:38:14'),(265,'6e6b422d-8be9-4384-87ee-8b54787c55c6',1,'2026-05-05 17:53:44'),(266,'6e6b422d-8be9-4384-87ee-8b54787c55c6',2,'2026-05-05 17:53:44'),(267,'6e6b422d-8be9-4384-87ee-8b54787c55c6',3,'2026-05-05 17:53:44'),(268,'6e6b422d-8be9-4384-87ee-8b54787c55c6',4,'2026-05-05 17:53:44'),(269,'6e6b422d-8be9-4384-87ee-8b54787c55c6',5,'2026-05-05 17:53:44'),(270,'c4900460-cefe-493f-996b-916550d72f82',1,'2026-05-05 17:59:51'),(271,'c4900460-cefe-493f-996b-916550d72f82',2,'2026-05-05 17:59:51'),(272,'c4900460-cefe-493f-996b-916550d72f82',3,'2026-05-05 17:59:51'),(273,'c4900460-cefe-493f-996b-916550d72f82',4,'2026-05-05 17:59:51'),(274,'c4900460-cefe-493f-996b-916550d72f82',5,'2026-05-05 17:59:51'),(275,'e14da65e-f8d7-48fd-9ce0-afd687d743d5',1,'2026-05-05 18:52:02'),(276,'e14da65e-f8d7-48fd-9ce0-afd687d743d5',2,'2026-05-05 18:52:02'),(277,'e14da65e-f8d7-48fd-9ce0-afd687d743d5',3,'2026-05-05 18:52:02'),(278,'76ce5838-00d2-4c5c-91eb-7ebaa96dced8',1,'2026-05-05 19:10:28'),(279,'76ce5838-00d2-4c5c-91eb-7ebaa96dced8',2,'2026-05-05 19:10:28'),(280,'76ce5838-00d2-4c5c-91eb-7ebaa96dced8',3,'2026-05-05 19:10:28'),(281,'9d90cf41-3950-4f4b-944f-76ab5d656934',1,'2026-05-05 19:11:31'),(282,'9d90cf41-3950-4f4b-944f-76ab5d656934',2,'2026-05-05 19:11:31'),(283,'9d90cf41-3950-4f4b-944f-76ab5d656934',3,'2026-05-05 19:11:31'),(284,'f9d540f4-3c53-4d17-9e71-7aafa19e7978',1,'2026-05-05 19:14:50'),(285,'f9d540f4-3c53-4d17-9e71-7aafa19e7978',2,'2026-05-05 19:14:50'),(286,'f9d540f4-3c53-4d17-9e71-7aafa19e7978',3,'2026-05-05 19:14:50'),(287,'f9d540f4-3c53-4d17-9e71-7aafa19e7978',4,'2026-05-05 19:14:50'),(288,'f9d540f4-3c53-4d17-9e71-7aafa19e7978',5,'2026-05-05 19:14:50'),(289,'5953b9d2-acd4-4de1-8182-dad2f16198a0',1,'2026-05-05 19:37:12'),(290,'5953b9d2-acd4-4de1-8182-dad2f16198a0',2,'2026-05-05 19:37:12'),(291,'5953b9d2-acd4-4de1-8182-dad2f16198a0',3,'2026-05-05 19:37:12'),(292,'5953b9d2-acd4-4de1-8182-dad2f16198a0',4,'2026-05-05 19:37:12'),(293,'5953b9d2-acd4-4de1-8182-dad2f16198a0',5,'2026-05-05 19:37:12'),(299,'30b3ad4b-7fae-4c99-ae97-4c4fc442e8e2',1,'2026-05-11 18:29:19'),(300,'30b3ad4b-7fae-4c99-ae97-4c4fc442e8e2',2,'2026-05-11 18:29:19'),(301,'30b3ad4b-7fae-4c99-ae97-4c4fc442e8e2',3,'2026-05-11 18:29:19'),(302,'30b3ad4b-7fae-4c99-ae97-4c4fc442e8e2',4,'2026-05-11 18:29:19'),(303,'30b3ad4b-7fae-4c99-ae97-4c4fc442e8e2',5,'2026-05-11 18:29:19'),(304,'181351d8-5add-4f2b-b7f0-c8f375ccdcee',1,'2026-05-11 18:50:11'),(305,'181351d8-5add-4f2b-b7f0-c8f375ccdcee',2,'2026-05-11 18:50:11'),(306,'181351d8-5add-4f2b-b7f0-c8f375ccdcee',3,'2026-05-11 18:50:11'),(307,'181351d8-5add-4f2b-b7f0-c8f375ccdcee',4,'2026-05-11 18:50:11'),(308,'181351d8-5add-4f2b-b7f0-c8f375ccdcee',5,'2026-05-11 18:50:11'),(309,'d2b29c25-a92d-4633-b150-ee8dafbccf81',1,'2026-05-12 03:48:04'),(310,'d2b29c25-a92d-4633-b150-ee8dafbccf81',2,'2026-05-12 03:48:04'),(311,'d2b29c25-a92d-4633-b150-ee8dafbccf81',3,'2026-05-12 03:48:04'),(312,'9ce531d5-0431-4bb7-a5ce-f52ec8098015',1,'2026-05-12 03:48:04'),(313,'9ce531d5-0431-4bb7-a5ce-f52ec8098015',2,'2026-05-12 03:48:04'),(314,'9ce531d5-0431-4bb7-a5ce-f52ec8098015',3,'2026-05-12 03:48:04'),(315,'679564f9-a736-4945-9cfa-c4d910a8338e',1,'2026-05-12 14:22:27'),(316,'679564f9-a736-4945-9cfa-c4d910a8338e',2,'2026-05-12 14:22:27'),(317,'679564f9-a736-4945-9cfa-c4d910a8338e',3,'2026-05-12 14:22:27'),(318,'679564f9-a736-4945-9cfa-c4d910a8338e',4,'2026-05-12 14:22:27');
/*!40000 ALTER TABLE `ticket_location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_logs`
--

DROP TABLE IF EXISTS `ticket_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_logs` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Ticket` char(36) NOT NULL,
  `location_id` int NOT NULL,
  `device_id` varchar(255) DEFAULT NULL,
  `scan_direction` enum('ENTRY','EXIT','CHECK','RESTOCK') NOT NULL,
  `status` varchar(255) NOT NULL,
  `surcharge_amount` decimal(10,2) DEFAULT '0.00',
  `scan_time` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `Id_Ticket` (`Id_Ticket`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `ticket_logs_ibfk_109` FOREIGN KEY (`Id_Ticket`) REFERENCES `ticket_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ticket_logs_ibfk_110` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_logs`
--

LOCK TABLES `ticket_logs` WRITE;
/*!40000 ALTER TABLE `ticket_logs` DISABLE KEYS */;
INSERT INTO `ticket_logs` VALUES (7,'b63560b0-7a62-4e90-a0d6-c4ca9e656264',2,NULL,'ENTRY','valid',0.00,'2026-04-26 09:00:42'),(8,'b63560b0-7a62-4e90-a0d6-c4ca9e656264',2,NULL,'EXIT','valid',0.00,'2026-04-26 09:00:59'),(18,'1e8d56f2-31e4-421f-9191-7d34988e39b5',4,NULL,'EXIT','valid',0.00,'2026-04-26 20:16:00'),(19,'1e8d56f2-31e4-421f-9191-7d34988e39b5',4,NULL,'ENTRY','valid',0.00,'2026-04-26 20:16:11'),(20,'1e8d56f2-31e4-421f-9191-7d34988e39b5',4,NULL,'ENTRY','valid',0.00,'2026-04-26 20:16:12'),(21,'1e8d56f2-31e4-421f-9191-7d34988e39b5',4,NULL,'EXIT','valid',0.00,'2026-04-26 20:16:31'),(22,'99e3db01-672f-4161-96f5-803bd93a8541',4,NULL,'ENTRY','valid',0.00,'2026-04-26 20:22:54'),(23,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',5,NULL,'ENTRY','valid',0.00,'2026-04-26 20:38:06'),(24,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',5,NULL,'ENTRY','valid',0.00,'2026-04-26 20:38:06'),(25,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',5,NULL,'EXIT','valid',0.00,'2026-04-26 20:38:40'),(26,'bed6efc6-b962-4021-a5d5-87f4105921d1',1,NULL,'ENTRY','valid',0.00,'2026-04-27 07:17:55'),(27,'bed6efc6-b962-4021-a5d5-87f4105921d1',1,NULL,'EXIT','valid',0.00,'2026-04-27 07:18:07'),(28,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-27 07:18:21'),(29,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-27 07:18:22'),(30,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'EXIT','valid',0.00,'2026-04-27 07:18:50'),(31,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-27 07:18:59'),(32,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-27 07:19:00'),(33,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',2,NULL,'ENTRY','valid',0.00,'2026-04-27 07:24:18'),(34,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',2,NULL,'ENTRY','valid',0.00,'2026-04-27 07:24:18'),(35,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',2,NULL,'EXIT','valid',0.00,'2026-04-27 07:24:29'),(36,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',5,NULL,'ENTRY','valid',0.00,'2026-04-30 08:54:03'),(37,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',5,NULL,'ENTRY','valid',0.00,'2026-04-30 08:54:04'),(38,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 09:08:48'),(39,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 09:08:48'),(40,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 09:11:17'),(41,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 09:11:17'),(42,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 09:11:29'),(43,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 09:11:29'),(44,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 09:11:58'),(45,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 09:11:58'),(46,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 09:13:46'),(47,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 09:13:47'),(48,'99e3db01-672f-4161-96f5-803bd93a8541',1,NULL,'EXIT','valid',0.00,'2026-04-30 10:15:06'),(49,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'EXIT','valid',0.00,'2026-04-30 10:19:09'),(50,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 10:19:23'),(51,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 10:19:23'),(52,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'EXIT','valid',0.00,'2026-04-30 10:22:43'),(53,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 10:22:53'),(54,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'EXIT','valid',0.00,'2026-04-30 10:23:47'),(55,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 10:27:01'),(56,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 10:28:19'),(57,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'ENTRY','valid',0.00,'2026-04-30 10:29:24'),(58,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',1,NULL,'EXIT','valid',0.00,'2026-04-30 10:29:37'),(59,'a8aa81db-5757-41b2-8d47-36240b04c32d',1,NULL,'EXIT','valid',0.00,'2026-04-30 10:29:54'),(60,'6c824547-a5cc-448b-ab41-10949330b519',1,NULL,'EXIT','valid',0.00,'2026-04-30 10:30:18'),(61,'254c7ce5-725b-42df-be39-7bac45589556',1,NULL,'ENTRY','valid',0.00,'2026-04-30 17:26:59'),(62,'254c7ce5-725b-42df-be39-7bac45589556',4,NULL,'EXIT','valid',0.00,'2026-04-30 17:27:23'),(63,'51aa9c57-3f8b-45d2-b39a-4de36d8b9c91',4,NULL,'ENTRY','valid',0.00,'2026-04-30 18:34:12'),(64,'51aa9c57-3f8b-45d2-b39a-4de36d8b9c91',4,NULL,'EXIT','valid',0.00,'2026-04-30 18:34:25'),(65,'e7a2abb4-6717-410e-ab29-14f45152f277',3,NULL,'ENTRY','valid',0.00,'2026-04-30 19:06:11'),(66,'e7a2abb4-6717-410e-ab29-14f45152f277',5,NULL,'ENTRY','valid',0.00,'2026-04-30 20:08:54'),(67,'bcc03c09-dcf9-4952-90b6-9e887dcca1a0',1,NULL,'ENTRY','valid',0.00,'2026-04-30 21:22:26'),(68,'bcc03c09-dcf9-4952-90b6-9e887dcca1a0',5,NULL,'RESTOCK','valid',0.00,'2026-04-30 21:28:00'),(69,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',3,NULL,'ENTRY','valid',0.00,'2026-05-05 15:41:44'),(70,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',3,NULL,'EXIT','valid',0.00,'2026-05-05 15:42:01'),(71,'da9a11d8-538d-4e9c-8bbe-a675121d6b9c',3,NULL,'ENTRY','valid',0.00,'2026-05-05 15:42:38'),(72,'da9a11d8-538d-4e9c-8bbe-a675121d6b9c',4,NULL,'EXIT','valid',0.00,'2026-05-05 15:43:13'),(73,'bcc03c09-dcf9-4952-90b6-9e887dcca1a0',4,NULL,'EXIT','valid',0.00,'2026-05-05 16:56:56'),(74,'e7a2abb4-6717-410e-ab29-14f45152f277',4,NULL,'EXIT','valid',0.00,'2026-05-05 16:57:08'),(75,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',4,NULL,'ENTRY','valid',0.00,'2026-05-05 17:36:28'),(76,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',4,NULL,'EXIT','valid',0.00,'2026-05-05 17:36:41'),(77,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',4,NULL,'ENTRY','valid',0.00,'2026-05-05 18:05:54'),(78,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',4,NULL,'EXIT','valid',0.00,'2026-05-05 18:06:04'),(79,'f9d540f4-3c53-4d17-9e71-7aafa19e7978',4,NULL,'ENTRY','valid',0.00,'2026-05-05 19:15:52'),(80,'f9d540f4-3c53-4d17-9e71-7aafa19e7978',4,NULL,'EXIT','valid',0.00,'2026-05-05 19:16:00'),(81,'9d90cf41-3950-4f4b-944f-76ab5d656934',1,NULL,'ENTRY','valid',0.00,'2026-05-05 19:16:43'),(82,'9d90cf41-3950-4f4b-944f-76ab5d656934',5,NULL,'RESTOCK','valid',0.00,'2026-05-05 19:17:27'),(83,'9d90cf41-3950-4f4b-944f-76ab5d656934',4,NULL,'EXIT','valid',0.00,'2026-05-05 19:17:32'),(84,'5953b9d2-acd4-4de1-8182-dad2f16198a0',4,NULL,'EXIT','valid',0.00,'2026-05-05 19:37:21'),(85,'5953b9d2-acd4-4de1-8182-dad2f16198a0',1,NULL,'ENTRY','valid',0.00,'2026-05-05 19:37:38'),(86,'5953b9d2-acd4-4de1-8182-dad2f16198a0',1,NULL,'EXIT','valid',0.00,'2026-05-05 19:37:41'),(89,'30b3ad4b-7fae-4c99-ae97-4c4fc442e8e2',1,NULL,'ENTRY','valid',0.00,'2026-05-11 18:39:33'),(90,'5953b9d2-acd4-4de1-8182-dad2f16198a0',3,NULL,'EXIT','valid',0.00,'2026-05-11 18:42:51'),(91,'76ce5838-00d2-4c5c-91eb-7ebaa96dced8',3,NULL,'ENTRY','valid',0.00,'2026-05-11 18:43:25'),(92,'76ce5838-00d2-4c5c-91eb-7ebaa96dced8',3,NULL,'EXIT','valid',0.00,'2026-05-11 18:44:13'),(93,'181351d8-5add-4f2b-b7f0-c8f375ccdcee',1,NULL,'EXIT','valid',0.00,'2026-05-11 18:58:30'),(94,'181351d8-5add-4f2b-b7f0-c8f375ccdcee',1,NULL,'EXIT','valid',0.00,'2026-05-11 18:58:45'),(95,'e14da65e-f8d7-48fd-9ce0-afd687d743d5',1,NULL,'ENTRY','valid',0.00,'2026-05-11 19:00:18'),(96,'6e6b422d-8be9-4384-87ee-8b54787c55c6',1,NULL,'ENTRY','valid',0.00,'2026-05-12 02:44:49'),(97,'6e6b422d-8be9-4384-87ee-8b54787c55c6',1,NULL,'ENTRY','valid',0.00,'2026-05-12 02:49:35'),(98,'9ce531d5-0431-4bb7-a5ce-f52ec8098015',1,NULL,'ENTRY','valid',0.00,'2026-05-12 03:48:59'),(99,'9ce531d5-0431-4bb7-a5ce-f52ec8098015',5,NULL,'RESTOCK','valid',0.00,'2026-05-12 03:49:39'),(100,'9ce531d5-0431-4bb7-a5ce-f52ec8098015',5,NULL,'EXIT','valid',0.00,'2026-05-12 03:49:52'),(101,'c07a3e45-9684-4aa9-9a01-9ae16a30becd',5,NULL,'ENTRY','valid',0.00,'2026-05-12 03:52:40'),(102,'d2b29c25-a92d-4633-b150-ee8dafbccf81',5,NULL,'RESTOCK','valid',0.00,'2026-05-12 14:17:30'),(103,'679564f9-a736-4945-9cfa-c4d910a8338e',1,NULL,'ENTRY','valid',0.00,'2026-05-12 14:24:01'),(104,'679564f9-a736-4945-9cfa-c4d910a8338e',5,NULL,'RESTOCK','valid',0.00,'2026-05-12 14:29:23');
/*!40000 ALTER TABLE `ticket_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_prices`
--

DROP TABLE IF EXISTS `ticket_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_prices` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Ticket_Type` int NOT NULL,
  `From_Location_Id` int DEFAULT NULL,
  `To_Location_Id` int DEFAULT NULL,
  `Price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `unique_ticket_price_route` (`Id_Ticket_Type`,`From_Location_Id`,`To_Location_Id`),
  KEY `From_Location_Id` (`From_Location_Id`),
  KEY `To_Location_Id` (`To_Location_Id`),
  CONSTRAINT `ticket_prices_ibfk_159` FOREIGN KEY (`Id_Ticket_Type`) REFERENCES `ticket_types` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ticket_prices_ibfk_160` FOREIGN KEY (`From_Location_Id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ticket_prices_ibfk_161` FOREIGN KEY (`To_Location_Id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_prices`
--

LOCK TABLES `ticket_prices` WRITE;
/*!40000 ALTER TABLE `ticket_prices` DISABLE KEYS */;
INSERT INTO `ticket_prices` VALUES (9,2,NULL,NULL,50000.00,1),(10,3,NULL,NULL,300000.00,1),(14,1,1,2,2000.00,1),(15,1,1,5,12000.00,1),(16,1,2,4,5000.00,1),(17,1,1,3,7000.00,1),(18,1,1,4,10000.00,1);
/*!40000 ALTER TABLE `ticket_prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_types`
--

DROP TABLE IF EXISTS `ticket_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_category` int NOT NULL,
  `id_discount_type` int DEFAULT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Tên loại vé (Ví dụ: Vé lượt, Vé ngày, Vé tháng...)',
  `description` varchar(255) DEFAULT NULL,
  `duration_day` int NOT NULL COMMENT 'Thời hạn sử dụng: Lượt/Ngày=1, Tuần=7, Tháng=30, Năm=365',
  `requiresFace` tinyint(1) DEFAULT '0' COMMENT 'Bắt buộc quét mặt? (TRIP và DAILY=false, WEEK/MONTH/YEAR=true)',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `id_category` (`id_category`),
  KEY `id_discount_type` (`id_discount_type`),
  CONSTRAINT `ticket_types_ibfk_121` FOREIGN KEY (`id_category`) REFERENCES `ticket_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ticket_types_ibfk_122` FOREIGN KEY (`id_discount_type`) REFERENCES `discount_types` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_types`
--

LOCK TABLES `ticket_types` WRITE;
/*!40000 ALTER TABLE `ticket_types` DISABLE KEYS */;
INSERT INTO `ticket_types` VALUES (1,1,NULL,'Vé Lượt','Su dung 1 lan cho tuyen duong da chon',1,0,1),(2,2,NULL,'Vé Ngày (24h)','Su dung khong gioi han trong 24h tren toan tuyen',1,1,1),(3,2,NULL,'Vé 1 Tháng','Su dung khong gioi han trong 30 ngay tren toan tuyen',30,1,1),(4,3,NULL,'Vé Người Cao Tuổi','Vé miễn phí dành cho hành khách trên 60 tuổi, thời gian sử dụng vĩnh viễn',99999,1,1),(5,2,NULL,'Vé 2 tháng','vé 2 tháng',60,1,1),(6,2,NULL,'Vé 3 tháng','vé dùng 3 tháng',90,1,1),(7,2,NULL,'Vé 1 năm','vé cho 1 năm',365,1,1);
/*!40000 ALTER TABLE `ticket_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` char(36) NOT NULL,
  `id_user` char(36) NOT NULL,
  `total_quantity` int NOT NULL DEFAULT '1' COMMENT 'Tổng số lượng vé trong đơn hàng',
  `total_price` decimal(10,2) NOT NULL COMMENT 'Tổng số tiền của cả đơn hàng',
  `purchase_date` datetime DEFAULT NULL,
  `code_promotion` varchar(255) DEFAULT NULL,
  `id_payment` int DEFAULT NULL,
  `device_issued_id` varchar(255) DEFAULT NULL COMMENT 'ID của thiết bị/POS nơi tạo đơn hàng',
  `id_employee` char(36) DEFAULT NULL,
  `status` enum('PENDING','COMPLETED','CANCELLED','REFUNDED') DEFAULT 'PENDING' COMMENT 'Trạng thái thanh toán/xử lý của đơn hàng',
  `id_payment_method` int DEFAULT NULL,
  `PaymentNote` varchar(255) DEFAULT NULL COMMENT 'Nội dung/Ghi chú thanh toán (Mã giao dịch, memo...)',
  PRIMARY KEY (`id`),
  KEY `id_user` (`id_user`),
  KEY `code_promotion` (`code_promotion`),
  KEY `id_payment` (`id_payment`),
  KEY `id_employee` (`id_employee`),
  KEY `id_payment_method` (`id_payment_method`),
  CONSTRAINT `tickets_ibfk_301` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `tickets_ibfk_302` FOREIGN KEY (`code_promotion`) REFERENCES `promotions` (`Code`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tickets_ibfk_303` FOREIGN KEY (`id_payment`) REFERENCES `payments` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tickets_ibfk_304` FOREIGN KEY (`id_employee`) REFERENCES `employees` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tickets_ibfk_305` FOREIGN KEY (`id_payment_method`) REFERENCES `payment_methods` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES ('1d6d7151-b620-42cf-87e8-edff7ac4b8bd','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,0.00,'2026-05-05 19:37:12',NULL,NULL,NULL,NULL,'COMPLETED',3,'0VND_1778009831060_MOT159X8'),('277d33f5-9e73-4eea-b04a-f911304876dc','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,7000.00,'2026-05-05 18:52:02',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',4,'260506_MOSZIW9H'),('27cccfb8-8abb-4b31-a2ca-e47e6a0e539d','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,2000.00,'2026-05-12 14:29:23',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',1,'Phụ phí bổ sung vé 679564F9 | Ga mới: ID 5'),('2af90f6c-67b0-46d1-9727-40a5534ac462','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,7000.00,'2026-04-30 19:05:53',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',2,'BRT-8622R5'),('2c12b6c0-6bb7-4ba8-9f10-43dc43f7dca0','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,5000.00,'2026-05-05 19:17:27',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',2,'Phụ phí bổ sung vé 9D90CF41 | Ga mới: ID 5'),('2cc95d1d-7865-4c58-a0c9-b75335c2b3be','ab202955-1653-4a88-b88d-1fc3199e0796',2,14000.00,'2026-05-12 03:48:04',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',4,'260512_MP23BAZJ'),('2cd90b7e-8232-4038-ad4b-fcc5b0572819','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,0.00,'2026-04-30 08:15:51',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',3,'BRT-T-RLU04E'),('300dac80-41ae-47be-acb8-e5804385dfab','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,50000.00,'2026-05-11 18:50:11',NULL,NULL,NULL,NULL,'COMPLETED',4,'260512_MP1K38DZ'),('389fa9a4-e5b7-40b6-a8df-13ee18b3e2c0','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,7000.00,'2026-05-05 19:11:31',NULL,NULL,NULL,NULL,'COMPLETED',2,'MOB-1778008291693'),('3b7587c7-13fc-4f03-8a62-073e836f9057','d2426c1a-195b-4ec4-8d38-75baad2c29f3',3,21000.00,'2026-04-26 21:08:53',NULL,NULL,NULL,NULL,'COMPLETED',1,'MOB-1777237734227'),('42585e4b-29c4-4c52-a69f-5a6486225f85','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,0.00,'2026-05-05 17:59:51','KT01',NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',4,'BRT-T-WYJ6SV'),('488b62de-1e0d-44e7-b524-1980f9522935','d2426c1a-195b-4ec4-8d38-75baad2c29f3',3,30000.00,'2026-04-26 21:09:20',NULL,NULL,NULL,NULL,'COMPLETED',1,'MOB-1777237761802'),('4cbc0f5f-2157-4b4f-a59b-53674e1ab03d','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,10000.00,'2026-04-30 18:32:31',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',2,'BRT-L6FJR5'),('67d863fe-0c6e-4b75-9f77-74ee5e1b41cf','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,7000.00,'2026-05-05 17:28:54',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',4,'260506_MOSWJGPA'),('6afab2e5-901f-4515-bd8d-7daa61c764ba','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,2000.00,'2026-05-05 16:01:23',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',3,'BRT-UO6XCQ'),('6d2b8849-b4da-4465-bb1a-c56b8a7449f1','0bb5e2a2-cee9-4275-984e-32b01d23b91f',1,10000.00,'2026-04-23 20:31:48',NULL,NULL,NULL,NULL,'COMPLETED',1,'MOB-1776976309138'),('7116d7a4-5112-4580-b730-2eab9c755b5f','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,10000.00,'2026-04-26 09:21:02',NULL,NULL,NULL,NULL,'COMPLETED',1,'MOB-1777195261724'),('75a6c603-2371-4aed-8603-6170cab03f92','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,10000.00,'2026-04-30 20:08:54',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',1,'Phụ phí đổi ga đến cho vé E7A2ABB4'),('7b908879-4191-4353-a903-a6a3053db57c','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,0.00,'2026-05-05 17:53:44',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',1,'BRT-T-DCBAXQ'),('8d6d7f23-4f3c-47a1-8d47-58863ccad38a','ab202955-1653-4a88-b88d-1fc3199e0796',1,5000.00,'2026-05-12 14:17:30',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',1,'Phụ phí bổ sung vé D2B29C25 | Ga mới: ID 5'),('91843e90-ef8a-40d9-bf7f-ea8ae15cec9d','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,10000.00,'2026-04-26 09:00:10',NULL,NULL,NULL,NULL,'COMPLETED',1,'MOB-1777194009563'),('96613aaa-310e-4615-a75a-c08c655a38d3','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,300000.00,'2026-05-05 17:38:14',NULL,NULL,NULL,NULL,'COMPLETED',1,'MOB-1778002694519'),('a1d289fd-938c-48e0-8294-1ce6a56d4d59','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,300000.00,'2026-05-05 19:14:50',NULL,NULL,NULL,NULL,'COMPLETED',3,'260506_MOT0C1U7'),('d0a9d67f-96c9-4ba5-8501-cf5dcd0ed1d6','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,10000.00,'2026-05-12 14:22:27',NULL,NULL,NULL,NULL,'COMPLETED',1,'MOB-1778595746517'),('d65fb944-cd0f-4363-8665-cd2010b2229c','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,12000.00,'2026-04-30 17:26:35',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',1,'BRT-FX2Z4P'),('d9c9dbd1-9cde-4e8b-ac28-39a39780ef1d','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,10000.00,'2026-04-30 21:22:04',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',3,'BRT-AC6P6H'),('dc192172-d2e8-4f49-bcae-5ad3d29f3e44','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,2000.00,'2026-04-30 21:28:00',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',1,'Phụ phí bổ sung vé BCC03C09 | Ga mới: ID 5'),('f1a527cf-bf01-4472-b00b-ee1913d01e4e','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,50000.00,'2026-04-26 20:37:27',NULL,NULL,NULL,NULL,'COMPLETED',1,'MOB-1777235848518'),('f50688aa-f87b-4027-be33-1677494f8d71','ab202955-1653-4a88-b88d-1fc3199e0796',1,5000.00,'2026-05-12 03:49:39',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',2,'Phụ phí bổ sung vé 9CE531D5 | Ga mới: ID 5'),('f9b51c1d-ecf2-48f1-83d0-44b078d1e6f5','e347ed38-1d53-4260-a976-f4599bd4f2c8',1,50000.00,'2026-04-26 20:15:24',NULL,NULL,NULL,NULL,'COMPLETED',1,'MOB-1777234525004'),('fcbde160-d1a4-45e5-85b7-2c0a2beb514a','d2426c1a-195b-4ec4-8d38-75baad2c29f3',1,7000.00,'2026-05-05 19:10:28',NULL,NULL,NULL,NULL,'COMPLETED',4,'260506_MOT06FPR'),('fe9617b7-6d17-4aff-984f-82ad39379ba1','ab202955-1653-4a88-b88d-1fc3199e0796',1,12000.00,'2026-05-11 18:29:19',NULL,NULL,NULL,'1af1d1ae-e496-4e59-865a-010ec6bcdcda','COMPLETED',4,'260512_MP1JC0BH');
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) NOT NULL,
  `birthday` date NOT NULL,
  `sex` varchar(255) NOT NULL COMMENT 'Giới tính (thường là string để dễ map dữ liệu client)',
  `cccd_number` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL COMMENT 'Bắt buộc đối với Customer. Employee có thể login bằng bảng employees',
  `avatar` varchar(255) DEFAULT NULL,
  `cccd_front` varchar(255) NOT NULL,
  `cccd_back` varchar(255) NOT NULL,
  `issue_date` date NOT NULL,
  `address` varchar(255) NOT NULL,
  `id_Role` int NOT NULL,
  `status` tinyint(1) DEFAULT '0' COMMENT 'Trạng thái online: true khi login',
  `is_locked` tinyint(1) DEFAULT '0' COMMENT 'Trạng thái khóa tài khoản: true khi bị admin khóa',
  `is_face_registered` tinyint(1) DEFAULT '0' COMMENT 'Xác định user đã đăng ký khuôn mặt chưa',
  `face_data` longtext COMMENT 'Dữ liệu vector khuôn mặt',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_phone` (`phone`),
  UNIQUE KEY `users_cccd_number` (`cccd_number`),
  UNIQUE KEY `users_email` (`email`),
  KEY `id_Role` (`id_Role`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_Role`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('0bb5e2a2-cee9-4275-984e-32b01d23b91f','Doãn Quốc Huy','doanhuypc2308@gmail.com','0978320093','2004-08-23','Nam','033204002762','$2b$10$Ubihpnd42inhOlXKPXHwKu8YmQNjA4TFhj8z8ph5ioXSOxNMaJdim','/uploads/avatar-1776712036897-623452903.jpg','/uploads/cccd_front-1776712036749-639110527.jpg','/uploads/cccd_back-1776712036846-241357448.jpg','2021-04-15','Thôn Đình Cao, Đình Cao, Phù Cừ, Hưng Yên',1,1,0,0,NULL,'2026-04-20 19:07:17'),('ab202955-1653-4a88-b88d-1fc3199e0796','Trần Nhật Thăng',NULL,'0978320009','1944-09-02','Nam','033044000198','$2b$10$0eNWbeKGyY3oqzF0f74V9O7f6m4ISPCIXuMXR3U6JQK9Dn9/Z9LBe','/uploads/avatar-1778099676844-770166311.jpg','/uploads/cccd_front-1778099676399-727812608.jpg','/uploads/cccd_back-1778099676679-222651632.jpg','2021-04-08','166 Ngõ Quan Thổ 1, Ô Chợ Dừa, Đống Đa, Hà Nội',3,1,0,0,NULL,'2026-05-06 20:34:36'),('d2426c1a-195b-4ec4-8d38-75baad2c29f3','Nguyễn Lê Nhất Lâm','staff01@gmail.com','0978320000','2010-11-13','Nam','001210050456','$2b$10$Ubihpnd42inhOlXKPXHwKu8YmQNjA4TFhj8z8ph5ioXSOxNMaJdim','/uploads/avatar-1778002331819-699011713.jpg','/uploads/cccd_front_1777536951542_616695938.jpg','/uploads/cccd_back_1777536951545_295880566.jpg','2024-08-06','Số Nhà 8 Ngõ 16 Tdp Chiến Thắng, Vạn Phúc, Hà Đông, Hà Nội',3,1,0,1,'[0.03648126870393753,0.07030594348907471,-0.003934387117624283,0.023948736488819122,0.018289044499397278,0.0015949708176776767,-0.04952431470155716,0.0015376153169199824,-0.026691222563385963,-0.01290702074766159,0.07291153818368912,-0.037521954625844955,-0.013656843453645706,-0.019863566383719444,-0.015923557803034782,-0.0014635297702625394,0.05719660967588425,0.05324161797761917,-0.030781593173742294,-0.0013856543228030205,0.020440788939595222,-0.008235729299485683,0.016873667016625404,-0.008705328218638897,0.00466106366366148,0.02017328329384327,0.04306509718298912,0.0031737128738313913,0.05616305023431778,0.011587579734623432,0.014631180092692375,0.08060569316148758,0.03256860002875328,0.011499662883579731,0.04422101005911827,-0.05660838633775711,-0.05352960154414177,-0.10398159921169281,-0.010638569481670856,0.004583929665386677,-0.061994682997465134,-0.03813081607222557,-0.02923819050192833,-0.01795322634279728,-0.018972141668200493,-0.045466285198926926,-0.02699265442788601,0.02290835604071617,0.010876843705773354,0.057814572006464005,-0.04245994612574577,-0.06702454388141632,0.05488777533173561,0.006821183022111654,0.03528745844960213,0.025126701220870018,-0.04495485499501228,0.01428991463035345,0.018031461164355278,0.017261480912566185,0.04986760392785072,0.07585114240646362,-0.022278791293501854,0.0702233836054802,0.04405863210558891,-0.029023552313447,-0.03885940834879875,-0.013567186892032623,0.013336041010916233,-0.01217260118573904,-0.01773938536643982,0.053469572216272354,-0.06490472704172134,0.06318344920873642,0.003542297752574086,0.014730188064277172,-0.02697012946009636,-0.007697578985244036,0.03948379307985306,0.00832617748528719,0.05362706258893013,-0.02892221324145794,-0.06509610265493393,0.033889323472976685,0.11870644241571426,-0.056685078889131546,0.022920073941349983,0.0839538648724556,0.04966496676206589,-0.019822919741272926,0.007927571423351765,-0.05166110396385193,0.05521624535322189,-0.016899853944778442,0.05810732766985893,0.046192899346351624,-0.03542055934667587,0.031649015843868256,0.01168297789990902,0.0441359244287014,0.04786800220608711,0.033869389444589615,-0.01936112716794014,0.04784834757447243,0.031094936653971672,0.01692783087491989,0.001530744368210435,-0.02913188748061657,0.03732994198799133,-0.023121478036046028,0.06740014255046844,0.005640800576657057,-0.0019054269650951028,-0.06880960613489151,-0.10527443140745163,0.007847228087484837,-0.02184245176613331,0.015470720827579498,-0.005839121527969837,0.09754269570112228,0.030994923785328865,-0.008519486524164677,-0.07062758505344391,0.026115765795111656,-0.047842323780059814,0.005931351333856583,0.1155872642993927,-0.10262563079595566,0.003038007067516446,0.001026591518893838,-0.022259727120399475,-0.0035987277515232563,0.020190194249153137,-0.06807689368724823,-0.00368761015124619,0.006562169641256332,0.018489385023713112,-0.05023539438843727,0.000502638693433255,0.05353149399161339,0.023368367925286293,0.021243402734398842,-0.0985250174999237,-0.07388483732938766,-0.023454423993825912,-0.021397491917014122,-0.052371952682733536,0.01051048468798399,-0.004110054112970829,-0.01702744886279106,0.03782875835895538,0.047780103981494904,-0.003881516633555293,0.038389500230550766,0.056782349944114685,0.02005799487233162,-0.07498114556074142,0.012560028582811356,0.01785409450531006,-0.06529601663351059,0.022960834205150604,0.01857704669237137,0.023256557062268257,0.04565597325563431,0.01115212682634592,-0.0696953535079956,0.059638671576976776,0.08555493503808975,-0.058694612234830856,0.011162388138473034,-0.05106758698821068,0.0004170145548414439,-0.04721837863326073,-0.06059382110834122,-0.0137174678966403,0.05508141964673996,-0.09805839508771896,0.059152647852897644,-0.034586720168590546,-0.0011038106167688966,0.010671516880393028,-0.04362772777676582,-0.035701654851436615,0.06078625097870827,0.0724954679608345,0.02159177139401436,-0.019886383786797523,0.02251133881509304,-0.06750205904245377,0.09258132427930832,-0.03623877465724945,0.025799617171287537,0.06586889177560806,-0.09303294122219086,0.028578905388712883,0.00895141251385212,-0.07688868045806885,-0.022311603650450706,0.05329997465014458,-0.03441406413912773,0.07673672586679459,-0.003620707895606756,0.0325743593275547,-0.022591926157474518,0.03216146305203438,-0.04560457542538643,-0.06955914199352264,-0.042781829833984375,-0.0455046147108078,0.05396907404065132,-0.01639425940811634,-0.043236520141363144,0.018502462655305862,-0.005594741087406874,-0.05587318539619446,0.05853787809610367,0.022570190951228142,0.055394046008586884,-0.020221130922436714,-0.01600712724030018,0.010444257408380508,0.05026965215802193,0.013217341154813766,0.08434896171092987,0.03650965914130211,-0.012850376777350903,-0.0005683937924914062,0.015652399510145187,-0.052862007170915604,-0.0032204336021095514,0.03989139944314957,-0.0453471839427948,-0.037742651998996735,-0.09300577640533447,0.02130342833697796,-0.004122551064938307,-0.029778849333524704,0.035231463611125946,0.056089937686920166,0.021013926714658737,-0.013880478218197823,0.008983926847577095,-0.028793739154934883,-0.022402357310056686,0.06734859943389893,0.039084672927856445,-0.03626688942313194,-0.023601777851581573,0.06296800076961517,0.008865500800311565,-0.06665224581956863,-0.0014557972317561507,0.041339267045259476,0.010414580814540386,-0.03044547513127327,-0.01871536858379841,0.0032777879387140274,0.08313549309968948,0.052447035908699036,0.03046691231429577,-0.038097597658634186,-0.03294385224580765,0.09966350346803665,-0.017078271135687828,0.048892516642808914,-0.12117712199687958,-0.017702540382742882,0.05546807125210762,0.020159723237156868,-0.07680051028728485,0.05544194579124451,0.0025277521926909685,0.07937543839216232,0.021039025858044624,0.013111177831888199,0.07527507096529007,-0.014486989937722683,0.005822625942528248,-0.0920558050274849,-0.018298620358109474,0.000360912992618978,0.02845950424671173,-0.03893332928419113,0.022778136655688286,0.021728549152612686,-0.021551214158535004,0.035838499665260315,-0.017517441883683205,-0.05288543552160263,-0.03688551113009453,-0.054972440004348755,-0.051676757633686066,-0.015461944043636322,-0.02991616353392601,-0.0007900825585238636,-0.020010367035865784,0.008509081788361073,-0.04265676066279411,0.028896477073431015,-0.004588024225085974,0.053023118525743484,-0.009516799822449684,0.0005716135492548347,-0.0038208775222301483,0.018620887771248817,0.030214084312319756,0.026371557265520096,-0.005113708321005106,-0.04731912538409233,-0.013004390522837639,-0.0987565815448761,-0.006569804158061743,0.03587288036942482,-0.004552618600428104,0.07119958102703094,0.0249701589345932,-0.04653353989124298,0.019705113023519516,0.022674500942230225,-0.055453039705753326,-0.007592960726469755,-0.05548302084207535,-0.05058539658784866,-0.011472512036561966,-0.007327048107981682,-0.015386369079351425,-0.007737614680081606,0.10527103394269943,0.014856144785881042,0.01150940079241991,0.024038882926106453,0.07855334132909775,-0.068695567548275,0.06542152911424637,0.023980794474482536,0.05850563943386078,-0.04073420166969299,-0.04909408092498779,-0.07343488931655884,0.010323050431907177,0.050700411200523376,0.01703333854675293,0.024791304022073746,-0.02418035827577114,0.048947326838970184,0.05025249347090721,0.03933846578001976,0.03513743355870247,0.027652887627482414,0.010872081853449345,-0.010171630419790745,-0.04551086947321892,0.0007572457543574274,0.019002238288521767,-0.0025717199314385653,0.01193918101489544,0.053285349160432816,-0.04697541892528534,0.046315357089042664,-0.019638899713754654,-0.08987417817115784,-0.05446657910943031,-0.053882140666246414,-0.05788756534457207,-0.014925428666174412,0.037931278347969055,0.004702252801507711,-0.05281491205096245,-0.05496136099100113,0.018708856776356697,-0.04246992617845535,0.0036743823438882828,-0.02941982075572014,0.03840717300772667,0.05275891348719597,0.053460147231817245,-0.012128076516091824,0.05844273045659065,-0.05744437500834465,0.02106339856982231,-0.03149136155843735,-0.028745410963892937,-0.051202498376369476,0.0276498906314373,0.04771561920642853,-0.05776914209127426,0.013738906010985374,0.0737895593047142,0.004564294591546059,0.052120935171842575,-0.060551103204488754,0.04811008647084236,-0.04128187149763107,-0.02076846733689308,0.011604828760027885,-0.009872324764728546,-0.013918767683207989,0.04633055999875069,0.012735052034258842,-0.06671158969402313,-0.021741773933172226,-0.00021057712729088962,0.03664697706699371,-0.025981200858950615,0.0003813084040302783,0.008191215805709362,-0.05244109407067299,-0.011861804872751236,0.040014442056417465,-0.05418892204761505,0.09196153283119202,0.010919244959950447,-0.013758361339569092,-0.040543120354413986,-0.03903651982545853,-0.03787170723080635,0.06807108968496323,0.08296091109514236,-0.02968743070960045,0.014290763065218925,0.06914552301168442,-0.016674799844622612,-0.02346668764948845,0.06145304813981056,0.04770124703645706,0.016751235350966454,0.03680187836289406,-0.02341969683766365,0.020260022953152657,-0.00955538172274828,-0.052529044449329376,-0.02683357335627079,-0.046935103833675385,-0.05186782032251358,0.02530365251004696,-0.0051099034026265144,-0.029975373297929764,-0.07486721873283386,-0.02743867225944996,-0.02497723139822483,0.007247406989336014,0.008657106198370457,-0.04816991835832596,0.0034506747033447027,-0.01597742550075054,0.007223050110042095,-0.0067258006893098354,0.11300552636384964,-0.0294568482786417,-0.014991541393101215,0.08357881009578705,-0.050550222396850586,0.10897800326347351,-0.017582233995199203,0.018608080223202705,-0.01998966932296753,-0.0516992025077343,0.06039189547300339,0.054326996207237244,0.07053570449352264,0.004751779139041901,0.08435707539319992,-0.024379989132285118,0.02586270309984684,0.09842348098754883,0.03190642595291138,0.05768829211592674,-0.11159754544496536,0.04929126799106598,-0.024410784244537354,-0.025680644437670708,-0.04416502267122269,-0.009986912831664085,-0.04932836815714836,-0.06652607768774033,-0.002608291804790497,-0.011490043252706528,-0.04316696524620056,0.028423475101590157,-0.04083798825740814,0.07941624522209167,0.03506110608577728,-0.01596064493060112,0.05627010017633438,-0.06593899428844452,-0.07585782557725906,-0.00041559708188287914,0.07458019256591797,0.013694025576114655,-0.07748348265886307,0.03786947950720787,0.013768416829407215,-0.01033580582588911,0.005057475529611111,0.05323212593793869,-0.06395273655653,-0.019242020323872566,-0.02359600178897381,0.005188106093555689,-0.09412503987550735,-0.05379306524991989,0.021814772859215736,0.0002161640877602622,-0.0496399961411953,-0.00928591936826706,-0.013750370591878891,-0.020662065595388412,0.018623100593686104,-0.016447551548480988,-0.07292362302541733,0.051602721214294434,0.026564039289951324]','2026-04-24 03:02:47'),('e347ed38-1d53-4260-a976-f4599bd4f2c8','Nguyễn Nhật Hải',NULL,'0978320099','2012-08-30','Nam','001212016625','$2b$10$uNA1rkw9RnqT3BFv/FoW5./ezAtUguEOQm3HSBmI3hwSRJLFz26x.','/uploads/avatar-1778096320561.jpg','/uploads/cccd_front_1776973977824_467507619.jpg','/uploads/cccd_back_1776973977827_704417977.jpg','2024-09-03','Số 1 Ngách 18 Ngõ 236 Đường Khương Đình, Hạ Đình, Thanh Xuân, Hà Nội',3,1,0,1,'[0.04695771634578705,0.04543852061033249,0.0019001464825123549,-0.008432438597083092,0.03669404610991478,-0.0019687488675117493,-0.04951569437980652,-0.0015698702773079276,-0.01780274324119091,0.008202442899346352,0.01929517649114132,-0.026932334527373314,-0.03137872740626335,-0.014348717406392097,-0.011735087260603905,-0.00919539574533701,0.04168623685836792,0.05464848503470421,-0.034818172454833984,0.013615204952657223,0.03981862589716911,0.006924768444150686,0.03820118308067322,-0.0153115876019001,-0.011779717169702053,0.03726283088326454,0.04768753424286842,-0.004866815637797117,0.06336361169815063,-0.031729139387607574,0.041997019201517105,0.09419829398393631,0.04415076598525047,0.006532455328851938,0.07507853955030441,-0.06160607933998108,-0.043495260179042816,-0.09776099771261215,-0.03647981584072113,0.025786127895116806,-0.0403265543282032,-0.02381177619099617,-0.03881021589040756,-0.00933065265417099,-0.04481574520468712,-0.07683585584163666,-0.014299682341516018,0.05587650090456009,-0.0583636574447155,0.054084859788417816,-0.05936247482895851,-0.05630837008357048,0.0633748397231102,-0.010174984112381935,0.03627876564860344,0.039762113243341446,-0.019849110394716263,0.0035710586234927177,0.03519844636321068,0.006268613506108522,0.032318830490112305,0.09665407240390778,-0.029377715662121773,0.05844029039144516,0.037048328667879105,-0.05078107491135597,-0.0248683113604784,-0.012201186269521713,0.0028494014404714108,-0.03263199329376221,-0.006374652963131666,0.02318035438656807,-0.07655021548271179,0.05534632131457329,0.005705137737095356,0.018692497164011,-0.011648720130324364,0.004330226685851812,0.02684161439538002,-0.023645667359232903,0.057890474796295166,-0.031018413603305817,-0.07461991906166077,0.04789411649107933,0.08953538537025452,-0.0659276470541954,0.01829943060874939,0.0905243456363678,-0.004478468094021082,-0.03304727375507355,0.019519289955496788,-0.06435605138540268,0.07361623644828796,-0.039258379489183426,0.05660727992653847,0.03790745139122009,-0.0599110946059227,0.015578712336719036,0.0003157622122671455,0.038427818566560745,0.08619726449251175,0.052262552082538605,-0.02322925254702568,0.05575929209589958,0.036207377910614014,0.020588625222444534,-0.0057439180091023445,-0.037725359201431274,0.03756106272339821,-0.023780319839715958,0.07716573774814606,0.018479319289326668,-0.014987476170063019,-0.06362362951040268,-0.09297318756580353,0.02028331160545349,-0.01871652342379093,0.021207600831985474,0.015398441813886166,0.09581610560417175,0.0366230271756649,-0.033063855022192,-0.0625554695725441,0.02433086559176445,-0.0697023794054985,0.020937930792570114,0.12202434986829758,-0.11769289523363113,-0.0007646232843399048,-0.00013581659004557878,-0.0225291159003973,0.001796390162780881,0.009130266495049,-0.10362578183412552,-0.008408785797655582,0.011290236376225948,0.018675824627280235,-0.06666550785303116,0.016238346695899963,0.02282281219959259,0.0037778178229928017,0.003244606778025627,-0.09172462671995163,-0.0656554251909256,-0.009328268468379974,-0.034759361296892166,-0.04936110973358154,-0.000034034143027383834,-0.0037504041101783514,-0.03736383840441704,0.030315879732370377,0.05236520618200302,-0.0020685403142124414,0.01023218035697937,0.06319939345121384,0.020863927900791168,-0.08320270478725433,0.03402198851108551,0.01430254615843296,-0.08199719339609146,0.004647864028811455,0.023806190118193626,0.015175850130617619,0.037553299218416214,0.0271855890750885,-0.034263599663972855,0.04076050966978073,0.08055650442838669,-0.07827825844287872,-0.010337334126234055,-0.05258931592106819,-0.041709527373313904,-0.0511430948972702,-0.06709064543247223,0.006394271273165941,0.03570326045155525,-0.11371421068906784,0.05959952622652054,-0.05517628788948059,0.0013132370077073574,-0.0020622480660676956,-0.021916816011071205,-0.02901967614889145,0.03513842821121216,0.08896172791719437,0.025198567658662796,-0.04294150322675705,0.010398180224001408,-0.05325031280517578,0.06866861134767532,-0.019319457933306694,0.0348568893969059,0.07047925889492035,-0.08217350393533707,0.04469168931245804,0.019508004188537598,-0.08671330660581589,0.008752319030463696,0.05196791887283325,-0.027291398495435715,0.051877204328775406,-0.011745122261345387,0.023023655638098717,-0.05362173914909363,0.004925508052110672,-0.05918967351317406,-0.056751467287540436,-0.023959262296557426,-0.022881250828504562,0.059221766889095306,-0.02176632173359394,-0.025805748999118805,-0.003116582753136754,0.010005708783864975,-0.05531545728445053,0.055525269359350204,0.030436016619205475,0.04490675777196884,-0.03420967981219292,-0.012767135165631771,0.009021952748298645,0.05984228476881981,0.019716689363121986,0.095854751765728,0.015824630856513977,-0.02122817188501358,-0.016766689717769623,-0.029444890096783638,-0.05039618909358978,-0.00368830980733037,0.02780519798398018,-0.03424358740448952,-0.022211765870451927,-0.09733635932207108,0.027486981824040413,-0.020389309152960777,-0.014594386331737041,0.02371087484061718,0.06854134052991867,-0.004161881748586893,-0.0200494471937418,-0.02140607126057148,-0.02992669679224491,-0.023747870698571205,0.03590229153633118,0.025721121579408646,-0.009967293590307236,-0.03180266171693802,0.026148047298192978,0.02042275108397007,-0.037450920790433884,-0.020594220608472824,0.05528627708554268,0.006573584396392107,-0.034783706068992615,-0.029131263494491577,-0.005315088201314211,0.09797137975692749,0.042402710765600204,0.043614763766527176,-0.026189565658569336,-0.023767882958054543,0.0936470478773117,-0.0009490987868048251,0.03485522046685219,-0.12780866026878357,-0.0012444952735677361,0.050720155239105225,0.03529355674982071,-0.058817774057388306,0.07229578495025635,0.007446316070854664,0.05742087587714195,-0.028082074597477913,-0.0035373265855014324,0.05961426720023155,-0.012451393529772758,0.02122463844716549,-0.07801071554422379,-0.00041310148662887514,0.014189093373715878,0.017090393230319023,-0.02330046519637108,0.03061208687722683,0.017125282436609268,-0.012449228204786777,0.05040355399250984,-0.05361715331673622,-0.010872374288737774,-0.03995204344391823,-0.046163830906152725,-0.03428179770708084,-0.014510774984955788,-0.02311265468597412,-0.007088426034897566,-0.0069427890703082085,0.024558646604418755,-0.057525455951690674,0.023592399433255196,0.00420415261760354,0.037432119250297546,-0.008409933187067509,-0.01936243660748005,0.006530750542879105,0.011242297478020191,0.012587327510118484,0.021212996914982796,-0.007715583313256502,-0.05680885910987854,-0.020061619579792023,-0.11292839050292969,-0.025850314646959305,-0.01205481681972742,0.010874895378947258,0.03367979824542999,0.04256744310259819,-0.04490429162979126,0.008323347195982933,0.03808929771184921,-0.05875122547149658,-0.007156193722039461,-0.05222048610448837,-0.04828990623354912,-0.002332334639504552,-0.028631387278437614,-0.012422408908605576,-0.007296268828213215,0.10170925408601761,-0.006608130875974894,0.012115687131881714,-0.00877642072737217,0.07384634017944336,-0.062323201447725296,0.03849583864212036,0.007097917143255472,0.03950352966785431,-0.016209322959184647,-0.04322119057178497,-0.10010164231061935,0.012649665586650372,0.002626069588586688,-0.0035094183403998613,0.021641680970788002,-0.007126482203602791,0.04384935647249222,0.05204571411013603,0.04619412124156952,0.04533931240439415,0.04096771776676178,0.0333440937101841,-0.01467460859566927,-0.03072141297161579,0.006645291578024626,0.018458861857652664,-0.01994049921631813,-0.020866023376584053,0.04083488881587982,-0.05430683121085167,0.04953064024448395,0.0066438401117920876,-0.05604904890060425,-0.042067211121320724,-0.06506980210542679,-0.058716848492622375,-0.019996948540210724,0.0905216783285141,0.006445724051445723,-0.017031697556376457,-0.013101423159241676,0.004106552805751562,-0.04668585583567619,0.008851401507854462,-0.03644533455371857,0.060509610921144485,0.03635026887059212,0.03511778637766838,-0.03980991244316101,0.04966861009597778,-0.006801532115787268,0.022802570834755898,-0.034730322659015656,-0.02549281343817711,-0.045510273426771164,0.02514500543475151,0.036765918135643005,-0.04957469552755356,0.04474596306681633,0.04805911332368851,-0.003089848207309842,0.030293818563222885,-0.05693790316581726,0.06117301061749458,-0.03137482702732086,-0.0019108769483864307,0.02822437509894371,-0.005985556170344353,-0.039883606135845184,0.06702348589897156,0.039248812943696976,-0.09384864568710327,-0.020770220085978508,0.0009400031995028257,0.025286279618740082,-0.012961980886757374,0.007241324055939913,0.014036617241799831,-0.07509148865938187,-0.01356325950473547,0.05948883295059204,-0.05100647360086441,0.08627717941999435,0.01605156995356083,-0.01194021012634039,-0.04361487552523613,-0.05877429246902466,-0.03678794205188751,0.07481357455253601,0.03276204317808151,-0.02513849176466465,-0.011482720263302326,0.051397573202848434,-0.0024024141021072865,-0.032267965376377106,0.06778634339570999,0.045870352536439896,-0.01171970460563898,0.0473550409078598,-0.039787061512470245,0.005765700247138739,0.010834060609340668,-0.07222782075405121,-0.018992260098457336,-0.0314251072704792,-0.052355457097291946,0.017433002591133118,-0.013089979998767376,-0.019510820508003235,-0.04432559385895729,-0.030707890167832375,-0.025751741603016853,0.012900998815894127,-0.00827019102871418,-0.057870302349328995,-0.026313701644539833,0.005065361503511667,-0.010596740059554577,-0.009080803021788597,0.10297303646802902,-0.053739797323942184,-0.016673529520630836,0.07409406453371048,-0.021763578057289124,0.09255120903253555,-0.004705933388322592,0.03207561746239662,-0.0098343500867486,-0.06458987295627594,0.05421300232410431,0.06297232210636139,0.0702505111694336,0.033660292625427246,0.1097230538725853,-0.023119941353797913,0.02045542560517788,0.10567882657051086,0.03507431596517563,0.04859647527337074,-0.09551437199115753,0.03736542537808418,0.0104581443592906,-0.011110836640000343,-0.0212562158703804,-0.014676048420369625,-0.02111898735165596,-0.05520085245370865,0.0022020896431058645,0.020006926730275154,-0.041703417897224426,0.01165247056633234,-0.02672731876373291,0.09097237884998322,0.017622150480747223,-0.011619380675256252,0.06926438957452774,-0.023900987580418587,-0.057633284479379654,0.007765707094222307,0.0480230413377285,0.03869553655385971,-0.08297692239284515,0.03842699155211449,-0.02487003244459629,0.016964545473456383,0.007382058072835207,0.04106523096561432,-0.07472507655620575,-0.019326744601130486,-0.05014233663678169,-0.022314801812171936,-0.09319812059402466,-0.08247125148773193,0.006693319417536259,-0.0038477876223623753,-0.0346890352666378,-0.021697603166103363,-0.028431488201022148,-0.023952892050147057,0.03431301563978195,-0.04178465157747269,-0.07792067527770996,0.04509465768933296,0.01987147331237793]','2026-04-21 17:04:40'),('ea6c0de0-d75e-4ee3-81cc-9c30116a1e5f','Admin HY','admin@hungyen.brt','0911000001','1990-01-01','Nam','001099000001','$2b$10$nBGdqh6ZGKckEKpAjMBobukEeCZxBR0OgXViKItIMj9QRXPnVMf1q',NULL,'seed/cccd_front.jpg','seed/cccd_back.jpg','2020-01-01','Hưng Yên, Việt Nam',1,1,0,0,NULL,'2026-04-21 14:02:54'),('fbaa585b-836b-43b0-8aaf-4f356a7601ab','Nhân Viên BRT','staff@hungyen.brt','0911000002','1995-06-15','Nam','001099000002','$2b$10$2pYAR2AQ7AZOT84jwO.C9.1lTd/s78WxeCVSgykEhVqpFQ77eg2lS',NULL,'seed/cccd_front.jpg','seed/cccd_back.jpg','2021-06-01','Hưng Yên, Việt Nam',2,1,0,0,NULL,'2026-04-21 14:02:54');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vouchers` (
  `Id` char(36) NOT NULL,
  `Code` varchar(50) NOT NULL COMMENT 'Mã giảm giá (ví dụ: SV2024-XXXX)',
  `Id_User` char(36) NOT NULL,
  `Id_Discount_Registration` int NOT NULL,
  `applicable_category_code` varchar(20) NOT NULL DEFAULT 'TIME' COMMENT 'Giới hạn áp dụng cho danh mục nào (Mặc định: TIME)',
  `Start_Date` datetime NOT NULL,
  `End_Date` datetime NOT NULL COMMENT 'Hết hạn theo niên khóa/giấy tờ (Lấy từ registration.expiry_date)',
  `Usage_Limit` int DEFAULT NULL COMMENT 'Số lần sử dụng tối đa. NULL = không giới hạn trong thời gian hiệu lực',
  `is_active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Code` (`Code`),
  UNIQUE KEY `Code_2` (`Code`),
  UNIQUE KEY `Code_3` (`Code`),
  UNIQUE KEY `Code_4` (`Code`),
  UNIQUE KEY `Code_5` (`Code`),
  UNIQUE KEY `Code_6` (`Code`),
  UNIQUE KEY `Code_7` (`Code`),
  UNIQUE KEY `Code_8` (`Code`),
  UNIQUE KEY `Code_9` (`Code`),
  UNIQUE KEY `Code_10` (`Code`),
  UNIQUE KEY `Code_11` (`Code`),
  UNIQUE KEY `Code_12` (`Code`),
  UNIQUE KEY `Code_13` (`Code`),
  UNIQUE KEY `Code_14` (`Code`),
  UNIQUE KEY `Code_15` (`Code`),
  UNIQUE KEY `Code_16` (`Code`),
  UNIQUE KEY `Code_17` (`Code`),
  UNIQUE KEY `Code_18` (`Code`),
  UNIQUE KEY `Code_19` (`Code`),
  UNIQUE KEY `Code_20` (`Code`),
  UNIQUE KEY `Code_21` (`Code`),
  UNIQUE KEY `Code_22` (`Code`),
  UNIQUE KEY `Code_23` (`Code`),
  UNIQUE KEY `Code_24` (`Code`),
  UNIQUE KEY `Code_25` (`Code`),
  UNIQUE KEY `Code_26` (`Code`),
  UNIQUE KEY `Code_27` (`Code`),
  UNIQUE KEY `Code_28` (`Code`),
  UNIQUE KEY `Code_29` (`Code`),
  UNIQUE KEY `Code_30` (`Code`),
  UNIQUE KEY `Code_31` (`Code`),
  UNIQUE KEY `Code_32` (`Code`),
  UNIQUE KEY `Code_33` (`Code`),
  UNIQUE KEY `Code_34` (`Code`),
  UNIQUE KEY `Code_35` (`Code`),
  UNIQUE KEY `Code_36` (`Code`),
  UNIQUE KEY `Code_37` (`Code`),
  UNIQUE KEY `Code_38` (`Code`),
  UNIQUE KEY `Code_39` (`Code`),
  UNIQUE KEY `Code_40` (`Code`),
  UNIQUE KEY `Code_41` (`Code`),
  UNIQUE KEY `Code_42` (`Code`),
  UNIQUE KEY `Code_43` (`Code`),
  UNIQUE KEY `Code_44` (`Code`),
  UNIQUE KEY `Code_45` (`Code`),
  UNIQUE KEY `Code_46` (`Code`),
  UNIQUE KEY `Code_47` (`Code`),
  UNIQUE KEY `Code_48` (`Code`),
  UNIQUE KEY `Code_49` (`Code`),
  UNIQUE KEY `Code_50` (`Code`),
  UNIQUE KEY `Code_51` (`Code`),
  UNIQUE KEY `Code_52` (`Code`),
  UNIQUE KEY `Code_53` (`Code`),
  UNIQUE KEY `Code_54` (`Code`),
  KEY `Id_User` (`Id_User`),
  KEY `Id_Discount_Registration` (`Id_Discount_Registration`),
  CONSTRAINT `vouchers_ibfk_105` FOREIGN KEY (`Id_User`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `vouchers_ibfk_106` FOREIGN KEY (`Id_Discount_Registration`) REFERENCES `discount_registrations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vouchers`
--

LOCK TABLES `vouchers` WRITE;
/*!40000 ALTER TABLE `vouchers` DISABLE KEYS */;
/*!40000 ALTER TABLE `vouchers` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-13 13:53:49
