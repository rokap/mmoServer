var config = require('./libs/config');
var utilities = require('./libs/utilities');
var mysql = require('mysql');

var db = mysql.createConnection({host: config.db.host, user: config.db.user, password: config.db.password, database: config.db.database});
db.connect(function (err) {
    if (err) console.log(err);
    utilities.debug("Core", "Using Mysql");
});
module.exports = db;

