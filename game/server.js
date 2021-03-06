var Server = function () {

    // Required Libraries
    var config = require('../config'),
        db = require('../libs/mysql')(config),
        util = require("util"),
        router = require('socket.io-events')(),
        fileExists = require('file-exists'),
        colors = require('colors');

    var app = require('express')(),         // App
        http = require('http').Server(app), // HTTP Server
        io = require('socket.io')(http);    // I/O

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

        config: config,

        // Buffered Content / Requires Server Restart on changes
        races: {},
        classes: {},
        spells: {},

        // Spell Effects in the world on the ground
        activeGroundSpells: {},
        activeTargetSpells: {},

        // Dynamic Content / Changes
        accounts: {},
        characters: {},
        tmpCharacters: {},

        /**
         * Account
         * @param netID
         * @returns {* | boolean}
         * @constructor
         */
        Account: function (netID) {
            if (self._server.accounts[netID] !== undefined)
                return self._server.accounts[netID];
            else
                return false
        },

        /**
         * AccountAdd
         * @param netID
         * @param account
         * @constructor
         */
        AccountAdd: function (netID, account) {
            self._server.accounts[netID] = account;
        },

        /**
         * AccountRemove
         * @param netID
         * @returns {boolean}
         * @constructor
         */
        AccountRemove: function (netID) {
            if (self._server.accounts[netID] !== undefined) {
                delete self._server.accounts[netID];
                return true;
            }
            else return false;
        },

        /**
         * AccountLoggedIn
         * @param username
         * @returns {boolean}
         * @constructor
         */
        AccountLoggedIn: function (username) {
            for (var netID in self._server.accounts) {
                if (self._server.accounts[netID].username == username) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Character
         * @param netID
         * @returns {* | boolean}
         * @constructor
         */
        Character: function (netID) {
            if (self._server.characters[netID] !== undefined)
                return self._server.characters[netID];
            else
                return false
        },

        /**
         * CharacterAdd
         * @param netID
         * @param account
         * @constructor
         */
        CharacterAdd: function (netID, character) {
            return self._server.characters[netID] = character;
        },

        /**
         * CharacterRemove
         * @param netID
         * @returns {boolean}
         * @constructor
         */
        CharacterRemove: function (netID) {

            util.log(netID + " Removing " + self._server.characters[netID].name);

            if (self._server.characters[netID] !== undefined) {
                var response = {
                    name: self._server.characters[netID].name
                };

                self._server.SendToOtherCharacters(netID, 'account:onCharacterExit', response);
                delete self._server.characters[netID];
                return true;
            }
            else return false;
        },

        /**
         * CharacterLoggedIn
         * @param name
         * @returns {boolean}
         * @constructor
         */
        CharacterLoggedIn: function (name) {
            for (var netID in self._server.characters) {
                if (self._server.characters[netID].name == name) {
                    return true;
                }
            }
            return false;
        },

        /**
         * TmpCharacter
         * @param netID
         * @returns {* | boolean}
         * @constructor
         */
        TmpCharacter: function (netID) {
            if (self._server.tmpCharacters[netID] !== undefined)
                return self._server.tmpCharacters[netID];
            else
                return false
        },

        /**
         * TmpCharacterAdd
         * @param netID
         * @param account
         * @constructor
         */
        TmpCharacterAdd: function (netID, character) {
            self._server.tmpCharacters[netID] = character;
        },

        /**
         * TmpCharacterRemove
         * @param netID
         * @returns {boolean}
         * @constructor
         */
        TmpCharacterRemove: function (netID) {
            if (self._server.tmpCharacters[netID] !== undefined) {
                delete self._server.tmpCharacters[netID];
                return true;
            }
            else return false;
        },

        /**
         * Races Available
         * @returns {Server._server.races|{}}
         * @constructor
         */
        Races: function () {
            return self._server.races;
        },

        /**
         * Classes Available
         * @returns {Server._server.classes|{}}
         * @constructor
         */
        Classes: function () {
            return self._server.classes;
        },

        /**
         * RaceAdd
         * @param id
         * @param race
         * @constructor
         */
        RaceAdd: function (id, race) {
            self._server.races[id] = race;
        },

        /**
         * ClassAdd
         * @param id
         * @param _class
         * @constructor
         */
        ClassAdd: function (id, _class) {
            self._server.classes[id] = _class;
        },

        /**
         * Spell
         * @param id
         * @returns {*}
         * @constructor
         */
        Spell: function (id) {
            if (self._server.spells[id] !== undefined)
                return self._server.spells[id];
            else
                return false
        },

        /**
         * SpellAdd
         * @param id
         * @param spell
         * @constructor
         */
        SpellAdd: function (id, spell) {
            self._server.spells[id] = spell;
        },

        /**
         * SpellEffectAdd
         * @param id
         * @param spell_id
         * @param effect
         * @constructor
         */
        SpellEffectAdd: function (id, spell_id, effect) {
            self._server.classes[spell_id].effects[id] = effect;
        },

        ActiveGroundSpellAdd: function (id, spellData) {
            self._server.activeGroundSpells[id] = spellData;
        },

        ActiveTargetSpellAdd: function (id, spellData) {
            self._server.activeTargetSpells[id] = spellData;
        },

        /**
         * Send Packet
         * @param netID
         * @param cmd
         * @param data
         * @constructor
         */
        Send: function (netID, cmd, data) {
            io.to(netID).emit(cmd, data);
        },
        SendToOtherCharacters: function (netID, cmd, data) {
            for (var otherNetID in self._server.characters) {
                if (otherNetID != netID) {
                    io.to(otherNetID).emit(cmd, data);
                }
            }
        }

    };

    this.onMessage = function (name, msg, socket, io, server, db) {

        var netID = socket.id;

        // Split Message Hook;
        var res = (name.split(":"));

        // Setup File;
        if (fileExists('./events/' + res[0] + '.js')) {

            //console.log(("\n--- " + res[0] + ":" + res[1] + " Batch ---").info);
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
            //console.log(("\n--- " + res[0] + ":" + res[1] + " Batch ---").info);
            util.log((netID + " - Missing File : ./events/" + res[0] + ".js").error);
        }

    };

    this.start = function (port) {

        if (port === undefined)
            port = config.port;

        app.get('/', function (req, res) {
            res.sendfile('web/index.html');
        });
        http.listen(port, function () {
            util.log(("Server Started on Port: " + port).success);
        });

        // Setup Network Listeners
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

                self._server.CharacterRemove(netID);
                self._server.AccountRemove(netID);
                self._server.TmpCharacterRemove(netID);

            });
        });

        router.on("*", function (socket, args, next) {
            var name = args.shift(), msg = args.shift();
            self.onMessage(name, msg, socket, io, self._server, db);
            next();
        });
        io.use(router);

        // Load Available Classes
        db.query("SELECT id,name,icon FROM classes").on('result', function (dbData) {
            var id = dbData.id;
            var data = {name: dbData.name, icon: dbData.icon};
            self._server.ClassAdd(id, data);
        }).on("end", function () {
            util.log("Loaded Classes".success);
        });

        // Load Available Races
        db.query("SELECT id,name,icon FROM races").on('result', function (dbData) {
            var id = dbData.id;
            var data = {name: dbData.name, icon: dbData.icon};
            self._server.RaceAdd(id, data);
        }).on("end", function () {
            util.log("Loaded Races".success);
        });

        // Load Available Spells
        db.query("SELECT * FROM spell").on('result', function (spell) {
            var data = {
                name: spell.name,
                type: spell.type,
                castTime: spell.castTime,
                resource: spell.resource,
                sParticles: spell.sParticles,
                dParticles: spell.dParticles,
                effects: {}
            };
            self._server.SpellAdd(spell.id, data);

            db.query("SELECT effect_id FROM spelleffects2spells WHERE spell_id = ?", spell.id).on('result', function (spelleffects2spells) {
                db.query("SELECT * FROM spelleffects WHERE id = ?", spelleffects2spells.effect_id).on('result', function (spelleffects) {
                    var effectdata = {
                        name: spelleffects.name,
                        type: spelleffects.type,
                        amount: spelleffects.amount,
                        duration: spelleffects.duration
                    };
                    self._server.SpellEffectAdd(spelleffects.id, spell.id, effectdata);

                });
            });
        }).on("end", function () {
            util.log("Loaded Spells".success);
        });

        setInterval(function () {
            //util.log(self._server.tmpCharacters);
        }, 5000);

    };

};
module.exports = new Server();