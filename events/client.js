var config = require('../config');
var utilities = require('../libs/utilities');

module.exports = function (io, socket) {

    socket.on("connect", function (data) {
        // Handle data
        // Send response to all clients
        utilities.debug(socket, "Connected");
        io.emit("client:clientConnected", data);
        socket.emit("client:connect", data);
    });

    socket.on("disconnect", function (data) {
        // Handle data
        // Send response to all clients
        utilities.debug(socket, "Disconnect");
        io.emit("client:disconnect", data);
    });
    
};