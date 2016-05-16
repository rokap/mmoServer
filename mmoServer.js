// Load/Setup Libraries
var config = require('./config');
var db = require('./libs/mysql')(config);
var utilities = require('./libs/utilities');


io = require('socket.io')({
    transports: ['websocket']
});

// Attach a Listener
io.attach(config.port);

// Init Connection Hanlder
console.log();
utilities.debug("Core", "Starting Server *:" + config.port);
io.on('connection', function (socket) {

    var ipaddress = socket.request.connection.remoteAddress;
    // Log Access
    utilities.debug(socket, "Logging Access Request");
    db.query("INSERT INTO `access_log` (`ipaddress`,`session`) VALUES (?,?)", [ipaddress, socket.id]);

    utilities.debug(socket, "Core Events");
    // Initial Connection from Client
    utilities.debug(socket, " - Init Handler (connection)");

    // Init Disconnect Handler
    utilities.debug(socket, " - Init Handler (disconnect)");
    socket.on("disconnect", function (data) {
        utilities.debug(socket, "Disconnect");
        io.emit("client:disconnect", data);
    });

    // Init Other Handlers
    var account = require('./events/account')(io, socket, db);
    var character = require('./events/character')(account, io, socket, db);
    var world = require('./events/world')(io, socket, db);
    var zone = require('./events/zone')(io, socket, db);
    var inventory = require('./events/inventory')(io, socket, db);
    var trade = require('./events/trade')(io, socket, db);
    var chat = require('./events/chat')(character, io, socket, db);
    var npc = require('./events/npc')(io, socket, db);
    var quest = require('./events/quest')(io, socket, db);

});
