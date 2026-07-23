-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: heritage_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `heritage_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `heritage_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `heritage_db`;

--
-- Table structure for table `chats`
--

DROP TABLE IF EXISTS `chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `post_id` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `is_bug_chart` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `chats_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chats_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chats_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chats`
--

LOCK TABLES `chats` WRITE;
/*!40000 ALTER TABLE `chats` DISABLE KEYS */;
/*!40000 ALTER TABLE `chats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clan_alliances`
--

DROP TABLE IF EXISTS `clan_alliances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clan_alliances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lineage_node_id` int(11) NOT NULL,
  `connected_clan` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `lineage_node_id` (`lineage_node_id`),
  CONSTRAINT `clan_alliances_ibfk_1` FOREIGN KEY (`lineage_node_id`) REFERENCES `lineage_nodes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clan_alliances`
--

LOCK TABLES `clan_alliances` WRITE;
/*!40000 ALTER TABLE `clan_alliances` DISABLE KEYS */;
INSERT INTO `clan_alliances` VALUES (1,1,'Shitile Alliance Line','Bound securely via matriarchal descent marriage alliance ratified in 1942.','2026-06-24 12:48:50'),(2,2,'Ihyarev Kindred Tie','Strategic affinity link established by marriage covenant.','2026-06-24 12:48:50');
/*!40000 ALTER TABLE `clan_alliances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_comments`
--

DROP TABLE IF EXISTS `community_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `community_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `comment_text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `community_comments_ibfk_1` (`post_id`),
  CONSTRAINT `community_comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `community_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_comments`
--

LOCK TABLES `community_comments` WRITE;
/*!40000 ALTER TABLE `community_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `community_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_messages`
--

