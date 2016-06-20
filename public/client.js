/// <reference path="../../typings/index.d.ts" />
var socket = io();
socket.emit("join", "Username");
// Global variables
var startMoney = 100;
var bigBlind = 4;
// Game variables
var players = [];
var round = 0;
var phase = 0;
var raiseAmount = 1;
var potTotal = 0;
var potPerPlayer = 0;
var currentPlayer = 0;
var playersReady = 0;
var playersFolded = 0;
// DOM elements
var page = {
    roundDisplay: document.getElementById("roundDisplay"),
    phaseDisplay: document.getElementById("phaseDisplay"),
    playerName: document.getElementById("nameDisplay"),
    potTotal: document.getElementById("potDisplay"),
    playerPot: document.getElementById("potPPDisplay"),
    checkButton: document.getElementById("checkButton"),
    betButton: document.getElementById("betButton"),
    leaderboard: document.getElementById("leaderboard"),
    winButtonsInner: document.getElementById("winButtonsInner")
};
/**
 * Player
 */
var Player = (function () {
    function Player(name, money) {
        this.name = name;
        this.money = money;
        this.inCurrentPot = 0;
    }
    Player.prototype.pay = function (amount) {
        this.money -= amount;
        this.inCurrentPot += amount;
        potTotal += amount;
    };
    return Player;
}());
function updateDisplay() {
    page.roundDisplay.innerHTML = "Round: " + round;
    page.phaseDisplay.innerHTML = "Phase: " + phase;
    page.playerName.innerHTML = players[currentPlayer].name;
    page.potTotal.innerHTML = "Pot: £" + potTotal;
    page.playerPot.innerHTML = "Per Player: £" + potPerPlayer;
    page.betButton.innerHTML = "Raise £" + raiseAmount;
    var betDifference = potPerPlayer - players[currentPlayer].inCurrentPot;
    if (betDifference == 0) {
        page.checkButton.innerHTML = "Check";
    }
    else {
        page.checkButton.innerHTML = "Call £" + betDifference;
    }
    page.leaderboard.innerHTML = "";
    for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
        var p = players_1[_i];
        var line = document.createElement("p");
        if (p.folded) {
            line.innerHTML = "<s>" + p.name + " £" + p.money + "</s>";
        }
        else {
            line.innerHTML = p.name + " £" + p.money;
        }
        page.leaderboard.appendChild(line);
    }
}
function nextPlayer() {
    console.log("Player " + currentPlayer);
    currentPlayer++;
    console.log("Player " + currentPlayer);
    if (currentPlayer >= players.length) {
        currentPlayer = 0;
        console.log("Out of range, choosing player 0");
    }
    if (players[currentPlayer].folded) {
        console.log("Player is folded, choosing next");
        nextPlayer();
    }
}
function check() {
    console.log("Player checked");
    var p = players[currentPlayer];
    p.pay(potPerPlayer - p.inCurrentPot);
    playersReady++;
    nextPlayer();
    doStuff();
}
function lowerRaise() {
    if (raiseAmount > 1) {
        raiseAmount--;
        updateDisplay();
    }
}
function increaseRaise() {
    raiseAmount++;
    updateDisplay();
}
function raise() {
    potPerPlayer += raiseAmount;
    var p = players[currentPlayer];
    p.pay(potPerPlayer - p.inCurrentPot);
    playersReady = 1;
    nextPlayer();
    doStuff();
}
function fold() {
    console.log("Player folded");
    players[currentPlayer].folded = true;
    nextPlayer();
    playersFolded++;
    doStuff();
}
function newRound() {
    // We are in the next round
    round++;
    // Reset variables
    phase = 0;
    playersReady = 1;
    playersFolded = 0;
    for (var _i = 0, players_2 = players; _i < players_2.length; _i++) {
        var p = players_2[_i];
        p.folded = false;
        p.inCurrentPot = 0;
    }
    // Make players pay big-blind and little-blind
    var firstPlayer = ((round - 1) % players.length);
    console.log("First player is " + firstPlayer);
    players[firstPlayer].pay(bigBlind / 2);
    if (firstPlayer == players.length - 1) {
        players[0].pay(bigBlind);
    }
    else {
        players[firstPlayer + 1].pay(bigBlind);
    }
    potPerPlayer = bigBlind;
    // Start play from person to left of big-blind
    currentPlayer = firstPlayer + 2;
    if (currentPlayer == players.length + 1) {
        currentPlayer = 1;
    }
    else if (currentPlayer == players.length) {
        currentPlayer = 0;
    }
    doStuff();
}
function doStuff() {
    console.log("Doing stuff on phase " + phase);
    updateDisplay();
    console.log(playersReady + " " + (players.length - playersFolded));
    if (players.length - playersFolded == 1) {
        // There is only one player left in the game
        winner(players[currentPlayer]);
    }
    else if (playersReady < players.length - playersFolded) {
        raiseAmount = 1;
        console.log("Player " + currentPlayer + "'s turn.");
    }
    else {
        // We are going into the next phase
        currentPlayer = 0;
        playersReady = 0;
        raiseAmount = 1;
        phase++;
        if (phase == 4) {
            finishRound();
        }
        else if (phase < 4) {
            doStuff();
        }
    }
}
function finishRound() {
    console.log("Game is finished!");
    page.winButtonsInner.innerHTML = "";
    var _loop_1 = function(p) {
        if (!p.folded) {
            var button = document.createElement("button");
            button.innerHTML = p.name;
            button.onclick = function () { winner(p); };
            page.winButtonsInner.appendChild(button);
        }
    };
    for (var _i = 0, players_3 = players; _i < players_3.length; _i++) {
        var p = players_3[_i];
        _loop_1(p);
    }
}
function winner(player) {
    player.money += potTotal;
    potTotal = 0;
    newRound();
    page.winButtonsInner.innerHTML = "";
}
window.onload = function () {
    console.log("Hello world!");
    players.push(new Player("Reece", startMoney));
    players.push(new Player("Laura", startMoney));
    newRound();
};
//# sourceMappingURL=client.js.map