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