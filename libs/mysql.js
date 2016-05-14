var utilities = require('../libs/utilities');
var mysql = require('mysql');

module.exports = function (config) {
    var db = mysql.createConnection({host: config.db.host, user: config.db.user, password: config.db.password, database: config.db.database});
    db.connect(function (err) {
        utilities.debug("Core", "Using Mysql");
        if (err) console.log(err);
    });
    return db;
};

