var utilities = require('../libs/utilities');
var mysql = require('mysql');

module.exports = function (config) {
    var db = mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
    });
    db.connect(function (err) {
        utilities.debug("Core", "Using Mysql (" + config.db.database + ")");
        if (err) console.log(err);
    });

    // CREATE if missing sqlupdates
    db.query('CREATE TABLE IF NOT EXISTS `sqlupdates` (' +
        '`id` INT(11) NOT NULL AUTO_INCREMENT,' +
        '`file` VARCHAR(50) NULL DEFAULT NULL,' +
        'PRIMARY KEY (`id`)' +
        ')' +
        'ENGINE=InnoDB' +
        ';');

    var fs = require('fs');
    fs.readdir('./sql/', function (err, files) {
        if (err) throw err;

        files.forEach(function (file) {
            var sqlUpdate = file.substring(0, file.length - 4);
            var exists = false;
            db.query("SELECT * FROM sqlupdates WHERE file=?", sqlUpdate)
                .on('result', function () {
                    // it exists!
                    exists = true;
                })
                .on('end', function () {
                    if (!exists) {
                        console.log("Added " + sqlUpdate + " to db");

                        var sql = fs.readFileSync("./sql/" + file).toString();
                        db.query(sql.toString('ascii'));
                        db.query("INSERT INTO sqlupdates (file) VALUES (?)", sqlUpdate);
                    }
                })
        });
    });

    return db;
};

