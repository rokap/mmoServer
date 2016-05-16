var utilities = require('../libs/utilities');

module.exports = function (io, socket, db) {

    var account = {};

    utilities.debug(socket, "Account Events");

    account.Get = function (field) {
        if (field !== undefined)
            return account[field];
        else
            return account;
    };

    utilities.debug(socket, " - Init Handler (server:register)");
    socket.on("server:register", function (data) {
        utilities.debug(socket, "server:register (" + JSON.stringify(data) + ")");
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

    utilities.debug(socket, " - Init Handler (server:login)");
    socket.on("server:login", function (data) {
        utilities.debug(socket, "server:login (" + JSON.stringify(data) + ")");

        var loggedIn = false;

        db.query("SELECT * FROM accounts where username = '" + data.user + "' && password = '" + data.pass + "' && active = 1")
            .on('result', function (data) {
                loggedIn = true;
                account = data;
            })
            .on('end', function () {
                // Only emit notes after query has been completed
                if (loggedIn) {
                    utilities.debug(socket, account.username + " - Login Success (" + account.id + ")");
                    socket.emit('client:login', {loggedIn: loggedIn, account: account, error: ''})
                } else {
                    loggedIn = false;
                    utilities.debug(socket, account.username + " - Username/Password Incorrect");
                    socket.emit('client:login', {
                        loggedIn: loggedIn,
                        account: account,
                        error: 'Username/Password Incorrect'
                    })
                }
            });

    });

    utilities.debug(socket, " - Init Handler (server:logout)");
    socket.on("server:logout", function () {
        utilities.debug(socket, "server:logout");
        account = {};
        socket.emit("client:logout", account);

    });

    return account;

};