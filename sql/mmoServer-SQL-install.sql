-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.1.10-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win32
-- HeidiSQL Version:             9.3.0.4984
-- --------------------------------------------------------

-- Dumping structure for table tlserver.access_log
CREATE TABLE IF NOT EXISTS `access_log` (
  `id`        INT(11)   NOT NULL AUTO_INCREMENT,
  `date`      TIMESTAMP NULL     DEFAULT CURRENT_TIMESTAMP,
  `ipaddress` VARCHAR(50)        DEFAULT NULL,
  `session`   VARCHAR(50)        DEFAULT NULL,
  PRIMARY KEY (`id`)
)
  ENGINE = InnoDB
  DEFAULT CHARSET = latin1;

-- Data exporting was unselected.


-- Dumping structure for table tlserver.accounts
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `username` varchar(64) DEFAULT NULL,
  `password` varchar(64) DEFAULT NULL,
  `firstname` varchar(64) DEFAULT NULL,
  `lastname` varchar(64) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table tlserver.characters
CREATE TABLE IF NOT EXISTS `characters` (
  `id`      int(11) NOT NULL AUTO_INCREMENT,
  `create`  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `account` int(11) NOT NULL DEFAULT '0',
  `name`    varchar(50) DEFAULT NULL,
  `class`   VARCHAR(50) DEFAULT NULL,
  `level`   int(11) DEFAULT NULL,
  `posX`    FLOAT(12, 6) DEFAULT '0.000000',
  `posY`    FLOAT(12, 6) DEFAULT '0.000000',
  `posZ`    FLOAT(12, 6) DEFAULT '0.000000',
  `rot`     FLOAT(12, 6) DEFAULT '0.000000',
  PRIMARY KEY (`id`),
  KEY `FK_characters_accounts` (`account`),
  CONSTRAINT `FK_characters_accounts` FOREIGN KEY (`account`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
