// Load/Setup Libraries
var config = require('./config');
var db = require('./libs/mysql')(config);
var utilities = require('./libs/utilities');


io = require('socket.io')({
    transports: ['websocket']
});

// Attach a Listener
io.attach(config.port);

// Init Connection Hanlder
console.log();
utilities.debug("Core", "Starting Server *:" + config.port);

var characters = [];

io.on('connection', function (socket) {

    var ipaddress = socket.request.connection.remoteAddress;
    // Log Access
    utilities.debug(socket, "Logging Access Request");
    db.query("INSERT INTO `access_log` (`ipaddress`,`session`) VALUES (?,?)", [ipaddress, socket.id]);

    utilities.debug(socket, "Core Events");
    // Initial Connection from Client
    utilities.debug(socket, " - Init Handler (connection)");

    // Init Disconnect Handler
    utilities.debug(socket, " - Init Handler (disconnect)");
    socket.on("disconnect", function (data) {
        utilities.debug(socket, "Disconnect");
        io.emit("client:disconnect", data);
        var removeCharacter = findByNetId(socket.id);
        var index = characters.indexOf(removeCharacter);
        if (index > -1) {
            characters.splice(index, 1);
        }
    });

    socket.join("general");
    socket.join("local");

    // Init Other Handlers
    var account = require('./events/account')(io, socket, db);
    var character = require('./events/character')(account, io, socket, db, characters);


    var chat = require('./events/chat')(character, io, socket, db);
    var world = require('./events/world')(io, socket, db);
    var zone = require('./events/zone')(io, socket, db);
    var inventory = require('./events/inventory')(io, socket, db);
    var trade = require('./events/trade')(io, socket, db);
    var npc = require('./events/npc')(io, socket, db);
    var quest = require('./events/quest')(io, socket, db);

});

function findByNetId(sid) {
    for (var i = 0; i < characters.length; i++) {
        if (characters[i].netID == sid) {
            return characters[i];
        }
    }
    return null;
}

setInterval(function () {
    utilities.debug("Server", "World Tick");
    io.emit('world:tick');
}, 5000);

setInterval(function () {
    utilities.debug("Server", "Movement Tick");

    for (var i = 0; i < characters.length; i++) {
        utilities.debug("Server", "Character Changed, Send update");
        io.to(characters[i].netID).emit('world:movementTick', {characters: characters});
    }
}, 1000);

