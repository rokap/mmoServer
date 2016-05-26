var util = require("util");

/**
 * Account Events, Called Dynamically, On Demand
 * @param server
 * @param io
 * @param db
 * @returns {module}
 */
module.exports = function (server, io, db) {

    /**
     * onLogin Handler
     * @param data
     * @param socket
     */
    this.onLogin = function (data, socket) {

        var netID = socket.id;

        util.log((netID + " - in = " + JSON.stringify(data)).debug);

        var loggedIn = false;

        // Internal to this file
        var account = {
            id: 0,
            username: "",
            firstname: "",
            lastname: "",
            netID: netID
        };

        var status = 0;
        var response = {};
        if (server.AccountAlreadyLoggedIn(data.user)) {
            status = 3;
            response = {
                loggedIn: loggedIn,
                status: status
            };
            util.log((netID + " - out = " + JSON.stringify(response)).error);
            socket.emit('account:onLogin', response);
        }
        else {
            db.query("SELECT id,username,firstname,lastname,active FROM accounts where username = '" + data.user + "' && password = '" + data.pass + "'")
                .on('result', function (data) {
                    util.log((netID + " - mysql = " + JSON.stringify(data)).info);
                    if (data.active) {
                        loggedIn = true;
                        account = data;
                        server.accounts.push(account);
                        delete account.id;
                        delete account.active;
                        account.netID = netID;
                        status = 0; // No Error
                    } else {
                        loggedIn = false;
                        status = 1; // Inactive Account
                    }
                })
                .on('end', function () {
                    if (loggedIn) {
                        response = {
                            loggedIn: loggedIn,
                            status: status,
                            account: account
                        };
                        util.log((netID + " - out = " + JSON.stringify(response)).success);
                        io.to('admin').emit('account:playerLogin', response);
                        io.emit('account:onLogin', response);
                        util.log((netID + " - Logged In").success);
                    } else {
                        if (status == 0) status = 2; // User Pass Incorrect
                        loggedIn = false;
                        response = {
                            loggedIn: loggedIn,
                            status: status
                        };
                        util.log((netID + " - out = " + JSON.stringify(response)).error);
                        socket.emit('account:onLogin', response);
                    }
                });
        }


    };

    /**
     * onLogout Handler
     * @param data
     * @param socket
     */
    this.onLogout = function (data, socket) {
        var netID = socket.id;
        var accountToRemove = server.FindAccountByNetID(netID);
        var index = server.accounts.indexOf(accountToRemove);
        if (index > -1) {
            io.to('admin').emit('account:playerLogout', accountToRemove.username);
            socket.emit('account:onLogout');
            util.log((netID + " - Logged Out").success);
            server.accounts.splice(index, 1);
        }
    };

    /**
     * onRequestCharacters Handler
     * @param data
     * @param socket
     */
    this.onRequestCharacters = function (data, socket) {
        util.log("Not Yet Implemented".warn)
    };

    /**
     * onSelectCharacter Handler
     * @param data
     * @param socket
     */
    this.onSelectCharacter = function (data, socket) {
        util.log("Not Yet Implemented".warn)
    };

    /**
     * onCreateCharacter Handler
     * @param data
     * @param socket
     */
    this.onCreateCharacter = function (data, socket) {
        util.log("Not Yet Implemented".warn)
    };

    /**
     * onDeleteCharacter Handler
     * @param data
     * @param socket
     */
    this.onDeleteCharacter = function (data, socket) {
        util.log("Not Yet Implemented".warn)
    };

    /**
     * onRequestClassesRaces Handler
     * @param data
     * @param socket
     */
    this.onRequestClassesRaces = function (data, socket) {
        util.log("Not Yet Implemented".warn)
    };

    /**
     * onEnterWorld Handler
     * @param data
     * @param socket
     */
    this.onEnterWorld = function (data, socket) {
        util.log("Not Yet Implemented".warn)
    };
    
    return this;
};