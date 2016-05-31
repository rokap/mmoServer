var util = require("util");

/**
 * Character Events, Called Dynamically, On Demand
 * @param server
 * @param io
 * @param db
 * @returns {module}
 */
module.exports = function (server, io, db) {

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
        var packet = {};

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

        var spell = server.Spell(data.spell_id);

        var packet = {
            n: spell.name,
            ct: spell.castTime,
            sp: spell.sParticles,
            dp: spell.dParticles
        };

        // Send first Packet onCast,
        server.Send(netID, "character:onCast", packet);

        //delay based on castTime on server
        setTimeout(function () {

            var packet = {
                e: spell.effects
            };
            server.Send(netID, "character:onCastComplete", packet);

        }, spell.castTime);

    };

    return this;
};