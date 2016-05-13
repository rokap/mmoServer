// Load/Setup Libraries
var config = require('./config');
var mysql = require('mysql');
var io = require('socket.io')({
    transports: ['websocket']
});
if (config.useDB) {
// Define our db credentials
    var db = mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
    });

// Log any errors connected to the db
    db.connect(function (err) {
        if (err) console.log(err)
    });
}

// Attach a Listener
io.attach(config.port);

// Start Events
io.on('connection', function (socket) {
    Debug(socket, "Connected");
    socket.on('disconnect', function () {
        Debug(socket, "Disconnected");
    });
});

function Debug(s, m) {
    var d = getFormattedDate();
    console.log(d + " | " + s.id + ": " + m);
}
function getFormattedDate() {
    var date = new Date();
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}