// Global variables
var players = [];
var startMoney = 100;
var bigBlind = 4;
// Game variables
var round = 0;
var phase = 0;
var raiseAmount = 1;
var potTotal = 0;
var potPerPlayer = 0;
var currentPlayer = 0;
var playersReady = 0;
var curPlayers = players;
// DOM elements
var page = {
    roundDisplay: document.getElementById("roundDisplay"),
    playerName: document.getElementById("nameDisplay"),
    potTotal: document.getElementById("potDisplay"),
    playerPot: document.getElementById("potPPDisplay"),
    checkButton: document.getElementById("checkButton"),
    betButton: document.getElementById("betButton")
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
function updateDisplay() {
    page.roundDisplay.innerHTML = "Round: " + round;
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
}
function check() {
    console.log("Player checked");
    var p = players[currentPlayer];
    p.pay(potPerPlayer - p.inCurrentPot);
    playersReady++;
    currentPlayer++;
    if (currentPlayer >= curPlayers.length) {
        currentPlayer = 0;
    }
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
    currentPlayer++;
    doStuff();
}
// function raise() {
//     console.log("Player raised");
//     let p = players[nextPlayer];
//     potPerPlayer++;
//     p.pay(potPerPlayer - p.inCurrentPot);
//     playersReady = 1;
//     nextPlayer++;
//     if (nextPlayer >= curPlayers.length) {nextPlayer = 0}
//     doStuff();
// }
function fold() {
    console.log("Player folded");
    curPlayers.splice(currentPlayer);
    doStuff();
}
function newRound() {
    // We are in the next round
    round++;
    // Reset variables
    phase = 0;
    currentPlayer = 0;
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
        raiseAmount = 1;
        updateDisplay();
        console.log("Player " + currentPlayer + "'s turn.");
    }
    else {
        // We are going into the next phase
        currentPlayer = 0;
        playersReady = 0;
        raiseAmount = 1;
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
    players.push(new Player("Rando", startMoney));
    newRound();
};
//# sourceMappingURL=output.js.map