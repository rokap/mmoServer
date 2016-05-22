var utilities = require('../libs/utilities');

module.exports = function (io, socket, db) {

    var world = {};

    // world events coming soon
    utilities.debug(socket, "World Events");

    var WorldTick = function () {
        setTimeout(function () {
            io.emit('world:tick');
        }, 6000);
        WorldTick();
    };

    WorldTick();
    return this;

};