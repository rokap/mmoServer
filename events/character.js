var util = require("util");

/**
 * Character Events, Called Dynamically, On Demand
 * @param server
 * @param io
 * @param db
 * @returns {module}
 */
module.exports = function (server, io, db) {

    var castTimer = function (castTime, netID, spell_id, spellData) {
        return setTimeout(function () {
            // Add to active spells
            server.ActiveTargetSpellAdd(spell_id, spellData);
            var packet = {
                id: spellData.spell.id
            };
            // Inform caster, of its success;
            server.Send(netID, "character:onCastComplete", packet);
        }, castTime)

    };

    /**
     * onMove Handler
     * @param data
     * @param socket
     */
    this.onMove = function (data, socket) {
        var netID = socket.id;
        var response = {};

        // Get the current Character by Net ID
        var character = server.Character(netID);

        // Update Server Character
        character.posX = data.posX;
        character.posY = data.posY;
        character.posZ = data.posZ;
        character.rot = data.rot;
        character.a = data.a;

        var packet = {
            name: character.name,
            posX: character.posX,
            posY: character.posY,
            posZ: character.posZ,
            rot: character.rot,
            a: character.a
        };

        // Update Database
        db.query(
            "UPDATE characters SET posX=?,posY=?,posZ=?,rot=? WHERE id=?  ",
            [character.posX, character.posY, character.posZ, character.rot, character.id]
        );

        // Send Updates to All Clients Except Sender
        server.SendToOtherCharacters(netID, 'character:onMove', packet);
    };

    /**
     * onCast Handler
     * @param data
     * @param socket
     */
    this.onCast = function (data, socket) {

        var netID = socket.id;
        var spell_id = data.sid;
        var spell = server.Spell(spell_id);
        var target;
        var spellData;

        switch (spell.type) {
            // Ground
            case 0:
                target = {x: data.x, y: data.y, z: data.z};
                spellData = {target: target, spell: spell};
                server.ActiveGroundSpellAdd(spell_id, spellData);
                break;

            // target
            case 1:
                target = data.t;
                spellData = {target: target, spell: spell};
                break;
        }

        var packet = {
            sid: spell.id
        };

        // Send first Packet onCast,
        server.Send(netID, "character:onCast", packet);

        //delay based on castTime on server
        castTimer(spell.castTime, netID, spell_id, spellData);
    };

    /**
     * onInterrupt Handler
     * @param data
     * @param socket
     */
    this.onInterrupt = function (data, socket) {
        var netID = socket.id;
        var spell_id = data.sid;

        clearTimeout(castTimer);

        var packet = {
            sid: spell_id
        };
        // Inform caster, of its success;
        server.Send(netID, "character:onCastInterrupt", packet);
    };

    return this;
};