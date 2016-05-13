var utilities = require('../libs/utilities');
module.exports = function (io, socket) {

    socket.on("server:register", function (data) {
        // Handle data
        // Send response to client
        socket.emit("client:register", data);
    });

    socket.on("server:login", function (data) {
        // Handle data
        // Send response to client
        socket.emit("client:login", data);
    });
    
};