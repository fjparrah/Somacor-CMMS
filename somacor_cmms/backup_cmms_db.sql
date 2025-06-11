-- MySQL dump 10.13  Distrib 9.3.0, for Win64 (x86_64)
--
-- Host: localhost    Database: cmms_db
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actividadesordentrabajo`
--

DROP TABLE IF EXISTS `actividadesordentrabajo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividadesordentrabajo` (
  `IDActividadOT` int NOT NULL AUTO_INCREMENT,
  `Secuencia` int DEFAULT NULL,
  `DescripcionActividad` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `FechaInicioActividad` datetime(6) DEFAULT NULL,
  `FechaFinActividad` datetime(6) DEFAULT NULL,
  `TiempoEstimadoMinutos` int DEFAULT NULL,
  `TiempoRealMinutos` int DEFAULT NULL,
  `ObservacionesActividad` longtext COLLATE utf8mb4_unicode_ci,
  `Completada` tinyint(1) NOT NULL,
  `ResultadoInspeccion` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MedicionValor` decimal(10,2) DEFAULT NULL,
  `UnidadMedicion` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IDOrdenTrabajo` int NOT NULL,
  `IDTareaEstandar` int DEFAULT NULL,
  `IDTecnicoEjecutor` int DEFAULT NULL,
  PRIMARY KEY (`IDActividadOT`),
  KEY `actividadesordentrab_IDTecnicoEjecutor_4cdb2b0a_fk_usuarios_` (`IDTecnicoEjecutor`),
  KEY `actividadesordentrab_IDOrdenTrabajo_cf66dc87_fk_ordenestr` (`IDOrdenTrabajo`),
  KEY `actividadesordentrab_IDTareaEstandar_38230da1_fk_tareasest` (`IDTareaEstandar`),
  CONSTRAINT `actividadesordentrab_IDOrdenTrabajo_cf66dc87_fk_ordenestr` FOREIGN KEY (`IDOrdenTrabajo`) REFERENCES `ordenestrabajo` (`IDOrdenTrabajo`),
  CONSTRAINT `actividadesordentrab_IDTareaEstandar_38230da1_fk_tareasest` FOREIGN KEY (`IDTareaEstandar`) REFERENCES `tareasestandar` (`IDTareaEstandar`),
  CONSTRAINT `actividadesordentrab_IDTecnicoEjecutor_4cdb2b0a_fk_usuarios_` FOREIGN KEY (`IDTecnicoEjecutor`) REFERENCES `usuarios` (`IDUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividadesordentrabajo`
--

LOCK TABLES `actividadesordentrabajo` WRITE;
/*!40000 ALTER TABLE `actividadesordentrabajo` DISABLE KEYS */;
/*!40000 ALTER TABLE `actividadesordentrabajo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agendas`
--

DROP TABLE IF EXISTS `agendas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agendas` (
  `IDAgenda` int NOT NULL AUTO_INCREMENT,
  `TituloEvento` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FechaHoraInicio` datetime(6) NOT NULL,
  `FechaHoraFin` datetime(6) NOT NULL,
  `DescripcionEvento` longtext COLLATE utf8mb4_unicode_ci,
  `TipoEvento` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ColorEvento` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `EsDiaCompleto` tinyint(1) NOT NULL,
  `Recursivo` tinyint(1) NOT NULL,
  `ReglaRecursividad` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `FechaCreacionEvento` datetime(6) NOT NULL,
  `IDEquipo` int DEFAULT NULL,
  `IDOrdenTrabajo` int DEFAULT NULL,
  `IDPlanMantenimiento` int DEFAULT NULL,
  `IDUsuarioAsignado` int DEFAULT NULL,
  `IDUsuarioCreador` int DEFAULT NULL,
  PRIMARY KEY (`IDAgenda`),
  KEY `agendas_IDEquipo_c0ddd18c_fk_equipos_IDEquipo` (`IDEquipo`),
  KEY `agendas_IDOrdenTrabajo_4266023c_fk_ordenestrabajo_IDOrdenTrabajo` (`IDOrdenTrabajo`),
  KEY `agendas_IDPlanMantenimiento_59461b6b_fk_planesman` (`IDPlanMantenimiento`),
  KEY `agendas_IDUsuarioAsignado_b6d4e071_fk_usuarios_IDUsuario` (`IDUsuarioAsignado`),
  KEY `agendas_IDUsuarioCreador_43ca6469_fk_usuarios_IDUsuario` (`IDUsuarioCreador`),
  CONSTRAINT `agendas_IDEquipo_c0ddd18c_fk_equipos_IDEquipo` FOREIGN KEY (`IDEquipo`) REFERENCES `equipos` (`IDEquipo`),
  CONSTRAINT `agendas_IDOrdenTrabajo_4266023c_fk_ordenestrabajo_IDOrdenTrabajo` FOREIGN KEY (`IDOrdenTrabajo`) REFERENCES `ordenestrabajo` (`IDOrdenTrabajo`),
  CONSTRAINT `agendas_IDPlanMantenimiento_59461b6b_fk_planesman` FOREIGN KEY (`IDPlanMantenimiento`) REFERENCES `planesmantenimiento` (`IDPlanMantenimiento`),
  CONSTRAINT `agendas_IDUsuarioAsignado_b6d4e071_fk_usuarios_IDUsuario` FOREIGN KEY (`IDUsuarioAsignado`) REFERENCES `usuarios` (`IDUsuario`),
  CONSTRAINT `agendas_IDUsuarioCreador_43ca6469_fk_usuarios_IDUsuario` FOREIGN KEY (`IDUsuarioCreador`) REFERENCES `usuarios` (`IDUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agendas`
--

LOCK TABLES `agendas` WRITE;
/*!40000 ALTER TABLE `agendas` DISABLE KEYS */;
/*!40000 ALTER TABLE `agendas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add Token',7,'add_token'),(26,'Can change Token',7,'change_token'),(27,'Can delete Token',7,'delete_token'),(28,'Can view Token',7,'view_token'),(29,'Can add Token',8,'add_tokenproxy'),(30,'Can change Token',8,'change_tokenproxy'),(31,'Can delete Token',8,'delete_tokenproxy'),(32,'Can view Token',8,'view_tokenproxy'),(33,'Can add detalles plan mantenimiento',9,'add_detallesplanmantenimiento'),(34,'Can change detalles plan mantenimiento',9,'change_detallesplanmantenimiento'),(35,'Can delete detalles plan mantenimiento',9,'delete_detallesplanmantenimiento'),(36,'Can view detalles plan mantenimiento',9,'view_detallesplanmantenimiento'),(37,'Can add especialidades',10,'add_especialidades'),(38,'Can change especialidades',10,'change_especialidades'),(39,'Can delete especialidades',10,'delete_especialidades'),(40,'Can view especialidades',10,'view_especialidades'),(41,'Can add estados equipo',11,'add_estadosequipo'),(42,'Can change estados equipo',11,'change_estadosequipo'),(43,'Can delete estados equipo',11,'delete_estadosequipo'),(44,'Can view estados equipo',11,'view_estadosequipo'),(45,'Can add estados orden trabajo',12,'add_estadosordentrabajo'),(46,'Can change estados orden trabajo',12,'change_estadosordentrabajo'),(47,'Can delete estados orden trabajo',12,'delete_estadosordentrabajo'),(48,'Can view estados orden trabajo',12,'view_estadosordentrabajo'),(49,'Can add faenas',13,'add_faenas'),(50,'Can change faenas',13,'change_faenas'),(51,'Can delete faenas',13,'delete_faenas'),(52,'Can view faenas',13,'view_faenas'),(53,'Can add repuestos',14,'add_repuestos'),(54,'Can change repuestos',14,'change_repuestos'),(55,'Can delete repuestos',14,'delete_repuestos'),(56,'Can view repuestos',14,'view_repuestos'),(57,'Can add roles',15,'add_roles'),(58,'Can change roles',15,'change_roles'),(59,'Can delete roles',15,'delete_roles'),(60,'Can view roles',15,'view_roles'),(61,'Can add tipos equipo',16,'add_tiposequipo'),(62,'Can change tipos equipo',16,'change_tiposequipo'),(63,'Can delete tipos equipo',16,'delete_tiposequipo'),(64,'Can view tipos equipo',16,'view_tiposequipo'),(65,'Can add tipos mantenimiento ot',17,'add_tiposmantenimientoot'),(66,'Can change tipos mantenimiento ot',17,'change_tiposmantenimientoot'),(67,'Can delete tipos mantenimiento ot',17,'delete_tiposmantenimientoot'),(68,'Can view tipos mantenimiento ot',17,'view_tiposmantenimientoot'),(69,'Can add tipos tarea',18,'add_tipostarea'),(70,'Can change tipos tarea',18,'change_tipostarea'),(71,'Can delete tipos tarea',18,'delete_tipostarea'),(72,'Can view tipos tarea',18,'view_tipostarea'),(73,'Can add equipos',19,'add_equipos'),(74,'Can change equipos',19,'change_equipos'),(75,'Can delete equipos',19,'delete_equipos'),(76,'Can view equipos',19,'view_equipos'),(77,'Can add planes mantenimiento',20,'add_planesmantenimiento'),(78,'Can change planes mantenimiento',20,'change_planesmantenimiento'),(79,'Can delete planes mantenimiento',20,'delete_planesmantenimiento'),(80,'Can view planes mantenimiento',20,'view_planesmantenimiento'),(81,'Can add ordenes trabajo',21,'add_ordenestrabajo'),(82,'Can change ordenes trabajo',21,'change_ordenestrabajo'),(83,'Can delete ordenes trabajo',21,'delete_ordenestrabajo'),(84,'Can view ordenes trabajo',21,'view_ordenestrabajo'),(85,'Can add tareas estandar',22,'add_tareasestandar'),(86,'Can change tareas estandar',22,'change_tareasestandar'),(87,'Can delete tareas estandar',22,'delete_tareasestandar'),(88,'Can view tareas estandar',22,'view_tareasestandar'),(89,'Can add actividades orden trabajo',23,'add_actividadesordentrabajo'),(90,'Can change actividades orden trabajo',23,'change_actividadesordentrabajo'),(91,'Can delete actividades orden trabajo',23,'delete_actividadesordentrabajo'),(92,'Can view actividades orden trabajo',23,'view_actividadesordentrabajo'),(93,'Can add usuarios',24,'add_usuarios'),(94,'Can change usuarios',24,'change_usuarios'),(95,'Can delete usuarios',24,'delete_usuarios'),(96,'Can view usuarios',24,'view_usuarios'),(97,'Can add uso repuestos actividad ot',25,'add_usorepuestosactividadot'),(98,'Can change uso repuestos actividad ot',25,'change_usorepuestosactividadot'),(99,'Can delete uso repuestos actividad ot',25,'delete_usorepuestosactividadot'),(100,'Can view uso repuestos actividad ot',25,'view_usorepuestosactividadot'),(101,'Can add notificaciones',26,'add_notificaciones'),(102,'Can change notificaciones',26,'change_notificaciones'),(103,'Can delete notificaciones',26,'delete_notificaciones'),(104,'Can view notificaciones',26,'view_notificaciones'),(105,'Can add historial horometros',27,'add_historialhorometros'),(106,'Can change historial horometros',27,'change_historialhorometros'),(107,'Can delete historial horometros',27,'delete_historialhorometros'),(108,'Can view historial horometros',27,'view_historialhorometros'),(109,'Can add historial estados equipo',28,'add_historialestadosequipo'),(110,'Can change historial estados equipo',28,'change_historialestadosequipo'),(111,'Can delete historial estados equipo',28,'delete_historialestadosequipo'),(112,'Can view historial estados equipo',28,'view_historialestadosequipo'),(113,'Can add documentos adjuntos',29,'add_documentosadjuntos'),(114,'Can change documentos adjuntos',29,'change_documentosadjuntos'),(115,'Can delete documentos adjuntos',29,'delete_documentosadjuntos'),(116,'Can view documentos adjuntos',29,'view_documentosadjuntos'),(117,'Can add agendas',30,'add_agendas'),(118,'Can change agendas',30,'change_agendas'),(119,'Can delete agendas',30,'delete_agendas'),(120,'Can view agendas',30,'view_agendas');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (1,'pbkdf2_sha256$1000000$iMm85By9xo6l5TBxCob5Xg$x26FFDJ3T78g5wuHZTLz+8g4K6ZdQL4txocy48hJyRA=','2025-06-11 02:38:52.287846',1,'admin','','','',1,1,'2025-06-11 02:37:56.040074'),(2,'pbkdf2_sha256$1000000$np4MIC5dg1R10GpfDx7HWW$OEbZ06LRImfPCflT/7z2B9sIGgTWSldyXYPfTnhanrE=',NULL,0,'tecnico','Venko 123','','venko@12.com',0,1,'2025-06-11 02:46:35.810613'),(3,'pbkdf2_sha256$1000000$FBG4hU9Wgik7ppilFVukuS$2dbC2wCURNqyQsUdT7RnZmQP+ZaQVkY9qQQzWoTDF/4=',NULL,0,'supervisor','pelado','','asdad@12313.com',0,1,'2025-06-11 02:48:17.929858');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authtoken_token`
--

