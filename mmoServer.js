// Load/Setup Libraries
var config = require('./config');
var db = require('./libs/mysql')(config);
var utilities = require('./libs/utilities');


io = require('socket.io')({
    transports: ['websocket']
});

// Attach a Listener
io.attach(config.port);

utilities.debug("Core", "Starting Server *:" + config.port);
io.on('connection', function (socket) {


    // Start Events

    // Initial Connection from Client
    var ipaddress = socket.request.connection.remoteAddress;
    utilities.debug(socket, "New Connection");

    utilities.debug(socket, "Logging Access Request");
    db.query("INSERT INTO `access_log` (`ipaddress`,`session`) VALUES (?,?)", [ipaddress, socket.id]);

    utilities.debug(socket, "Init Handler (disconnect)");
    socket.on("disconnect", function (data) {
        utilities.debug(socket, "Disconnect");
        io.emit("client:disconnect", data);
    });

    var account = require('./events/account')(io, socket, db);
    var character = require('./events/character')(account, io, socket, db);

});
