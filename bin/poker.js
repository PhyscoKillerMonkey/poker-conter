/// <reference path="../../typings/index.d.ts" />
var startingMoney = 100, bigBlind = 4;
var players = [], currentPlayer = 0, dealer = 0, potTotal = 0, potPP = 0, round = 0, phase = 0;
var Player = (function () {
    function Player(name, money) {
        this.name = name;
        this.money = money;
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
//# sourceMappingURL=poker.js.map