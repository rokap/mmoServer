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

// Start Events
io.on('connection', function (socket) {

    // Initial Connection from Client
    var ipaddress = socket.request.connection.remoteAddress;
    utilities.debug(socket, "New Connection");

    // Log Access to mysql
    db.query("INSERT INTO `access_log` (`ipaddress`,`session`) VALUES (?,?)", [ipaddress, socket.id]);

    socket.on("disconnect", function (data) {
        utilities.debug(socket, "Disconnect");
        io.emit("client:disconnect", data);
    });

    // Event Handlers
    require('./events/account')(io, socket, db);
});