DROP TABLE IF EXISTS `authtoken_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authtoken_token` (
  `key` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`key`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `authtoken_token_user_id_35299eff_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authtoken_token`
--

LOCK TABLES `authtoken_token` WRITE;
/*!40000 ALTER TABLE `authtoken_token` DISABLE KEYS */;
INSERT INTO `authtoken_token` VALUES ('0937ed00a8f96443b13e54173db5e28dfe515fd3','2025-06-11 02:46:50.227922',2),('8b0153c46ecb9da64bf49542b7c1f36577103ef0','2025-06-11 02:40:33.293486',1);
/*!40000 ALTER TABLE `authtoken_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detallesplanmantenimiento`
--

DROP TABLE IF EXISTS `detallesplanmantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detallesplanmantenimiento` (
  `IDDetallePlan` int NOT NULL AUTO_INCREMENT,
  `PuntoMantenimiento` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IntervaloHorasOperacion` int DEFAULT NULL,
  `IntervaloDiasCalendario` int DEFAULT NULL,
  `TipoIntervaloPredominante` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ToleranciaHoras` int DEFAULT NULL,
  `ToleranciaDias` int DEFAULT NULL,
  `ProximoServicioHorometro` int DEFAULT NULL,
  `ProximoServicioFecha` date DEFAULT NULL,
  `UltimoServicioHorometro` int DEFAULT NULL,
  `UltimoServicioFecha` date DEFAULT NULL,
  `ActivoEnPlan` tinyint(1) NOT NULL,
  `IDPlanMantenimiento` int NOT NULL,
  `IDTareaEstandar` int NOT NULL,
  PRIMARY KEY (`IDDetallePlan`),
  UNIQUE KEY `detallesplanmantenimient_IDPlanMantenimiento_IDTa_b77b45b1_uniq` (`IDPlanMantenimiento`,`IDTareaEstandar`,`IntervaloHorasOperacion`,`IntervaloDiasCalendario`),
  KEY `detallesplanmantenim_IDTareaEstandar_f447514e_fk_tareasest` (`IDTareaEstandar`),
  CONSTRAINT `detallesplanmantenim_IDPlanMantenimiento_ed58eeb8_fk_planesman` FOREIGN KEY (`IDPlanMantenimiento`) REFERENCES `planesmantenimiento` (`IDPlanMantenimiento`),
  CONSTRAINT `detallesplanmantenim_IDTareaEstandar_f447514e_fk_tareasest` FOREIGN KEY (`IDTareaEstandar`) REFERENCES `tareasestandar` (`IDTareaEstandar`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detallesplanmantenimiento`
--

LOCK TABLES `detallesplanmantenimiento` WRITE;
/*!40000 ALTER TABLE `detallesplanmantenimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `detallesplanmantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext COLLATE utf8mb4_unicode_ci,
  `object_repr` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(7,'authtoken','token'),(8,'authtoken','tokenproxy'),(23,'cmms_api','actividadesordentrabajo'),(30,'cmms_api','agendas'),(9,'cmms_api','detallesplanmantenimiento'),(29,'cmms_api','documentosadjuntos'),(19,'cmms_api','equipos'),(10,'cmms_api','especialidades'),(11,'cmms_api','estadosequipo'),(12,'cmms_api','estadosordentrabajo'),(13,'cmms_api','faenas'),(28,'cmms_api','historialestadosequipo'),(27,'cmms_api','historialhorometros'),(26,'cmms_api','notificaciones'),(21,'cmms_api','ordenestrabajo'),(20,'cmms_api','planesmantenimiento'),(14,'cmms_api','repuestos'),(15,'cmms_api','roles'),(22,'cmms_api','tareasestandar'),(16,'cmms_api','tiposequipo'),(17,'cmms_api','tiposmantenimientoot'),(18,'cmms_api','tipostarea'),(25,'cmms_api','usorepuestosactividadot'),(24,'cmms_api','usuarios'),(5,'contenttypes','contenttype'),(6,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-06-11 02:35:50.127721'),(2,'auth','0001_initial','2025-06-11 02:35:50.774092'),(3,'admin','0001_initial','2025-06-11 02:35:50.869196'),(4,'admin','0002_logentry_remove_auto_add','2025-06-11 02:35:50.872858'),(5,'admin','0003_logentry_add_action_flag_choices','2025-06-11 02:35:50.877686'),(6,'contenttypes','0002_remove_content_type_name','2025-06-11 02:35:50.944581'),(7,'auth','0002_alter_permission_name_max_length','2025-06-11 02:35:50.974407'),(8,'auth','0003_alter_user_email_max_length','2025-06-11 02:35:50.990447'),(9,'auth','0004_alter_user_username_opts','2025-06-11 02:35:50.994616'),(10,'auth','0005_alter_user_last_login_null','2025-06-11 02:35:51.026073'),(11,'auth','0006_require_contenttypes_0002','2025-06-11 02:35:51.028134'),(12,'auth','0007_alter_validators_add_error_messages','2025-06-11 02:35:51.031673'),(13,'auth','0008_alter_user_username_max_length','2025-06-11 02:35:51.068069'),(14,'auth','0009_alter_user_last_name_max_length','2025-06-11 02:35:51.102368'),(15,'auth','0010_alter_group_name_max_length','2025-06-11 02:35:51.113711'),(16,'auth','0011_update_proxy_permissions','2025-06-11 02:35:51.118197'),(17,'auth','0012_alter_user_first_name_max_length','2025-06-11 02:35:51.151938'),(18,'authtoken','0001_initial','2025-06-11 02:35:51.200203'),(19,'authtoken','0002_auto_20160226_1747','2025-06-11 02:35:51.210244'),(20,'authtoken','0003_tokenproxy','2025-06-11 02:35:51.211748'),(21,'authtoken','0004_alter_tokenproxy_options','2025-06-11 02:35:51.214256'),(22,'cmms_api','0001_initial','2025-06-11 02:35:53.118946'),(23,'sessions','0001_initial','2025-06-11 02:35:53.142357');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('21hne12ylhsbxf0r0uatawgmio7k6470','.eJxVjEEOwiAQRe_C2pARhgIu3fcMZIBBqoYmpV0Z765NutDtf-_9lwi0rTVsnZcwZXERZ3H63SKlB7cd5Du12yzT3NZlinJX5EG7HOfMz-vh_h1U6vVbq8EjmULKFy7GUMICpsScPAKjHdBmV1xirdlE5xU4DeghOwsMqLV4fwDwRzeG:1uPBMa:C1ADXMj8U0WmH7YL4nbbYYNVlY6Vt0xCCWVJCHzWGC4','2025-06-25 02:38:52.290012');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentosadjuntos`
--

DROP TABLE IF EXISTS `documentosadjuntos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentosadjuntos` (
  `IDDocumento` int NOT NULL AUTO_INCREMENT,
  `NombreArchivoOriginal` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PathArchivoServidor` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TipoMIME` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TamanoBytes` bigint DEFAULT NULL,
  `DescripcionAdjunto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `FechaSubida` datetime(6) NOT NULL,
  `EntidadAsociada` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `IDEntidadAsociada` int NOT NULL,
  `IDUsuarioSube` int DEFAULT NULL,
  PRIMARY KEY (`IDDocumento`),
  KEY `documentosadjuntos_IDUsuarioSube_5a2c11ef_fk_usuarios_IDUsuario` (`IDUsuarioSube`),
  CONSTRAINT `documentosadjuntos_IDUsuarioSube_5a2c11ef_fk_usuarios_IDUsuario` FOREIGN KEY (`IDUsuarioSube`) REFERENCES `usuarios` (`IDUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentosadjuntos`
--

LOCK TABLES `documentosadjuntos` WRITE;
/*!40000 ALTER TABLE `documentosadjuntos` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentosadjuntos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipos`
--

DROP TABLE IF EXISTS `equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipos` (
  `IDEquipo` int NOT NULL AUTO_INCREMENT,
  `CodigoInterno` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NombreEquipo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Marca` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Modelo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `AnioFabricacion` int DEFAULT NULL,
  `FechaAdquisicion` date DEFAULT NULL,
  `HorometroActual` int NOT NULL,
  `FechaUltActualizacionHorometro` datetime(6) DEFAULT NULL,
  `ImagenURL` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Observaciones` longtext COLLATE utf8mb4_unicode_ci,
  `Activo` tinyint(1) NOT NULL,
  `IDEstadoActual` int NOT NULL,
  `IDFaenaActual` int DEFAULT NULL,
  `IDTipoEquipo` int NOT NULL,
  `IDOperarioAsignadoPredeterminado` int DEFAULT NULL,
  PRIMARY KEY (`IDEquipo`),
  UNIQUE KEY `CodigoInterno` (`CodigoInterno`),
  KEY `equipos_IDOperarioAsignadoPr_c6ff2f97_fk_usuarios_` (`IDOperarioAsignadoPredeterminado`),
  KEY `equipos_IDEstadoActual_433eaa53_fk_estadosequipo_IDEstadoEquipo` (`IDEstadoActual`),
  KEY `equipos_IDFaenaActual_d8534a0c_fk_faenas_IDFaena` (`IDFaenaActual`),
  KEY `equipos_IDTipoEquipo_c4600aaf_fk_tiposequipo_IDTipoEquipo` (`IDTipoEquipo`),
  CONSTRAINT `equipos_IDEstadoActual_433eaa53_fk_estadosequipo_IDEstadoEquipo` FOREIGN KEY (`IDEstadoActual`) REFERENCES `estadosequipo` (`IDEstadoEquipo`),
  CONSTRAINT `equipos_IDFaenaActual_d8534a0c_fk_faenas_IDFaena` FOREIGN KEY (`IDFaenaActual`) REFERENCES `faenas` (`IDFaena`),
  CONSTRAINT `equipos_IDOperarioAsignadoPr_c6ff2f97_fk_usuarios_` FOREIGN KEY (`IDOperarioAsignadoPredeterminado`) REFERENCES `usuarios` (`IDUsuario`),
  CONSTRAINT `equipos_IDTipoEquipo_c4600aaf_fk_tiposequipo_IDTipoEquipo` FOREIGN KEY (`IDTipoEquipo`) REFERENCES `tiposequipo` (`IDTipoEquipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipos`
--

LOCK TABLES `equipos` WRITE;
/*!40000 ALTER TABLE `equipos` DISABLE KEYS */;
/*!40000 ALTER TABLE `equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especialidades`
--

DROP TABLE IF EXISTS `especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidades` (
  `IDEspecialidad` int NOT NULL AUTO_INCREMENT,
  `NombreEspecialidad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`IDEspecialidad`),
  UNIQUE KEY `NombreEspecialidad` (`NombreEspecialidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidades`
--

LOCK TABLES `especialidades` WRITE;
/*!40000 ALTER TABLE `especialidades` DISABLE KEYS */;
/*!40000 ALTER TABLE `especialidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estadosequipo`
--

DROP TABLE IF EXISTS `estadosequipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estadosequipo` (
  `IDEstadoEquipo` int NOT NULL AUTO_INCREMENT,
  `NombreEstado` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ColorIndicador` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`IDEstadoEquipo`),
  UNIQUE KEY `NombreEstado` (`NombreEstado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estadosequipo`
--

LOCK TABLES `estadosequipo` WRITE;
/*!40000 ALTER TABLE `estadosequipo` DISABLE KEYS */;
/*!40000 ALTER TABLE `estadosequipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estadosordentrabajo`
--

DROP TABLE IF EXISTS `estadosordentrabajo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estadosordentrabajo` (
  `IDEstadoOT` int NOT NULL AUTO_INCREMENT,
  `NombreEstadoOT` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`IDEstadoOT`),
  UNIQUE KEY `NombreEstadoOT` (`NombreEstadoOT`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estadosordentrabajo`
--

LOCK TABLES `estadosordentrabajo` WRITE;
/*!40000 ALTER TABLE `estadosordentrabajo` DISABLE KEYS */;
/*!40000 ALTER TABLE `estadosordentrabajo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faenas`
--

DROP TABLE IF EXISTS `faenas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faenas` (
  `IDFaena` int NOT NULL AUTO_INCREMENT,
  `NombreFaena` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ubicacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Contacto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Activa` tinyint(1) NOT NULL,
  PRIMARY KEY (`IDFaena`),
  UNIQUE KEY `NombreFaena` (`NombreFaena`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faenas`
--

LOCK TABLES `faenas` WRITE;
/*!40000 ALTER TABLE `faenas` DISABLE KEYS */;
/*!40000 ALTER TABLE `faenas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historialestadosequipo`
--

DROP TABLE IF EXISTS `historialestadosequipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historialestadosequipo` (
  `IDHistorialEstado` int NOT NULL AUTO_INCREMENT,
  `FechaCambioEstado` datetime(6) NOT NULL,
  `MotivoCambio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IDEquipo` int NOT NULL,
  `IDEstadoEquipoAnterior` int DEFAULT NULL,
  `IDEstadoEquipoNuevo` int NOT NULL,
  `IDOrdenTrabajoRelacionada` int DEFAULT NULL,
  `IDUsuarioResponsable` int DEFAULT NULL,
  PRIMARY KEY (`IDHistorialEstado`),
  KEY `historialestadosequipo_IDEquipo_eb8958af_fk_equipos_IDEquipo` (`IDEquipo`),
  KEY `historialestadosequi_IDEstadoEquipoAnteri_0c5b66a6_fk_estadoseq` (`IDEstadoEquipoAnterior`),
  KEY `historialestadosequi_IDEstadoEquipoNuevo_ca108f2e_fk_estadoseq` (`IDEstadoEquipoNuevo`),
  KEY `historialestadosequi_IDOrdenTrabajoRelaci_7cc2c719_fk_ordenestr` (`IDOrdenTrabajoRelacionada`),
  KEY `historialestadosequi_IDUsuarioResponsable_e39a8164_fk_usuarios_` (`IDUsuarioResponsable`),
  CONSTRAINT `historialestadosequi_IDEstadoEquipoAnteri_0c5b66a6_fk_estadoseq` FOREIGN KEY (`IDEstadoEquipoAnterior`) REFERENCES `estadosequipo` (`IDEstadoEquipo`),
  CONSTRAINT `historialestadosequi_IDEstadoEquipoNuevo_ca108f2e_fk_estadoseq` FOREIGN KEY (`IDEstadoEquipoNuevo`) REFERENCES `estadosequipo` (`IDEstadoEquipo`),
  CONSTRAINT `historialestadosequi_IDOrdenTrabajoRelaci_7cc2c719_fk_ordenestr` FOREIGN KEY (`IDOrdenTrabajoRelacionada`) REFERENCES `ordenestrabajo` (`IDOrdenTrabajo`),
  CONSTRAINT `historialestadosequi_IDUsuarioResponsable_e39a8164_fk_usuarios_` FOREIGN KEY (`IDUsuarioResponsable`) REFERENCES `usuarios` (`IDUsuario`),
  CONSTRAINT `historialestadosequipo_IDEquipo_eb8958af_fk_equipos_IDEquipo` FOREIGN KEY (`IDEquipo`) REFERENCES `equipos` (`IDEquipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historialestadosequipo`
--

LOCK TABLES `historialestadosequipo` WRITE;
/*!40000 ALTER TABLE `historialestadosequipo` DISABLE KEYS */;
/*!40000 ALTER TABLE `historialestadosequipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historialhorometros`
--

DROP TABLE IF EXISTS `historialhorometros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historialhorometros` (
  `IDHistorialHorometro` int NOT NULL AUTO_INCREMENT,
  `FechaLectura` datetime(6) NOT NULL,
  `ValorHorometro` int NOT NULL,
  `FuenteLectura` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Observaciones` longtext COLLATE utf8mb4_unicode_ci,
  `IDEquipo` int NOT NULL,
  `IDOrdenTrabajoAsociada` int DEFAULT NULL,
  `IDUsuarioRegistra` int DEFAULT NULL,
  PRIMARY KEY (`IDHistorialHorometro`),
  KEY `historialhorometros_IDEquipo_42b2ab65_fk_equipos_IDEquipo` (`IDEquipo`),
  KEY `historialhorometros_IDOrdenTrabajoAsocia_c042a607_fk_ordenestr` (`IDOrdenTrabajoAsociada`),
  KEY `historialhorometros_IDUsuarioRegistra_f38e7553_fk_usuarios_` (`IDUsuarioRegistra`),
  CONSTRAINT `historialhorometros_IDEquipo_42b2ab65_fk_equipos_IDEquipo` FOREIGN KEY (`IDEquipo`) REFERENCES `equipos` (`IDEquipo`),
  CONSTRAINT `historialhorometros_IDOrdenTrabajoAsocia_c042a607_fk_ordenestr` FOREIGN KEY (`IDOrdenTrabajoAsociada`) REFERENCES `ordenestrabajo` (`IDOrdenTrabajo`),
  CONSTRAINT `historialhorometros_IDUsuarioRegistra_f38e7553_fk_usuarios_` FOREIGN KEY (`IDUsuarioRegistra`) REFERENCES `usuarios` (`IDUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historialhorometros`
--

LOCK TABLES `historialhorometros` WRITE;
/*!40000 ALTER TABLE `historialhorometros` DISABLE KEYS */;
/*!40000 ALTER TABLE `historialhorometros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `IDNotificacion` int NOT NULL AUTO_INCREMENT,
  `Mensaje` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `TipoNotificacion` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `FechaCreacion` datetime(6) NOT NULL,
  `FechaLectura` datetime(6) DEFAULT NULL,
  `Leida` tinyint(1) NOT NULL,
  `Prioridad` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `URLRelacionada` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IDEntidadRelacionada` int DEFAULT NULL,
  `TipoEntidadRelacionada` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IDUsuarioDestino` int NOT NULL,
  PRIMARY KEY (`IDNotificacion`),
  KEY `notificaciones_IDUsuarioDestino_12e594f9_fk_usuarios_IDUsuario` (`IDUsuarioDestino`),
  CONSTRAINT `notificaciones_IDUsuarioDestino_12e594f9_fk_usuarios_IDUsuario` FOREIGN KEY (`IDUsuarioDestino`) REFERENCES `usuarios` (`IDUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordenestrabajo`
--

DROP TABLE IF EXISTS `ordenestrabajo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordenestrabajo` (
  `IDOrdenTrabajo` int NOT NULL AUTO_INCREMENT,
  `NumeroOT` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FechaCreacionOT` datetime(6) NOT NULL,
  `FechaReporteFalla` datetime(6) DEFAULT NULL,
  `FechaProgramadaInicio` datetime(6) DEFAULT NULL,
  `FechaProgramadaFin` datetime(6) DEFAULT NULL,
  `FechaEjecucionInicioReal` datetime(6) DEFAULT NULL,
  `FechaEjecucionFinReal` datetime(6) DEFAULT NULL,
  `HorometroEquipoIngreso` int DEFAULT NULL,
  `HorometroEquipoSalida` int DEFAULT NULL,
  `DescripcionProblemaReportado` longtext COLLATE utf8mb4_unicode_ci,
  `DiagnosticoTecnico` longtext COLLATE utf8mb4_unicode_ci,
  `CausaRaizFalla` longtext COLLATE utf8mb4_unicode_ci,
  `SolucionAplicada` longtext COLLATE utf8mb4_unicode_ci,
  `ObservacionesOT` longtext COLLATE utf8mb4_unicode_ci,
  `Prioridad` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `RequiereTrasladoTaller` tinyint(1) NOT NULL,
  `UbicacionRealizacion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CostoEstimadoManoObra` decimal(10,2) DEFAULT NULL,
  `CostoEstimadoRepuestos` decimal(10,2) DEFAULT NULL,
  `CostoRealManoObra` decimal(10,2) DEFAULT NULL,
  `CostoRealRepuestos` decimal(10,2) DEFAULT NULL,
  `TiempoInactividadEquipoHoras` decimal(8,2) DEFAULT NULL,
  `FechaCompletada` datetime(6) DEFAULT NULL,
  `FechaVerificada` datetime(6) DEFAULT NULL,
  `IDDetallePlanMantenimientoOrigen` int DEFAULT NULL,
  `IDEquipo` int NOT NULL,
  `IDEstadoOT` int NOT NULL,
  `IDPlanMantenimientoAsociado` int DEFAULT NULL,
  `IDTipoMantenimientoOT` int NOT NULL,
  `CompletadaPor` int DEFAULT NULL,
  `IDReportadoPor` int DEFAULT NULL,
  `IDSolicitante` int NOT NULL,
  `IDTecnicoAsignadoPrincipal` int DEFAULT NULL,
  `VerificadaPor` int DEFAULT NULL,
  PRIMARY KEY (`IDOrdenTrabajo`),
  UNIQUE KEY `NumeroOT` (`NumeroOT`),
  KEY `ordenestrabajo_CompletadaPor_b796db9c_fk_usuarios_IDUsuario` (`CompletadaPor`),
  KEY `ordenestrabajo_IDReportadoPor_c69de3f5_fk_usuarios_IDUsuario` (`IDReportadoPor`),
  KEY `ordenestrabajo_IDSolicitante_fb0d81eb_fk_usuarios_IDUsuario` (`IDSolicitante`),
  KEY `ordenestrabajo_IDTecnicoAsignadoPri_de636b1f_fk_usuarios_` (`IDTecnicoAsignadoPrincipal`),
  KEY `ordenestrabajo_VerificadaPor_a7f446d0_fk_usuarios_IDUsuario` (`VerificadaPor`),
  KEY `ordenestrabajo_IDDetallePlanManteni_12653e16_fk_detallesp` (`IDDetallePlanMantenimientoOrigen`),
  KEY `ordenestrabajo_IDEquipo_737e71a2_fk_equipos_IDEquipo` (`IDEquipo`),
  KEY `ordenestrabajo_IDEstadoOT_47c670e4_fk_estadosor` (`IDEstadoOT`),
  KEY `ordenestrabajo_IDPlanMantenimientoA_374fc67d_fk_planesman` (`IDPlanMantenimientoAsociado`),
  KEY `ordenestrabajo_IDTipoMantenimientoO_1b436584_fk_tiposmant` (`IDTipoMantenimientoOT`),
  CONSTRAINT `ordenestrabajo_CompletadaPor_b796db9c_fk_usuarios_IDUsuario` FOREIGN KEY (`CompletadaPor`) REFERENCES `usuarios` (`IDUsuario`),
  CONSTRAINT `ordenestrabajo_IDDetallePlanManteni_12653e16_fk_detallesp` FOREIGN KEY (`IDDetallePlanMantenimientoOrigen`) REFERENCES `detallesplanmantenimiento` (`IDDetallePlan`),
  CONSTRAINT `ordenestrabajo_IDEquipo_737e71a2_fk_equipos_IDEquipo` FOREIGN KEY (`IDEquipo`) REFERENCES `equipos` (`IDEquipo`),
  CONSTRAINT `ordenestrabajo_IDEstadoOT_47c670e4_fk_estadosor` FOREIGN KEY (`IDEstadoOT`) REFERENCES `estadosordentrabajo` (`IDEstadoOT`),
  CONSTRAINT `ordenestrabajo_IDPlanMantenimientoA_374fc67d_fk_planesman` FOREIGN KEY (`IDPlanMantenimientoAsociado`) REFERENCES `planesmantenimiento` (`IDPlanMantenimiento`),
  CONSTRAINT `ordenestrabajo_IDReportadoPor_c69de3f5_fk_usuarios_IDUsuario` FOREIGN KEY (`IDReportadoPor`) REFERENCES `usuarios` (`IDUsuario`),
  CONSTRAINT `ordenestrabajo_IDSolicitante_fb0d81eb_fk_usuarios_IDUsuario` FOREIGN KEY (`IDSolicitante`) REFERENCES `usuarios` (`IDUsuario`),
  CONSTRAINT `ordenestrabajo_IDTecnicoAsignadoPri_de636b1f_fk_usuarios_` FOREIGN KEY (`IDTecnicoAsignadoPrincipal`) REFERENCES `usuarios` (`IDUsuario`),
  CONSTRAINT `ordenestrabajo_IDTipoMantenimientoO_1b436584_fk_tiposmant` FOREIGN KEY (`IDTipoMantenimientoOT`) REFERENCES `tiposmantenimientoot` (`IDTipoMantenimientoOT`),
  CONSTRAINT `ordenestrabajo_VerificadaPor_a7f446d0_fk_usuarios_IDUsuario` FOREIGN KEY (`VerificadaPor`) REFERENCES `usuarios` (`IDUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordenestrabajo`
--

LOCK TABLES `ordenestrabajo` WRITE;
/*!40000 ALTER TABLE `ordenestrabajo` DISABLE KEYS */;
/*!40000 ALTER TABLE `ordenestrabajo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planesmantenimiento`
--

DROP TABLE IF EXISTS `planesmantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planesmantenimiento` (
  `IDPlanMantenimiento` int NOT NULL AUTO_INCREMENT,
  `NombrePlan` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DescripcionPlan` longtext COLLATE utf8mb4_unicode_ci,
  `FechaCreacion` datetime(6) NOT NULL,
  `Activo` tinyint(1) NOT NULL,
  `Version` int NOT NULL,
  `IDEquipo` int NOT NULL,
  `IDUsuarioCreador` int DEFAULT NULL,
  PRIMARY KEY (`IDPlanMantenimiento`),
  UNIQUE KEY `planesmantenimiento_IDEquipo_NombrePlan_d99a0e9b_uniq` (`IDEquipo`,`NombrePlan`),
  KEY `planesmantenimiento_IDUsuarioCreador_e37e265b_fk_usuarios_` (`IDUsuarioCreador`),
  CONSTRAINT `planesmantenimiento_IDEquipo_a604be5f_fk_equipos_IDEquipo` FOREIGN KEY (`IDEquipo`) REFERENCES `equipos` (`IDEquipo`),
  CONSTRAINT `planesmantenimiento_IDUsuarioCreador_e37e265b_fk_usuarios_` FOREIGN KEY (`IDUsuarioCreador`) REFERENCES `usuarios` (`IDUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planesmantenimiento`
--

LOCK TABLES `planesmantenimiento` WRITE;
/*!40000 ALTER TABLE `planesmantenimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `planesmantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repuestos`
--

DROP TABLE IF EXISTS `repuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repuestos` (
  `IDRepuesto` int NOT NULL AUTO_INCREMENT,
  `CodigoRepuesto` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DescripcionRepuesto` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NumeroParteFabricante` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IDMarcaRepuesto` int DEFAULT NULL,
  `IDProveedorPreferido` int DEFAULT NULL,
  `UnidadMedida` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `StockActual` decimal(10,2) NOT NULL,
  `StockMinimo` decimal(10,2) NOT NULL,
  `StockMaximo` decimal(10,2) DEFAULT NULL,
  `UbicacionBodega` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CostoUnitarioPromedio` decimal(12,2) DEFAULT NULL,
  `Activo` tinyint(1) NOT NULL,
  PRIMARY KEY (`IDRepuesto`),
  UNIQUE KEY `CodigoRepuesto` (`CodigoRepuesto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repuestos`
--

LOCK TABLES `repuestos` WRITE;
/*!40000 ALTER TABLE `repuestos` DISABLE KEYS */;
/*!40000 ALTER TABLE `repuestos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `IDRol` int NOT NULL AUTO_INCREMENT,
  `NombreRol` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DescripcionRol` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`IDRol`),
  UNIQUE KEY `NombreRol` (`NombreRol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador','Acceso total al sistema'),(2,'Técnico','Puede ejecutar y ver órdenes de trabajo'),(3,'Supervisor','Puede crear y asignar órdenes de trabajo');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tareasestandar`
--

DROP TABLE IF EXISTS `tareasestandar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tareasestandar` (
  `IDTareaEstandar` int NOT NULL AUTO_INCREMENT,
  `CodigoTarea` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DescripcionTarea` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `DuracionEstimadaMinutos` int DEFAULT NULL,
  `InstruccionesDetalladas` longtext COLLATE utf8mb4_unicode_ci,
  `MaterialesSugeridos` longtext COLLATE utf8mb4_unicode_ci,
  `RequiereParadaEquipo` tinyint(1) NOT NULL,
  `Activa` tinyint(1) NOT NULL,
  `IDEspecialidadRequerida` int DEFAULT NULL,
  `IDTipoTarea` int NOT NULL,
  PRIMARY KEY (`IDTareaEstandar`),
  UNIQUE KEY `CodigoTarea` (`CodigoTarea`),
  KEY `tareasestandar_IDEspecialidadRequer_b27e06c8_fk_especiali` (`IDEspecialidadRequerida`),
  KEY `tareasestandar_IDTipoTarea_3dda212b_fk_tipostarea_IDTipoTarea` (`IDTipoTarea`),
  CONSTRAINT `tareasestandar_IDEspecialidadRequer_b27e06c8_fk_especiali` FOREIGN KEY (`IDEspecialidadRequerida`) REFERENCES `especialidades` (`IDEspecialidad`),
  CONSTRAINT `tareasestandar_IDTipoTarea_3dda212b_fk_tipostarea_IDTipoTarea` FOREIGN KEY (`IDTipoTarea`) REFERENCES `tipostarea` (`IDTipoTarea`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tareasestandar`
--

LOCK TABLES `tareasestandar` WRITE;
/*!40000 ALTER TABLE `tareasestandar` DISABLE KEYS */;
/*!40000 ALTER TABLE `tareasestandar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tiposequipo`
--

DROP TABLE IF EXISTS `tiposequipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tiposequipo` (
  `IDTipoEquipo` int NOT NULL AUTO_INCREMENT,
  `NombreTipo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DescripcionTipo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`IDTipoEquipo`),
  UNIQUE KEY `NombreTipo` (`NombreTipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tiposequipo`
--

LOCK TABLES `tiposequipo` WRITE;
/*!40000 ALTER TABLE `tiposequipo` DISABLE KEYS */;
/*!40000 ALTER TABLE `tiposequipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tiposmantenimientoot`
--

DROP TABLE IF EXISTS `tiposmantenimientoot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tiposmantenimientoot` (
  `IDTipoMantenimientoOT` int NOT NULL AUTO_INCREMENT,
  `NombreTipoMantenimientoOT` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`IDTipoMantenimientoOT`),
  UNIQUE KEY `NombreTipoMantenimientoOT` (`NombreTipoMantenimientoOT`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tiposmantenimientoot`
--

LOCK TABLES `tiposmantenimientoot` WRITE;
/*!40000 ALTER TABLE `tiposmantenimientoot` DISABLE KEYS */;
/*!40000 ALTER TABLE `tiposmantenimientoot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipostarea`
--

DROP TABLE IF EXISTS `tipostarea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipostarea` (
  `IDTipoTarea` int NOT NULL AUTO_INCREMENT,
  `NombreTipoTarea` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`IDTipoTarea`),
  UNIQUE KEY `NombreTipoTarea` (`NombreTipoTarea`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipostarea`
--

LOCK TABLES `tipostarea` WRITE;
/*!40000 ALTER TABLE `tipostarea` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipostarea` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usorepuestosactividadot`
--

DROP TABLE IF EXISTS `usorepuestosactividadot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usorepuestosactividadot` (
  `IDUsoRepuesto` int NOT NULL AUTO_INCREMENT,
  `CantidadUsada` decimal(10,2) NOT NULL,
  `FechaUso` datetime(6) NOT NULL,
  `CostoAlMomentoDeUso` decimal(12,2) DEFAULT NULL,
  `IDActividadOT` int NOT NULL,
  `IDRepuesto` int NOT NULL,
  `IDUsuarioRegistra` int DEFAULT NULL,
  PRIMARY KEY (`IDUsoRepuesto`),
  KEY `usorepuestosactivida_IDActividadOT_a74320ab_fk_actividad` (`IDActividadOT`),
  KEY `usorepuestosactivida_IDRepuesto_d2845bde_fk_repuestos` (`IDRepuesto`),
  KEY `usorepuestosactivida_IDUsuarioRegistra_9aa198fc_fk_usuarios_` (`IDUsuarioRegistra`),
  CONSTRAINT `usorepuestosactivida_IDActividadOT_a74320ab_fk_actividad` FOREIGN KEY (`IDActividadOT`) REFERENCES `actividadesordentrabajo` (`IDActividadOT`),
  CONSTRAINT `usorepuestosactivida_IDRepuesto_d2845bde_fk_repuestos` FOREIGN KEY (`IDRepuesto`) REFERENCES `repuestos` (`IDRepuesto`),
  CONSTRAINT `usorepuestosactivida_IDUsuarioRegistra_9aa198fc_fk_usuarios_` FOREIGN KEY (`IDUsuarioRegistra`) REFERENCES `usuarios` (`IDUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usorepuestosactividadot`
--

LOCK TABLES `usorepuestosactividadot` WRITE;
/*!40000 ALTER TABLE `usorepuestosactividadot` DISABLE KEYS */;
/*!40000 ALTER TABLE `usorepuestosactividadot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `IDUsuario` int NOT NULL,
  `Telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime(6) NOT NULL,
  `FechaUltActualizacion` datetime(6) NOT NULL,
  `UltimoAcceso` datetime(6) DEFAULT NULL,
  `IDEspecialidad` int DEFAULT NULL,
  `IDRol` int NOT NULL,
  PRIMARY KEY (`IDUsuario`),
  KEY `usuarios_IDEspecialidad_7e5198ea_fk_especiali` (`IDEspecialidad`),
  KEY `usuarios_IDRol_04ee5ba2_fk_roles_IDRol` (`IDRol`),
  CONSTRAINT `usuarios_IDEspecialidad_7e5198ea_fk_especiali` FOREIGN KEY (`IDEspecialidad`) REFERENCES `especialidades` (`IDEspecialidad`),
  CONSTRAINT `usuarios_IDRol_04ee5ba2_fk_roles_IDRol` FOREIGN KEY (`IDRol`) REFERENCES `roles` (`IDRol`),
  CONSTRAINT `usuarios_IDUsuario_93466666_fk_auth_user_id` FOREIGN KEY (`IDUsuario`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,NULL,1,'2025-06-11 02:45:52.711087','2025-06-11 02:45:52.711087',NULL,NULL,1),(2,NULL,1,'2025-06-11 02:46:36.084889','2025-06-11 02:46:36.084889',NULL,NULL,2),(3,NULL,1,'2025-06-11 02:48:18.212682','2025-06-11 02:48:18.212682',NULL,NULL,3);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-11 15:55:17
