/// <reference path="../../typings/index.d.ts" />
"use strict";
var express = require("express");
var app = express();
var http = require("http");
var server = http.createServer(app);
var socketio = require("socket.io");
var io = socketio(server);
// Setup the public folder for the web server
app.use(express.static("public"));
app.get("/", function (req, res) {
    var filename = "index.html";
    res.sendFile(__dirname + "/" + filename, function (err) {
        if (err) {
            console.error(err);
            res.status(err.status).end();
        }
        else {
            console.log("Sent: " + filename);
        }
    });
});
io.on("connection", function (socket) {
    var me;
    console.log(socket.id + " connected");
    function myTurn() {
        if (players[currentPlayer] == me) {
            return true;
        }
        else {
            return false;
        }
    }
    socket.on("join", function (name) {
        console.log(name + " joined, ID: " + socket.id);
        me = new Player(name, socket.id);
        players.push(me);
        updateClients();
    });
    socket.on("check", function () {
        if (myTurn()) {
            console.log(me.name + " checked");
            check();
        }
        else {
            console.log("Not " + me.name + "'s turn");
        }
    });
    socket.on("raise", function (amount) {
        if (myTurn()) {
            console.log(me.name + " raised £" + amount);
            raise(amount);
        }
        else {
            console.log("Not " + me.name + "'s turn");
        }
    });
    socket.on("fold", function () {
        if (myTurn()) {
            console.log(me.name + " folded");
            fold();
        }
        else {
            console.log("Not " + me.name + "'s turn");
        }
    });
    socket.on("disconnect", function () {
        console.log(socket.id + " disconnected");
        players.splice(players.indexOf(me));
        updateClients();
    });
});
server.listen(3000, function () {
    console.log("Listening on port 3000");
});
function updateClients() {
    io.emit("update", new updateObject());
}
// Object to pass to the clients when the game state changes
var updateObject = (function () {
    function updateObject() {
        this.players = players;
        this.currentPlayer = currentPlayer;
        this.dealer = dealer;
        this.potTotal = potTotal;
        this.potPP = potPP;
        this.round = round;
        this.phase = phase;
    }
    return updateObject;
}());
/*************************************/
/*          Poker Game Code          */
/*************************************/
var startingMoney = 100, bigBlind = 4;
var players = [], currentPlayer = 0, dealer = 0, potTotal = 0, potPP = 0, round = 0, phase = 0;
var Player = (function () {
    function Player(name, id, money) {
        this.name = name;
        this.id = id;
        this.money = money || startingMoney;
        this.inCurrentPot = 0;
        this.folded = false;
    }
    Player.prototype.pay = function (amount) {
        this.money -= amount;
        this.inCurrentPot += amount;
        potTotal += amount;
    };
    Player.prototype.ready = function () {
        if (this.inCurrentPot == potPP) {
            return true;
        }
        else if (this.inCurrentPot > potPP) {
            console.error("Player " + name + " has more money in pot than total...");
        }
        return false;
    };
    return Player;
}());
function nextPlayer() {
    currentPlayer++;
    if (currentPlayer >= players.length) {
        currentPlayer = 0;
    }
    if (players[currentPlayer].folded) {
        nextPlayer();
    }
}
// Problem may be caused when someone is folded
function allReady() {
    for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
        var p = players_1[_i];
        if (!p.ready) {
            return false;
        }
    }
    return true;
}
function folded() {
    var f = 0;
    for (var _i = 0, players_2 = players; _i < players_2.length; _i++) {
        var p = players_2[_i];
        if (p.folded) {
            f++;
        }
    }
    return f;
}
function check() {
    var p = players[currentPlayer];
    p.pay(potPP - p.inCurrentPot);
    nextPlayer();
    doTurn();
}
function raise(amount) {
    potPP += amount;
    var p = players[currentPlayer];
    p.pay(potPP - p.inCurrentPot);
    nextPlayer();
    doTurn();
}
function fold() {
    players[currentPlayer].folded = true;
    nextPlayer();
    doTurn();
}
function newRound() {
    round++;
    phase = 0;
    potTotal = 0;
    potPP = 0;
    for (var _i = 0, players_3 = players; _i < players_3.length; _i++) {
        var p = players_3[_i];
        p.folded = false;
        p.inCurrentPot = 0;
    }
    // Make the dealer one more, then the player one more than him
    currentPlayer = dealer;
    nextPlayer();
    dealer = currentPlayer;
    nextPlayer();
    players[currentPlayer].pay(bigBlind / 2);
    nextPlayer();
    players[currentPlayer].pay(bigBlind);
    nextPlayer();
    doTurn();
}
function doTurn() {
    updateClients();
    if (folded() == players.length - 1) {
        console.log("Only one player left");
    }
    else if (phase == 4) {
        console.log("The game has ended, choose a winner");
    }
    else if (allReady()) {
        // Go into the next phase
        phase++;
        currentPlayer = -1;
        nextPlayer();
        doTurn();
    }
    else {
        nextPlayer();
        console.log("Player " + players[currentPlayer].name + " has to choose");
    }
}
//# sourceMappingURL=server.js.map