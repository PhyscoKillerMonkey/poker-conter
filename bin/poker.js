"use strict";
var Player = (function () {
    function Player(name, id, money) {
        this.name = name;
        this.id = id;
        this.money = money;
        this.inCurrentPot = 0;
        this.folded = false;
        this.played = false;
    }
    Player.prototype.pay = function (amount) {
        this.money -= amount;
        this.inCurrentPot += amount;
        // potTotal += amount;
    };
    Player.prototype.ready = function (potPP) {
        if (this.folded || (this.played && this.inCurrentPot == potPP)) {
            return true;
        }
        else if (this.inCurrentPot > potPP) {
            console.error("Player " + this.name + " has more money in pot than total...");
        }
        else {
            return false;
        }
    };
    return Player;
}());
exports.Player = Player;
var PokerManager = (function () {
    function PokerManager(room, startingMoney, bigBlind) {
        this.players = [];
        this.currentPlayer = -1;
        this.dealer = -1;
        this.potTotal = 0;
        this.potPP = 0;
        this.round = 0;
        this.phase = 0;
        this.room = room;
        this.startingMoney = startingMoney || 500;
        this.bigBlind = bigBlind || 10;
    }
    PokerManager.prototype.nextPlayer = function () {
        this.currentPlayer++;
        if (this.currentPlayer >= this.players.length) {
            this.currentPlayer = 0;
        }
        if (this.players[this.currentPlayer].folded) {
            this.nextPlayer();
        }
    };
    PokerManager.prototype.allReady = function () {
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var p = _a[_i];
            if (!p.ready(this.potPP)) {
                return false;
            }
        }
        return true;
    };
    PokerManager.prototype.numFolded = function () {
        var f = 0;
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var p = _a[_i];
            if (p.folded) {
                f++;
            }
        }
        return f;
    };
    PokerManager.prototype.raise = function (amount) {
        this.potPP += amount;
        console.log(this.potPP);
        var p = this.players[this.currentPlayer];
        p.pay(this.potPP - p.inCurrentPot);
        p.played = true;
        this.nextPlayer();
        this.doTurn();
    };
    PokerManager.prototype.fold = function () {
        this.players[this.currentPlayer].folded = true;
        this.nextPlayer();
        this.doTurn();
    };
    PokerManager.prototype.newRound = function () {
        this.round++;
        this.phase = 0;
        this.potTotal = 0;
        this.potPP = this.bigBlind;
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var p = _a[_i];
            p.folded = false;
            p.inCurrentPot = 0;
            p.played = false;
        }
        // Make the dealer one more, then the player one more than him
        this.currentPlayer = this.dealer;
        this.nextPlayer();
        this.dealer = this.currentPlayer;
        console.log(this.players[this.dealer].name + " is dealer");
        this.nextPlayer();
        console.log(this.players[this.currentPlayer].name + " is SB");
        this.players[this.currentPlayer].pay(this.bigBlind / 2);
        this.nextPlayer();
        console.log(this.players[this.currentPlayer].name + " is BB");
        this.players[this.currentPlayer].pay(this.bigBlind);
        this.nextPlayer();
        console.log(this.players[this.currentPlayer].name + " is UTG");
        this.doTurn();
    };
    PokerManager.prototype.doTurn = function () {
        if (this.numFolded() == this.players.length - 1) {
            console.log("Only one player left");
            // Find the remaining player and make them the winner
            for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
                var p = _a[_i];
                if (!p.folded) {
                    this.winnerIs(p);
                }
            }
        }
        else if (this.phase == 4) {
            console.log("The game has ended, " + this.players[0].name + " is choosing a winner");
            this.room.updateClients();
            this.room.clientMessage(this.players[0], "chooseWinner");
        }
        else if (this.allReady()) {
            // Go into the next phase
            this.phase++;
            console.log("Everybody is ready, going into phase " + this.phase);
            this.currentPlayer = this.dealer;
            for (var _b = 0, _c = this.players; _b < _c.length; _b++) {
                var p = _c[_b];
                p.played = false;
            }
            this.doTurn();
        }
        else {
            this.room.updateClients();
            console.log("Player " + this.players[this.currentPlayer].name + " has to choose");
            this.room.clientMessage(this.players[this.currentPlayer], "choose");
        }
    };
    PokerManager.prototype.winnerIs = function (player) {
        console.log("Winner is " + player.name);
        player.money += this.potTotal;
        this.newRound();
    };
    return PokerManager;
}());
exports.PokerManager = PokerManager;
//# sourceMappingURL=poker.js.map