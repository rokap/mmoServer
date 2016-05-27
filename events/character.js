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

        // Update Server Character
        character.posX = data.posX;
        character.posY = data.posY;
        character.posZ = data.posZ;
        character.rot = data.rot;

        // Update Database
        db.query(
            "UPDATE characters SET posX=?,posY=?,posZ=?,rot=? WHERE id=?  ",
            [character.posX, character.posY, character.posZ, character.rot, character.id]
        );

        // Send Updates to All Clients Except Sender
        server.SendToOtherCharacters(netID, 'character:onMove', character);
    };

    return this;
};