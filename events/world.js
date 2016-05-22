var utilities = require('../libs/utilities');

module.exports = function (io, socket, db) {

    var world = {};

    // world events coming soon
    utilities.debug(socket, "World Events");

    world.WorldTick = function () {
        setTimeout(function () {
            utilities.debug(socket, "World Tick");
            io.emit('world:tick');
            world.WorldTick();
        }, 6000);
    };

    return world;

};