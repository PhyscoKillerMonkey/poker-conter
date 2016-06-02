// Global variables
var players = [];
var startMoney = 100;
var bigBlind = 2;
var round = 0;
var phase = 0;
var potTotal = 0;
var potPerPlayer = 0;
var nextPlayer = 0;
var playersReady = 0;
var curPlayers = players;
// DOM elements
var page = {
    playerName: document.getElementById("curPlayerName"),
    potTotal: document.getElementById("potTotal"),
    playerPot: document.getElementById("potPerPlayer")
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
    Player.prototype.choose = function () {
        console.log(this.name + " choose check, raise or fold");
    };
    return Player;
}());
function check() {
    console.log("Player checked");
    var p = players[nextPlayer];
    p.pay(potPerPlayer - p.inCurrentPot);
    playersReady++;
    nextPlayer++;
    if (nextPlayer >= curPlayers.length) {
        nextPlayer = 0;
    }
    doStuff();
}
function raise() {
    console.log("Player raised");
    var p = players[nextPlayer];
    potPerPlayer++;
    p.pay(potPerPlayer - p.inCurrentPot);
    playersReady = 1;
    nextPlayer++;
    if (nextPlayer >= curPlayers.length) {
        nextPlayer = 0;
    }
    doStuff();
}
function fold() {
    console.log("Player folded");
    curPlayers.splice(nextPlayer);
    doStuff();
}
function newRound() {
    // We are in the next round
    round++;
    // Reset variables
    phase = 0;
    nextPlayer = 0;
    playersReady = 0;
    curPlayers = players;
    // Make players pay big-blind and little-blind
    var firstPlayer = round % players.length - 1;
    players[firstPlayer].pay(bigBlind / 2);
    players[firstPlayer + 1].pay(bigBlind);
    potPerPlayer = bigBlind;
    doStuff();
}
function doStuff() {
    console.log("Phase " + phase);
    if (playersReady < curPlayers.length) {
        page.playerName.innerHTML = players[nextPlayer].name;
        page.potTotal.innerHTML = "Pot: " + potTotal.toString();
        page.playerPot.innerHTML = "Per Player: " + potPerPlayer.toString();
        console.log("Player " + nextPlayer + "'s turn.");
    }
    else {
        // We are going into the next phase
        nextPlayer = 0;
        playersReady = 0;
        phase++;
        if (phase == 4) {
        }
        else if (phase < 4) {
            doStuff();
        }
    }
}
window.onload = function () {
    console.log("Hello world!");
    players.push(new Player("Reece", startMoney));
    players.push(new Player("Laura", startMoney));
    newRound();
};
