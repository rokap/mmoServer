var config = require('../config');
var utilities = require('../libs/utilities');
var db = require('../libs/mysql')(config);

module.exports = function (io, socket) {

    var client = {
        net_id: socket.id,
        account_id: 0,
        username: 'Anonymous',
        email: ''
    };

    socket.on("server:register", function (data) {
        utilities.debug(socket, "server:register");
        // Handle data
        // Send response to client
        socket.emit("client:register", data);
    });

    socket.on("server:login", function (data) {
        var loggedIn = false;

        utilities.debug(socket, "server:login");
        db.query("SELECT * FROM accounts where email = '" + data.email + "' && pass = '" + data.pass + "' && active = 1")
            .on('result', function (data) {
                loggedIn = true;
                client.account_id = data.id;
                client.email = data.email;
            })
            .on('end', function () {
                // Only emit notes after query has been completed
                if (loggedIn) {
                    utilities.debug(socket, data.email + " - Login Success (" + client.account_id + ")");
                    socket.emit('client:login', {loggedIn: loggedIn, error: ''})
                } else {
                    loggedIn = false;
                    utilities.debug(socket, data.email + " - Username/Password Incorrect");
                    socket.emit('client:login', {loggedIn: loggedIn, error: 'Username/Password Incorrect'})
                }
            });
    });

    socket.on("server:logout", function (data) {
        utilities.debug(socket, "server:logout");
        // Handle data
        // Send response to client
        socket.emit("client:logout", data);
    });

};