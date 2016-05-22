var utilities = require('../libs/utilities');

module.exports = function (io, socket, db) {

    var world = {};

    // world events coming soon
    utilities.debug(socket, "World Events");

    world.WorldTick = setTimeout(function () {
            utilities.debug(socket, "World Tick");
            io.emit('world:tick');
        }, 6000);

    return world;

};