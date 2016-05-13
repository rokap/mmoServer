// Load/Setup Libraries
var config = require('./config');
//var db = require('./libs/mysql'); // Uncomment to use, Check Config settings first.
var utilities = require('./libs/utilities');
var io = require('socket.io')({
    transports: ['websocket']
});

// Attach a Listener
io.attach(config.port);
utilities.debug("Core", "Starting Server *:" + config.port);

// Start Events
io.on('connection', function (socket) {
    utilities.debug(socket, "Connected");
    socket.on('disconnect', function () {
        utilities.debug(socket, "Disconnected");
    });
});
