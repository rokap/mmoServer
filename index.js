// Load/Setup Libraries
var mysql = require('mysql');
var io = require('socket.io')({
    transports: ['websocket']
});

// Define our db credentials
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'database'
});

// Log any errors connected to the db
db.connect(function (err) {
    if (err) console.log(err)
});

// Attach a Listener
io.attach(4567);

// Start Events
io.on('connection', function (socket) {
    var netID = socket.id;
    Debug(socket,"Connected");
    socket.on('disconnect', function () {
        Debug(socket,"Disconnected");
    });
});

function Debug(s, m) {
    var d = getFormattedDate();
    console.log(d + " | " + s + ": " + m);
}
function getFormattedDate() {
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return str;
}