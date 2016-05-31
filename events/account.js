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
        if (server.AccountLoggedIn(data.user)) {
            status = 3;
            response = {
                loggedIn: loggedIn,
                status: status
            };
            util.log((netID + " - out = " + JSON.stringify(response)).error);
            server.Send(netID, 'account:onLogin', response);
        }
        else {
            db.query("SELECT id,username,firstname,lastname,active FROM accounts where username = '" + data.user + "' && password = '" + data.pass + "'")
                .on('result', function (data) {
                    util.log((netID + " - mysql = " + JSON.stringify(data)).info);
                    if (data.active) {
                        loggedIn = true;
                        server.AccountAdd(netID, data);
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
                            account: server.Account(netID)
                        };
                        util.log((netID + " - out = " + JSON.stringify(response)).success);
                        io.to('admin').emit('account:playerLogin', response);
                        server.Send(netID, 'account:onLogin', response);
                        util.log((netID + " - Logged In").success);
                    } else {
                        if (status == 0) status = 2; // User Pass Incorrect
                        loggedIn = false;
                        response = {
                            loggedIn: loggedIn,
                            status: status
                        };
                        util.log((netID + " - out = " + JSON.stringify(response)).error);
                        server.Send(netID, 'account:onLogin', response);
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
        server.AccountRemove(netID);
    };

    /**
     * onRequestCharacters Handler
     * @param data
     * @param socket
     */
    this.onRequestCharacters = function (data, socket) {

        var netID = socket.id;
        if (data !== undefined) util.log((netID + " - in = " + JSON.stringify(data)).debug);
        var characters = [];
        var account = server.Account(netID);
        var response = {};

        db.query("SELECT `id`,  `name`,  `class`,  `level` FROM characters WHERE account = ? ", account.id)
            .on('result', function (data) {
                util.log((netID + " - mysql = " + JSON.stringify(data)).info);
                characters.push(data);
            })
            .on('end', function () {
                response = {characters: characters};
                util.log((netID + " - out = " + JSON.stringify(response)).success);
                server.Send(netID, 'account:onRequestCharacters', response);
            });
    };

    /**
     * onSelectCharacter Handler
     * @param data
     * @param socket
     */
    this.onSelectCharacter = function (data, socket) {

        var netID = socket.id;
        if (data !== undefined) util.log((netID + " - in = " + JSON.stringify(data)).debug);
        var account = server.Account(netID);
        var response = {};

        db.query("SELECT `id`, `name`,  `class`,  `race`,  `gender`,  `level`,  `posX`,  `posY`,  `posZ`,  `rot` FROM characters WHERE id = ? && account = ? ", [data.id, account.id])
            .on('result', function (data) {
                response = data;
                server.TmpCharacterAdd(netID, data);
            })
            .on('end', function () {
                util.log((netID + " - out = " + JSON.stringify(response)).success);
                server.Send(netID, 'account:onSelectCharacter', response);
            });
    };

    /**
     * onCreateCharacter Handler
     * @param data
     * @param socket
     */
    this.onCreateCharacter = function (data, socket) {

        var netID = socket.id;
        if (data !== undefined) util.log((netID + " - in = " + JSON.stringify(data)).debug);
        var account = server.Account(netID);
        var response = {};

        var createCharacter = false;
        // Check if account exists already
        db.query("SELECT * FROM characters where name = '" + data.name + "' LIMIT 1")
            .on('result', function (data) {
                createCharacter = true;
            })
            .on('end', function () {

                if (createCharacter) {
                    // Already Exists
                    util.log((netID + " Character Name Already Exists " ).error);
                } else {
                    // Available, Create account
                    util.log((netID + " Creating Character (" + [data.name, account.id, data.class, data.race, data.gender, 1] + ")" ).success);
                    db.query("INSERT INTO characters (name,account,class,race,gender,level) VALUES (?,?,?,?,?,?)", [data.name, account.id, data.class, data.race, data.gender, 1]);
                }

                response = {characterExists: createCharacter};

                util.log((netID + " - out = " + JSON.stringify(response)).success);
                server.Send(netID, 'account:onCreateCharacter', response);

            });

    };

    /**
     * onDeleteCharacter Handler
     * @param data
     * @param socket
     */
    this.onDeleteCharacter = function (data, socket) {

        var netID = socket.id;
        if (data !== undefined) util.log((netID + " - in = " + JSON.stringify(data)).debug);
        var account = server.Account(netID);

        var response = {deleted: true};

        db.query("DELETE FROM characters where id = '" + data.id + "' && account = " + account.id).on("result", function () {
            server.TmpCharacterRemove(netID);
            util.log((netID + " - out = " + JSON.stringify(response)).success);
            server.Send(netID, 'account:onDeleteCharacter', response);
        });
    };

    /**
     * onRequestClassesRaces Handler
     * @param data
     * @param socket
     */
    this.onRequestClassesRaces = function (data, socket) {

        var netID = socket.id;
        if (data !== undefined) util.log((netID + " - in = " + JSON.stringify(data)).debug);
        var account = server.Account(netID);
        var response = {classes: server.classes, races: server.races};

        util.log((netID + " - out = " + JSON.stringify(response)).success);
        server.Send(netID, 'account:onRequestClassesRaces', response);
    };

    /**
     * onEnterWorld Handler
     * @param data
     * @param socket
     */
    this.onEnterWorld = function (data, socket) {

        var netID = socket.id;
        if (data !== undefined) util.log((netID + " - in = " + JSON.stringify(data)).debug);
        var account = server.Account(netID);
        var tmpCharacter = server.TmpCharacter(netID);
        var spells = {};

        db.query("SELECT id,name,type,castTime,resource,sParticles,dParticles FROM characterspells as cs INNER JOIN spell as s ON cs.spell_id = s.id WHERE cs.character_id = ?", tmpCharacter.id).on("result", function (spell) {
            var data = {
                name: spell.name,
                type: spell.type,
                castTime: spell.castTime,
                resource: spell.resource,
                sParticles: spell.sParticles,
                dParticles: spell.dParticles,
                effects: {}
            };
            spells[spell.id] = data;
            db.query("SELECT effect_id FROM spelleffects2spells WHERE spell_id = ?", spell.id).on('result', function (spelleffects2spells) {
                db.query("SELECT * FROM spelleffects WHERE id = ?", spelleffects2spells.effect_id).on('result', function (spelleffects) {
                    var effectdata = {
                        name: spelleffects.name,
                        type: spelleffects.type,
                        amount: spelleffects.amount,
                        duration: spelleffects.duration
                    };
                    spells[spell.id].effects[spelleffects.id] = effectdata;
                });
            });
        });

        var response = {};

        response = {
            isMine: true,
            character: tmpCharacter,
            spells: spells
        };
        util.log((netID + " - out = " + JSON.stringify(response)).success);
        server.Send(netID, 'account:onEnterWorld', response);

        response = {isMine: false, character: tmpCharacter};
        server.SendToOtherCharacters(netID, 'account:onEnterWorld', response);

        server.CharacterAdd(netID, tmpCharacter);
        server.TmpCharacterRemove(netID);
    };

    /**
     * onGetCharactersConnected
     * @param data
     * @param socket
     */
    this.onGetCharactersConnected = function (data, socket) {

        var netID = socket.id;
        if (data !== undefined) util.log((netID + " - in = " + JSON.stringify(data)).debug);
        var account = server.Account(netID);
        var characters = {};

        for (var otherNetID in server.characters) {
            if (otherNetID != netID) {
                characters[otherNetID] = server.characters[otherNetID];
            }
        }

        var response = {characters: characters};
        util.log((netID + " - out = " + JSON.stringify(response)).success);
        server.Send(netID, 'account:onGetCharactersConnected', response);

    };

    return this;
};