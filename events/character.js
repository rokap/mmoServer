var utilities = require('../libs/utilities');

module.exports = function (account, io, socket, db, characters) {

    var character = {};

    utilities.debug(socket, "Character Events");

    character.Get = function (field) {
        if (field !== undefined)
            return character[field];
        else
            return character;
    };

    utilities.debug(socket, " - Init Handler (server:requestCharacters)");
    socket.on("server:requestCharacters", function () {
        utilities.debug(socket, "server:requestCharacters (" + account.Get("id") + ")");
        var characters = [];

        db.query("SELECT `id`,  `name`,  `class`,  `level` FROM characters WHERE account = ? ", account.Get("id"))
            .on('result', function (data) {
                characters.push(data);
            })
            .on('end', function () {
                socket.emit("client:requestCharacters", {characters: characters});
            });

    });

    utilities.debug(socket, " - Init Handler (server:selectCharacter)");
    socket.on("server:selectCharacter", function (data) {


        utilities.debug(socket, "server:selectCharacter (" + JSON.stringify(data) + ")");
        db.query("SELECT `id`,  `name`,  `class`,  `race`,  `gender`,  `level`,  `posX`,  `posY`,  `posZ`,  `rot` FROM characters WHERE id = ? && account = ? ", [data.id, account.Get("id")])
            .on('result', function (data) {
                character = data;
            })
            .on('end', function () {
                socket.emit("client:selectCharacter", character);
            });

    });

    utilities.debug(socket, " - Init Handler (server:createCharacter)");
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
                        [data.name, account.Get("id"), data.class, data.race, data.gender, 1]
                    );
                    socket.emit('client:createCharacter', {characterExists: createCharacter})
                }
            });
    });

    utilities.debug(socket, " - Init Handler (server:requestClassesRaces)");
    socket.on("server:requestClassesRaces", function () {
        utilities.debug(socket, "server:requestClassesRaces ()");
        var classes = [], races = [];
        db.query("SELECT name,icon FROM classes").on('result', function (dbData) {
            classes.push(dbData);
        }).on('end', function () {
            db.query("SELECT name,icon FROM races").on('result', function (dbData) {
                races.push(dbData);
            }).on('end', function () {
                socket.emit('client:requestClassesRaces', {classes: classes, races: races});
            });
        });
    });

    utilities.debug(socket, " - Init Handler (server:deleteCharacter)");
    socket.on("server:deleteCharacter", function (data) {
        utilities.debug(socket, "server:deleteCharacter (" + JSON.stringify(data) + ")");
        db.query("DELETE FROM characters where id = '" + data.id + "'");
        socket.emit("client:deleteCharacter", {deleted: true})
    });

    utilities.debug(socket, " - Init Handler (server:enterWorld)");
    socket.on("server:enterWorld", function () {
        utilities.debug(socket, "server:enterWorld");
        characters.push(character);
        socket.emit("client:enterWorld", {canEnter: true, character: character});
        socket.broadcast.emit("client:playerEnteredWorld", character);
    });

    utilities.debug(socket, " - Init Handler (server:moveCharacter)");
    socket.on("server:moveCharacter", function (data) {

        utilities.debug(socket, JSON.stringify(data));

        character.posX = data.posX;
        character.posY = data.posY;
        character.posZ = data.posZ;
        character.rot = data.rot;

        var netChar = {
            netID: socket.id,
            posX: data.posX,
            posY: data.posY,
            posZ: data.posZ,
            rot: data.rot
        };

        db.query("UPDATE characters SET posX=?,posY=?,posZ=?,rot=? WHERE id=?  ", [data.posX, data.posY, data.posZ, data.rot, character.id]);
        socket.broadcast.emit("client:otherCharacterMoved", netChar);

    });
    return character;
};