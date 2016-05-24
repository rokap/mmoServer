var Server = function () {

    // Required Libraries
    var config = require('../config'),
        db = require('../libs/mysql')(config),
        util = require("util"),
        router = require('socket.io-events')(),
        fileExists = require('file-exists'),
        colors = require('colors');

    // set theme
    colors.setTheme({
        info: 'grey',
        success: 'green',
        warn: 'yellow',
        debug: 'cyan',
        error: 'red'
    });

    var self = this;

    // Internal
    this._server = {
        accounts: [],
        characters: [],
        config: config,

        FindAccountByNetID: function (netID) {
            for (var i = 0; i < this.accounts.length; i++) {
                if (this.accounts[i].netID == netID) {
                    return this.accounts[i];
                }
            }
        },
        FindAccountByUsername: function (username) {
            for (var i = 0; i < this.accounts.length; i++) {
                if (this.accounts[i].username == username) {
                    return this.accounts[i];
                }
            }
        },
        AccountAlreadyLoggedIn: function (username) {
            for (var i = 0; i < this.accounts.length; i++) {
                if (this.accounts[i].username == username) {
                    return true;
                }
            }
            return false;
        },

    };

    this.onMessage = function (name, msg, socket, io, server, db) {

        var netID = socket.id;

        // Split Message Hook;
        var res = (name.split(":"));

        // Setup File;
        if (fileExists('./events/' + res[0] + '.js')) {

            console.log(("\n--- " + res[0] + ":" + res[1] + " Batch ---").info);
            // Require Handling File
            var group = require("../events/" + res[0])(server, io, db);

            // Setup Event
            var event = res[1];

            // Try Handler / Catch Errors
            try {
                group[event](msg, socket);
            } catch (exc) {
                util.log((netID + " - Missing event : ./events/" + res[0] + ":" + res[1] + " (" + exc + ")").error);
            }

        } else {
            console.log(("\n--- " + res[0] + ":" + res[1] + " Batch ---").info);
            util.log((netID + " - Missing File : ./events/" + res[0] + ".js").error);
        }

    };

    this.start = function (port) {

        if (port === undefined)
            port = config.port;

        var app = require('express')(),         // App
            http = require('http').Server(app), // HTTP Server
            io = require('socket.io')(http);    // I/O

        app.get('/', function (req, res) {
            res.sendfile('web/index.html');
        });

        http.listen(port, function () {
            util.log(("Server Started on Port: " + port).success);
        });

        io.on('connection', function (socket, args, next) {

            // Connection / Disconnection
            var netID = socket.id;

            socket.on('join', function (room) {
                socket.join(room);
                socket.emit('account:getOnline', self._server.accounts);
            });

            console.log("\n--- connection Batch ---".info);
            util.log((netID + " - Connected").success);

            socket.on('disconnect', function () {
                console.log("\n--- disconnect Batch ---".info);
                util.log((netID + " - Disconnected").success);

                var accountToRemove = self._server.FindAccountByNetID(netID);
                var index = self._server.accounts.indexOf(accountToRemove);
                if (index > -1) {
                    io.to('admin').emit('account:playerLogout', accountToRemove.username);
                    self._server.accounts.splice(index, 1);
                }

            })
        });
        util.log("Init Account Handlers".success);
        router.on("*", function (socket, args, next) {
            var name = args.shift(), msg = args.shift();
            self.onMessage(name, msg, socket, io, self._server, db);
            next();
        });
        io.use(router);

        /*
         setInterval(function() {
         util.log(JSON.stringify(self._server.accounts));
         }, 1000);
         */

    };
};
module.exports = new Server();