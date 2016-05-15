var utilities = require('../libs/utilities');

module.exports = function (io, socket, db) {

    var account = {
        id: 0,
        account: 0,
        username: 'Anonymous',
        email: ''
    };
    var character = {};

    utilities.debug(socket, "Init Handler (server:register)");
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

    utilities.debug(socket, "Init Handler (server:login)");
    socket.on("server:login", function (data) {
        utilities.debug(socket, "server:login (" + JSON.stringify(data) + ")");

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

    utilities.debug(socket, "Init Handler (server:logout)");
    socket.on("server:logout", function () {
        utilities.debug(socket, "server:logout");
        account = {
            id: 0,
            account: 0,
            username: 'Anonymous',
            email: ''
        };
        socket.emit("client:logout", account);

    });

    utilities.debug(socket, "Init Handler (server:requestCharacters)");
    socket.on("server:requestCharacters", function () {

        var characters = [];

        utilities.debug(socket, "server:requestCharacters");
        db.query("SELECT `id`,  `name`,  `class`,  `level` FROM characters WHERE account = ? ", account.account)
            .on('result', function (data) {
                characters.push(data);
            })
            .on('end', function () {
                socket.emit("client:requestCharacters", {characters: characters});
            });

    });

    utilities.debug(socket, "Init Handler (server:selectCharacter)");
    socket.on("server:selectCharacter", function (data) {


        utilities.debug(socket, "server:selectCharacter (" + JSON.stringify(data) + ")");
        db.query("SELECT `id`,  `name`,  `class`,  `prefab`,  `gender`,  `level`,  `posX`,  `posY`,  `posZ`,  `rot` FROM characters WHERE id = ? && account = ? ", [data.id, account.account])
            .on('result', function (data) {
                character = data;
            })
            .on('end', function () {
                socket.emit("client:selectCharacter", character);
            });

    });

    utilities.debug(socket, "Init Handler (server:createCharacter)");
    socket.on("server:createCharacter", function (data) {

        utilities.debug(socket, "server:createCharacter (" + JSON.stringify(data) + ")");

        var createCharacter = false;
        // Check if account exists already
        db.query("SELECT * FROM characters where name = '" + data.name + "'")
            .on('result', function (data) {
                createCharacter = true;
            })
            .on('end', function () {
                if (createCharacter) {
                    // Already Exists
                    utilities.debug(socket, "Character " + data.name + " Already Exists");
                    socket.emit('client:createCharacter', {characterExists: createCharacter})
                } else {
                    // Available, Create account
                    utilities.debug(socket, "Character " + data.name + " is available, Creating");
                    db.query(
                        "INSERT INTO characters (name,account,class,race,gender,level) VALUES (?,?,?,?,?,?)",
                        [data.name, account.account, data.class, data.race, data.gender, 1]
                    );
                    socket.emit('client:createCharacter', {characterExists: createCharacter})
                }
            });


    });

    utilities.debug(socket, "Init Handler (server:deleteCharacter)");
    socket.on("server:deleteCharacter", function (data) {
        utilities.debug(socket, "server:deleteCharacter (" + JSON.stringify(data) + ")");
        db.query("DELETE FROM characters where id = '" + data.id + "'");
        socket.emit("client:deleteCharacter", {deleted: true})
    });

    utilities.debug(socket, "Init Handler (server:enterWorld)");
    socket.on("server:enterWorld", function () {
        utilities.debug(socket, "server:enterWorld");
        delete character["id"];
        socket.emit("client:enterWorld", {canEnter: true, character: character});
        socket.broadcast.emit("client:playerEnteredWorld", character);
    });

};