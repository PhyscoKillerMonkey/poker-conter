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
    leaderboard: document.getElementById("leaderboard")
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
    console.log(players);
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
    currentPlayer++;
    if (currentPlayer >= players.length) {
        currentPlayer = 0;
    }
    while (players[currentPlayer].folded) {
        if (currentPlayer < players.length - 1) {
            currentPlayer++;
        }
        else {
            currentPlayer = 0;
        }
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
    currentPlayer = 0;
    playersReady = 1;
    playersFolded = 0;
    for (var _i = 0, players_2 = players; _i < players_2.length; _i++) {
        var p = players_2[_i];
        p.folded = false;
    }
    // Make players pay big-blind and little-blind
    var firstPlayer = round % players.length - 1;
    players[firstPlayer].pay(bigBlind / 2);
    players[firstPlayer + 1].pay(bigBlind);
    potPerPlayer = bigBlind;
    currentPlayer = firstPlayer + 2;
    if (currentPlayer > players.length - 1) {
        currentPlayer = 0;
    }
    doStuff();
}
function doStuff() {
    console.log("Phase " + phase);
    updateDisplay();
    if (playersReady < players.length - playersFolded) {
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
            // Game finished!
            console.log("Game is finished!");
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