var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');

// Define our db creds
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hobbes03',
    database: 'chat'
})

// Log any errors connected to the db
db.connect(function (err) {
    if (err) console.log(err)
});

var loggedIn = false;
io.on('connection', function (socket) {

    var client = {
        net_id: socket.id,
        account_id: 0,
        username: 'Anonymous',
        email: ''
    };

    // Connected
    io.emit('client connected', client);
    console.log(socket.id + ': connected');

    // Login
    socket.on('login', function (data) {

        db.query("SELECT * FROM accounts where email = '" + data.email + "' && pass = '" + data.pass + "' && active = 1")
            .on('result', function (data) {
                loggedIn = true;
                client.account_id = data.id;
                client.email = data.email;
            })
            .on('end', function () {
                // Only emit notes after query has been completed
                if (loggedIn) {
                    console.log(socket.id + ": " + data.email + " - Login Success (" + client.account_id + ")");

                    socket.emit('client:login', {loggedIn: loggedIn, error: ''})
                } else {
                    loggedIn = false;
                    console.log(socket.id + ": " + data.email + " - Username/Password Incorrect");
                    socket.emit('client:login', {loggedIn: loggedIn, error: 'Username/Password Incorrect'})
                }
            });
    });

    // Logout
    socket.on('logout', function (data) {
        loggedIn = false;
        console.log(socket.id + ": " + client.email + " - Logged Out (" + client.account_id + ")");
        socket.emit('client:logout', {loggedIn: loggedIn})
    });

    // Disconnect
    socket.on('disconnect', function () {

        // Client Connected
        console.log(socket.id + ': disconnected');
        io.emit('client disconnected', client)
    });

    // Request Characters
    socket.on('server:requestCharacters', function () {

        // requestCharacters
        console.log(socket.id + ': server:requestCharacters - ' + client.account_id);

        var characters = [];

        db.query("SELECT * FROM characters where account_id = " + client.account_id + "")
            .on('result', function (data) {
                characters.push(data)
            })
            .on('end', function () {
                socket.emit('client:characters', { characters:characters })
            });
    });
});


http.listen(3000, function () {
    console.log('listening on *:3000');
});