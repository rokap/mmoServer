# mmoServer

## Requirements
- nodejs - https://nodejs.org/en/

## Installation & Configuration
1. download and install nodejs
2. navigate to your project folder
3. hold **SHIFT + Right Click**, then select **open command prompt window here** ( windows )
4. type **npm install**, press enter
5. open mmoServer.js and uncommnt var db = require('./libs/mysql'); if you want to use mysql
6. open config.js and update db settings

## Starting/Stopping Server
1. navigate to your project folder
2. hold SHIFT + Right click -> open cammand prompt here ( windows )
3. type **node mmoServer**, press enter

to stop the server, press **CTRL + C**, repeat step 3 to restart

## Adding Events
Events should all be stored in the events folder, and the filename given is the acting group of all those events.
A simple example of what a basic event should look like

Create a file called **example.js** in the events folder, and paste or type in the following code

```
// Load Utilities, for Debugging Purposes
var utilities = require('../libs/utilities');

// Setup Module
module.exports = function (io, socket) {

    // Setup our First Event
    socket.on("server:firstEvent", function (data) {
        // Handle data if there is any
        // Send response to client with any return data
        // data is optional on the in/out
        socket.emit("client:firstEvent", data); // Will send back to the client asking
    });

    // Setup our Second Event
    socket.on("server:secondEvent", function (data) {
        // Handle data if there is any
        // Send response to client with any return data
        // data is optional on the in/out
        socket.emit("client:secondEvent", data); // Will send back to the client asking
    });

    // ETC
};
```

Real Application might look something like

```
var utilities = require('../libs/utilities');
module.exports = function (io, socket) {

    socket.on("connect", function (data) {
        // Handle data
        // Send response to all clients
        utilities.debug(socket, "Connected");
        io.emit("client:clientConnected", data); // Let all connected users know about this new connection
        socket.emit("client:connect", data); // Do something special for the client connecting
    });

    socket.on("disconnect", function (data) {
        // Handle data
        // Send response to all clients
        utilities.debug(socket, "Disconnect");
        io.emit("client:disconnect", data); // Let all connected users know this connection disconnected
    });

};
```

## Event Types
```
// sending to sender-client only
socket.emit('message', "this is a test");

// sending to all clients, include sender
io.emit('message', "this is a test");

// sending to all clients except sender
socket.broadcast.emit('message', "this is a test");

// sending to all clients in 'game' room(channel) except sender
socket.broadcast.to('game').emit('message', 'nice game');

// sending to all clients in 'game' room(channel), include sender
io.in('game').emit('message', 'cool game');

// sending to sender client, only if they are in 'game' room(channel)
socket.to('game').emit('message', 'enjoy the game');

// sending to all clients in namespace 'myNamespace', include sender
io.of('myNamespace').emit('message', 'gg');

// sending to individual socketid
socket.broadcast.to(socketid).emit('message', 'for your eyes only');
```
## Using Mysql