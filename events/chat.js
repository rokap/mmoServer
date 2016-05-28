var utilities = require('../libs/utilities');

module.exports = function (character, io, socket, db) {

    var chat = {};

    // chat events coming soon
    utilities.debug(socket, "Chat Events");

    utilities.debug(socket, " - Init Handler (server:channelMessage)");
    socket.on("server:channelMessage", function (data) {
        utilities.debug(socket, "server:channelMessage (" + JSON.stringify(data) + ")");
        // Do stuff with data
        io.emit('client:localMessage', data.message);
    });
    
    utilities.debug(socket, " - Init Handler (server:privateMessage)");
    socket.on("server:privateMessage", function (data) {
        utilities.debug(socket, "server:privateMessage (" + JSON.stringify(data) + ")");
        // Do stuff with data
        socket.emit('client:privateMessage', data.message);
        socket.broadcast.to(data.to).emit('client:privateMessageFrom', data.message);
    });

    utilities.debug(socket, " - Init Handler (server:joinChannel)");
    socket.on("server:joinChannel", function (data) {
        utilities.debug(socket, "server:joinChannel (" + JSON.stringify(data) + ")");
        socket.join(data.channel);
        socket.to(data.channel).emit('client:joinChannel');
        socket.broadcast.to(data.channel).emit('client:joinedChannel', character.Get("username"));
    });

    utilities.debug(socket, " - Init Handler (server:leaveChannel)");
    socket.on("server:leaveChannel", function (data) {
        utilities.debug(socket, "server:leaveChannel (" + JSON.stringify(data) + ")");
        socket.leave(data.channel);
        socket.to(data.channel).emit('client:leaveChannel');
        socket.broadcast.to(data.channel).emit('client:leftchannel', character.Get("username"));
    });
    return this;

};