DROP TABLE IF EXISTS `community_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `community_messages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message_text` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `attachment_url` varchar(255) DEFAULT NULL,
  `attachment_type` enum('text','image','file','video_rehearsal','audio_voice','virtual_call') NOT NULL DEFAULT 'text',
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_chat_participants` (`sender_id`,`receiver_id`),
  KEY `idx_chronological_feed` (`sent_at`),
  KEY `idx_receiver_read` (`receiver_id`,`is_read`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_messages`
--

LOCK TABLES `community_messages` WRITE;
/*!40000 ALTER TABLE `community_messages` DISABLE KEYS */;
INSERT INTO `community_messages` VALUES (1,1,2,'Hello Auditor, I submitted my family lineage artifact proof yesterday. Is the verification pending entry review?',0,NULL,'text','2026-06-24 17:00:00'),(2,2,1,'Greetings! Yes, we have received your archival documents. The council ward validation team is currently auditing the marital links.',0,NULL,'text','2026-06-24 17:15:00'),(3,1,2,'Perfect, thank you for the prompt update!',0,NULL,'text','2026-06-24 17:20:00'),(4,3,1,'Hey there, I saw your post on the Explore feed. I think our grandfather branches might share a connection under the Akpe Kindred matrix!',0,NULL,'text','2026-06-24 18:30:00'),(5,1,3,'Wow, really? Let me check our interactive genealogy tree layout right now to compare the root ancestors!',0,NULL,'text','2026-06-24 18:35:00'),(6,10,2,'hi',0,NULL,'text','2026-07-12 20:54:12'),(7,2,10,'Hello',0,NULL,'text','2026-07-12 20:55:39'),(8,2,10,'',0,'uploads/chat_attachments/f31c360dc9f70c0523cb803e4c3b0e36.png','image','2026-07-12 20:55:58'),(9,10,2,'Hi',0,NULL,'text','2026-07-17 17:14:43'),(10,2,10,'Hello, Good evening',0,NULL,'text','2026-07-17 17:16:16'),(11,10,2,'Good afternoon',0,NULL,'text','2026-07-18 16:40:16'),(12,10,2,'Read this file',0,'uploads/chat_attachments/fedc1d32a208297b7b5f36034ea7def8.docx','file','2026-07-18 17:46:13'),(13,10,2,'Please watch this video',0,'uploads/chat_attachments/a6002eb92912a1673d3f65a6afa4bae0.mp4','video_rehearsal','2026-07-18 17:53:39');
/*!40000 ALTER TABLE `community_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `family_houses`
--

DROP TABLE IF EXISTS `family_houses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `family_houses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kindred_id` int(11) NOT NULL,
  `house_name` varchar(150) NOT NULL,
  `current_elder` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `kindred_id` (`kindred_id`),
  CONSTRAINT `family_houses_ibfk_1` FOREIGN KEY (`kindred_id`) REFERENCES `kindreds` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `family_houses`
--

LOCK TABLES `family_houses` WRITE;
/*!40000 ALTER TABLE `family_houses` DISABLE KEYS */;
INSERT INTO `family_houses` VALUES (1,1,'Tivka Ancestral Line','Elder Terna Tivka','2026-06-24 12:48:49');
/*!40000 ALTER TABLE `family_houses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `heritage_categories`
--

DROP TABLE IF EXISTS `heritage_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `heritage_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `heritage_categories`
--

LOCK TABLES `heritage_categories` WRITE;
/*!40000 ALTER TABLE `heritage_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `heritage_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kindreds`
--

DROP TABLE IF EXISTS `kindreds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kindreds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ward_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `ward_id` (`ward_id`),
  CONSTRAINT `kindreds_ibfk_1` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kindreds`
--

LOCK TABLES `kindreds` WRITE;
/*!40000 ALTER TABLE `kindreds` DISABLE KEYS */;
INSERT INTO `kindreds` VALUES (1,1,'Akpe Kindred Group','2026-06-24 12:48:49');
/*!40000 ALTER TABLE `kindreds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lineage_nodes`
--

DROP TABLE IF EXISTS `lineage_nodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lineage_nodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `house_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `relation_type` enum('founder','child','spouse','descendant') NOT NULL DEFAULT 'descendant',
  `birth_order` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `house_id` (`house_id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `lineage_nodes_ibfk_1` FOREIGN KEY (`house_id`) REFERENCES `family_houses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lineage_nodes_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `lineage_nodes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lineage_nodes`
--

LOCK TABLES `lineage_nodes` WRITE;
/*!40000 ALTER TABLE `lineage_nodes` DISABLE KEYS */;
INSERT INTO `lineage_nodes` VALUES (1,1,NULL,'Patriarch Jonathan Aondona','founder',1,'2026-06-24 12:48:49'),(2,1,1,'Senior Branch Terwase','child',1,'2026-06-24 12:48:49'),(3,1,1,'Junior Branch Terlumun','child',2,'2026-06-24 12:48:49'),(4,1,2,'Aondona Jnr','descendant',1,'2026-06-24 12:48:49'),(5,1,2,'Seember Jonathan','descendant',2,'2026-06-24 12:48:49'),(6,1,3,'Kater Terlumun','descendant',1,'2026-06-24 12:48:49');
/*!40000 ALTER TABLE `lineage_nodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_likes`
--

DROP TABLE IF EXISTS `post_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post_likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_post_like` (`post_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `post_likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `post_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_likes`
--

LOCK TABLES `post_likes` WRITE;
/*!40000 ALTER TABLE `post_likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `post_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_media`
--

DROP TABLE IF EXISTS `post_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post_media` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `media_url` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_post_media_posts` (`post_id`),
  CONSTRAINT `fk_post_media_posts` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_media`
--

LOCK TABLES `post_media` WRITE;
/*!40000 ALTER TABLE `post_media` DISABLE KEYS */;
INSERT INTO `post_media` VALUES (1,2,'uploads/images/media_6a5a3f9deaf635.00149738.jpg','2026-07-17 14:43:41'),(2,2,'uploads/images/media_6a5a3f9df03e40.66202691.jpg','2026-07-17 14:43:41'),(3,2,'uploads/images/media_6a5a3f9df15326.33417448.jpg','2026-07-17 14:43:41'),(4,2,'uploads/images/media_6a5a3f9e1f2a68.78118489.jpg','2026-07-17 14:43:42'),(5,2,'uploads/images/media_6a5a3f9e203b40.71341248.jpg','2026-07-17 14:43:42'),(6,2,'uploads/images/media_6a5a3f9e213756.54599538.jpg','2026-07-17 14:43:42'),(7,2,'uploads/images/media_6a5a3f9e223825.64335520.jpg','2026-07-17 14:43:42'),(8,2,'uploads/images/media_6a5a3f9e2309b7.05962199.jpg','2026-07-17 14:43:42'),(9,3,'uploads/images/media_6a5a4059bdcd61.09358801.jpg','2026-07-17 14:46:49'),(10,3,'uploads/images/media_6a5a4059c23257.61827557.jpg','2026-07-17 14:46:49'),(11,4,'uploads/video/media_6a5a42969e1a02.43076076.mp4','2026-07-17 14:56:22'),(12,5,'uploads/audio/media_6a5bd601097a66.66484673.mp3','2026-07-18 19:37:37'),(13,6,'uploads/images/media_6a5bd7238ca8d7.06939365.jpg','2026-07-18 19:42:27'),(14,6,'uploads/images/media_6a5bd7239239e2.94151609.jpg','2026-07-18 19:42:27'),(15,6,'uploads/images/media_6a5bd72393c547.81104900.jpg','2026-07-18 19:42:27');
/*!40000 ALTER TABLE `post_media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `auditor_id` int(11) DEFAULT NULL,
  `category` enum('article','history','folklore') NOT NULL,
  `title` varchar(255) NOT NULL,
  `abstract` text NOT NULL,
  `content_body` longtext NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `auditor_id` (`auditor_id`),
  FULLTEXT KEY `idx_posts_search_fulltext` (`title`,`abstract`,`content_body`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`auditor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,10,NULL,'article','Our Heritage','This Tiv bride and groom chose to honor their ancestors the old way - in authentic cultural attire.','NO LUXURY. NO GLAMOUR. JUST HERITAGE 🔥 \r\n\r\nNo expensive decorations. No designer drama.  \r\nJust pure, beautiful Tiv tradition.  \r\n\r\nThis Tiv bride and groom chose to honor their ancestors the old way —  \r\nin authentic cultural attire, with traditional hairstyles, and with customs passed down for generations.  \r\n\r\nTheir wedding reminds us:  \r\nTrue beauty is in preserving who we are. \r\n\r\nDo you think more young people should return to traditional weddings like this? 👇  \r\nDrop your thoughts in the comments.  \r\n\r\nLike 👍 Share ❤️ Follow 🙏  \r\n#TivCulture #ProudlyTiv #TraditionalWedding #BenueToTheWorld #AfricanCulture','approved','2026-07-17 14:30:38',NULL),(2,10,NULL,'article','Our Cultural Attire','This Tiv bride and groom chose to honor their ancestors the old way —  \r\nin authentic cultural attire, with traditional hairstyles, and with customs passed down for generations.','NO LUXURY. NO GLAMOUR. JUST HERITAGE 🔥 \r\n\r\nNo expensive decorations. No designer drama.  \r\nJust pure, beautiful Tiv tradition.  \r\n\r\nThis Tiv bride and groom chose to honor their ancestors the old way —  \r\nin authentic cultural attire, with traditional hairstyles, and with customs passed down for generations.  \r\n\r\nTheir wedding reminds us:  \r\nTrue beauty is in preserving who we are. \r\n\r\nDo you think more young people should return to traditional weddings like this? 👇  \r\nDrop your thoughts in the comments.  \r\n\r\nLike 👍 Share ❤️ Follow 🙏  \r\n#TivCulture #ProudlyTiv #TraditionalWedding #BenueToTheWorld #AfricanCulture','approved','2026-07-17 14:43:41',NULL),(3,10,NULL,'article','Cooking Habbit','Cooking is a lifestyle for my family','I\'m cooking food from my family come let\'s cook together learn how to cook very well if you love it.','approved','2026-07-17 14:46:49',NULL),(4,10,NULL,'article','My Priority','My priority is to protect my people','Governor Hyacinth Alia has said his priority is to keep Benue and Secure her land for the people to farm unhindered, not just for the sake of feeding the nation, but to equally boost the economy of the state and country.','approved','2026-07-17 14:56:21',NULL),(5,10,NULL,'article','My favorite song','Keep in touch','Why you should love this song','pending','2026-07-18 19:37:34',NULL),(6,2,NULL,'article','Me in my Cultural Attire','Our cultural attire speak more than gold','Looking good in it is a great','pending','2026-07-18 19:42:27',NULL);
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `research_articles`
--

DROP TABLE IF EXISTS `research_articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `research_articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `abstract` text NOT NULL,
  `full_content` longtext NOT NULL,
  `author_id` int(11) NOT NULL,
  `citation_guide` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `category_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `author_id` (`author_id`),
  KEY `fk_heritage_category` (`category_id`),
  CONSTRAINT `fk_heritage_category` FOREIGN KEY (`category_id`) REFERENCES `heritage_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `research_articles_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `research_articles`
--

LOCK TABLES `research_articles` WRITE;
/*!40000 ALTER TABLE `research_articles` DISABLE KEYS */;
INSERT INTO `research_articles` VALUES (101,'The Ancestral Migration and Genesis of the Tiv People','ancestral-migration-genesis-tiv','An extensive socio-historical investigation tracing the physical migration paths of the Tiv people from the Swem mountain ranges down into the Benue Valley trough, detailing interactions with neighboring groups and subsequent land occupation mappings.','<h2>1. The Swem Paradigm</h2>\n\nOral historical traditions identify <b>Swem</b>—a mountainous, highly elevated geographical formation situated near the southwestern border tract of modern Cameroon and Nigeria—as the primary cradle of the Tiv corporate existence. At Swem, the progenitor, Tiv, established a unified kindred framework before population pressures and environmental variables prompted an outward expansion.\n\n<h2>2. Descent into the Benue Basin</h2>\n\nThe migration down from the peaks occurred in tactical successions. The descent was structural, moving along major river channels. Upon reaching the expansive floodplains of the River Benue, the emerging clans encountered several autochthonous communities. \n\nThrough a combination of strategic assimilation and robust territorial security, the Tiv secured fertile agricultural plains, positioning farming as the central pillar of their economic identity. By organizing around the concept of <i>Tar</i> (the physical space connected to ancestral lineage), land allocation remained bound to familial lineage, preventing individual sale and preserving collective ancestral heritage.',10,'Aondona, T. (2026). The Ancestral Migration and Genesis of the Tiv People. Benue Corpus of Cultural Anthropological Monographs, 14(2), 45-68.','2026-06-25 18:39:17',NULL),(102,'The Tor Tiv Institution: Evolution of Centralized Authority','tor-tiv-institution-evolution-authority','This paper examines the transition of Tiv governance from a decentralized, egalitarian segmentary lineage system to a centralized constitutional monarchy, catalyzed by colonial administrative models in 1946.','<h2>1. Traditional Segmentary Egalitarianism</h2>\n\nPrior to 1946, the Tiv political architecture operated without a centralized monarchical head. Governance was highly democratic, balanced across the segmentary lineages (<i>Ipaven</i>). Authority was fluid, vested in the <i>Orya</i> (Compound Head) at the micro-level, and collectively managed by the <i>Ityo</i> (Lineage Council of Elders) at the macro-historical level. \n\nDecision-making relied entirely on consensus. This structural balance prevented tyrannical overreach and ensured absolute accountability.\n\n<h2>2. The 1946 Structural Shift</h2>\n\nRecognizing that a decentralized layout resisted indirect rule strategies, the British colonial administration, alongside internal discussions among Tiv elders and soldiers returning from World War II, facilitated the creation of a centralized stool. \n\nIn 1946, <b>Makere Dzakpe</b> was selected and crowned as the first <b>Tor Tiv</b>, establishing Gboko as the administrative capital and seat of the royal palace. This created a dual system where traditional lineage leadership adapted to interface with modern state governance frameworks.',10,'Aondona, T. (2026). The Tor Tiv Institution: Evolution of Centralized Authority. West African Journal of Political Systems, 31(1), 112-135.','2026-06-25 18:39:17',NULL);
/*!40000 ALTER TABLE `research_articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `research_assets`
--

DROP TABLE IF EXISTS `research_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `research_assets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL,
  `asset_title` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` enum('pdf_document','word_document','audio_recording','video_footage') NOT NULL,
  `file_size_mb` decimal(5,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `article_id` (`article_id`),
  CONSTRAINT `research_assets_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `research_articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=504 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `research_assets`
--

LOCK TABLES `research_assets` WRITE;
/*!40000 ALTER TABLE `research_assets` DISABLE KEYS */;
INSERT INTO `research_assets` VALUES (501,101,'Comprehensive Migration Route Map (High-Res PDF Document)','uploads/research_vault/tiv_migration_atlas_2026.pdf','pdf_document',4.25),(502,101,'Oral Testimony Recording: Elder Discourse on Swem Mountain','uploads/research_vault/oral_history_swem_elder_golozo.mp3','audio_recording',12.80),(503,102,'Full Text Version: The 1946 Royal Coronation Accord Documents','uploads/research_vault/tor_tiv_1946_charter.docx','word_document',1.15);
/*!40000 ALTER TABLE `research_assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tiv_audio_corpus`
--

DROP TABLE IF EXISTS `tiv_audio_corpus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tiv_audio_corpus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dictionary_id` int(11) DEFAULT NULL,
  `audio_url` varchar(255) NOT NULL,
  `speaker_gender` enum('male','female') DEFAULT NULL,
  `duration_seconds` decimal(5,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `dictionary_id` (`dictionary_id`),
  CONSTRAINT `tiv_audio_corpus_ibfk_1` FOREIGN KEY (`dictionary_id`) REFERENCES `tiv_dictionary` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tiv_audio_corpus`
--

LOCK TABLES `tiv_audio_corpus` WRITE;
/*!40000 ALTER TABLE `tiv_audio_corpus` DISABLE KEYS */;
/*!40000 ALTER TABLE `tiv_audio_corpus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tiv_dictionary`
--

DROP TABLE IF EXISTS `tiv_dictionary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tiv_dictionary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `word` varchar(150) NOT NULL,
  `cleaned_word` varchar(150) NOT NULL,
  `part_of_speech` enum('noun','verb','pronoun','adjective','adverb','preposition','conjunction','interjection','ideophone') NOT NULL,
  `tone_pattern` varchar(50) DEFAULT NULL,
  `english_definition` text NOT NULL,
  `cultural_notes` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `admin_announcement` text DEFAULT NULL,
  `announcement_updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `word` (`word`),
  KEY `idx_search_lemma` (`cleaned_word`),
  KEY `idx_lexical_group` (`part_of_speech`),
  FULLTEXT KEY `idx_dict_search_fulltext` (`word`,`english_definition`,`cultural_notes`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tiv_dictionary`
--

LOCK TABLES `tiv_dictionary` WRITE;
/*!40000 ALTER TABLE `tiv_dictionary` DISABLE KEYS */;
/*!40000 ALTER TABLE `tiv_dictionary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tiv_sentences`
--

DROP TABLE IF EXISTS `tiv_sentences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tiv_sentences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dictionary_id` int(11) NOT NULL,
  `tiv_sentence` text NOT NULL,
  `english_translation` text NOT NULL,
  `tone_transcription` text DEFAULT NULL,
  `audio_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `dictionary_id` (`dictionary_id`),
  CONSTRAINT `tiv_sentences_ibfk_1` FOREIGN KEY (`dictionary_id`) REFERENCES `tiv_dictionary` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tiv_sentences`
--

LOCK TABLES `tiv_sentences` WRITE;
/*!40000 ALTER TABLE `tiv_sentences` DISABLE KEYS */;
/*!40000 ALTER TABLE `tiv_sentences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notifications`
--

DROP TABLE IF EXISTS `user_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `type` enum('like','comment','chat','lineage_update') NOT NULL,
  `source_id` int(11) NOT NULL,
  `message_preview` varchar(255) NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_recipient_unread` (`recipient_id`,`is_read`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `user_notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_notifications_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notifications`
--

LOCK TABLES `user_notifications` WRITE;
/*!40000 ALTER TABLE `user_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `surname` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `tribe` varchar(50) NOT NULL,
  `affiliation_status` enum('Indigene','Diaspora Member','Traditional Elder / Head of House','Cultural Archivist') DEFAULT 'Indigene',
  `tribe_specified` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','admin','super_admin') DEFAULT 'user',
  `profile_pic` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `tiv_division` enum('Jechira','Jemgbagh','Minda','Sankera','Kwande','Non-Tiv Affiliated') DEFAULT 'Non-Tiv Affiliated',
  `clan_ipaven` varchar(100) DEFAULT NULL,
  `kindred_ityo` varchar(100) DEFAULT NULL,
  `compound_ingo` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Aondona','Terwase','terwaseaondonaj@gmail.com','07072770595','09114895585','Tiv','Indigene','','$2y$10$G3aCTJW.0liSxRJI/4pjrOP/3p88Sdtpp1ZoxFW3xk5z16oN/RaR6','user','public/uploads/profiles/avatar_2_1784277673.jpg','2026-06-23 14:21:20','Jechira','Kunav','Mbadede','Mbawua'),(5,'Tiv','Heritage','tivheritage@gmail.com','09114895585','08114895595','Tiv','Indigene',NULL,'superAdmin@2004','super_admin',NULL,'2026-07-17 08:28:49','Jechira','Mbadede','Mbawua','Mbakima'),(10,'Terwase','Aondona','terwaseaondona2006@gmail.com','08085681276',NULL,'Tiv','Indigene',NULL,'$2y$10$tcu1Wwz55Ik1EUFlBtelfeSla2tdnNXh42EwQykWHGjfCEea22uNi','admin',NULL,'2026-06-25 18:39:14','Non-Tiv Affiliated',NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wards`
--

DROP TABLE IF EXISTS `wards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wards`
--

LOCK TABLES `wards` WRITE;
/*!40000 ALTER TABLE `wards` DISABLE KEYS */;
INSERT INTO `wards` VALUES (1,'Mbatiav Council Ward','2026-06-24 12:48:48');
/*!40000 ALTER TABLE `wards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'heritage_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-18 12:44:30
