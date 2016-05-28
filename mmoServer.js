// Load/Setup Libraries
var config = require('./config'),                       // Config.js
    util = require("util"),			                    // Util.js
    Account = require("./game/account").Account,        // game/account.js
    Character = require("./game/character").Character;  // game/character.js

var server = require('./game/server');
server.start();
