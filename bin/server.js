/// <reference path="../../typings/index.d.ts" />
"use strict";
var express = require("express");
var app = express();
var http = require("http");
var server = http.createServer(app);
var socketio = require("socket.io");
var io = socketio(server);
var poker_1 = require("./poker");
// Setup the public folder for the web server
app.use(express.static("public"));
app.get("/", function (req, res) {
    var filename = "index.html";
    res.sendFile(__dirname + "/" + filename, function (err) {
        if (err) {
            console.error(err);
            res.status(err.status).end();
        }
    });
});
server.listen(3000, function () {
    console.log("Listening on port 3000");
});
var users = {};
var rooms = {};
io.on("connection", function (socket) {
    console.log("ID " + socket.id + " is connecting...");
    var userName = undefined;
    socket.on("disconnect", function () {
        console.log("User '" + userName + "', ID '" + socket.id + "' disconnected");
        if (userName != undefined && users[userName].room != undefined) {
            console.log("User " + userName + " is leaving room " + users[userName].room);
            rooms[users[userName].room].leave(socket.id);
        }
        users[userName] = undefined;
        roomUpdate();
    });
    socket.on("getName", function (data) {
        if (!users[data.name]) {
            users[data.name] = { id: socket.id, socket: socket, room: undefined };
            userName = data.name;
            socket.emit("nameStatus", { avaliable: true });
            roomUpdate(socket);
            console.log("User '" + userName + "' connected");
        }
        else {
            socket.emit("nameStatus", { avaliable: false });
        }
    });
    socket.on("joinRoom", function (data) {
        // Only allow client to connect to one room
        if (users[userName].room == undefined) {
            socket.join(data.room);
            users[userName].room = data.room;
            if (rooms[data.room] == undefined) {
                rooms[data.room] = new Room(data.room);
            }
            rooms[data.room].join(userName, socket.id);
            roomUpdate();
            rooms[data.room].gameUpdate();
        }
    });
});
function roomUpdate(socket) {
    var rooms = {};
    for (var r in io.sockets.adapter.rooms) {
        if (r.substr(0, 2) != "/#") {
            var sockets = [];
            for (var user in io.sockets.adapter.rooms[r].sockets) {
                sockets.push(user);
            }
            rooms[r] = sockets;
        }
    }
    if (socket) {
        socket.emit("roomUpdate", rooms);
    }
    else {
        io.sockets.emit("roomUpdate", rooms);
    }
}
var Room = (function () {
    function Room(name) {
        this.inProgress = false;
        this.name = name;
        this.game = new poker_1.PokerManager(this);
    }
    Room.prototype.join = function (name, id) {
        var player = new poker_1.Player(name, id, this.game.startingMoney);
        this.game.players.push(player);
        return player;
    };
    Room.prototype.leave = function (id) {
        var players = this.game.players;
        for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
            var p = players_1[_i];
            if (p.id == id) {
                players.splice(players.indexOf(p));
            }
        }
        this.gameUpdate();
    };
    Room.prototype.startGame = function () {
    };
    Room.prototype.gameUpdate = function () {
        io.to(this.name).emit("update", {
            players: this.game.players,
            currentPlayer: this.game.currentPlayer,
            dealer: this.game.dealer,
            potTotal: this.game.potTotal,
            potPP: this.game.potPP,
            round: this.game.round
        });
    };
    return Room;
}());
//# sourceMappingURL=server.js.map