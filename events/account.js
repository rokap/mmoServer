var utilities = require('../libs/utilities');

module.exports = function (io, socket, db) {

    var account = {
        id: 0,
        account: 0,
        username: 'Anonymous',
        email: ''
    };

    socket.on("server:register", function (data) {
        utilities.debug(socket, "server:register");
        var accountExists = false;
        // Check if account exists already
        db.query("SELECT * FROM accounts where username = '" + data.username + "'")
            .on('result', function (data) {
                accountExists = true;
            })
            .on('end', function () {
                if (accountExists) {
                    // Already Exists
                    utilities.debug(socket, "Account " + data.username + " Already Exists");
                    socket.emit('client:register', {accountExists: accountExists})
                } else {
                    // Available, Create account
                    utilities.debug(socket, "Account " + data.username + " is available, Creating");
                    db.query(
                        "INSERT INTO accounts (username,password,firstname,lastname,active) VALUES (?,?,?,?,true)",
                        [data.username, data.password, data.firstname, data.lastname]
                    );
                    socket.emit('client:register', {accountExists: accountExists})
                }
            });


    });

    socket.on("server:login", function (data) {
        utilities.debug(socket, "server:login");

        var loggedIn = false;

        db.query("SELECT * FROM accounts where username = '" + data.user + "' && password = '" + data.pass + "' && active = 1")
            .on('result', function (data) {
                loggedIn = true;
                account.account = data.id;
                account.email = data.email;
                account.username = data.username;
            })
            .on('end', function () {
                // Only emit notes after query has been completed
                if (loggedIn) {
                    utilities.debug(socket, account.username + " - Login Success (" + account.account + ")");
                    socket.emit('client:login', {loggedIn: loggedIn, error: ''})
                } else {
                    loggedIn = false;
                    utilities.debug(socket, account.username + " - Username/Password Incorrect");
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