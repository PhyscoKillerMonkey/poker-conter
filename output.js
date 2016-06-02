// Global variables
var players;
var startMoney = 100;
var bigBlind = 2;
/**
 * Player
 */
var Player = (function () {
    function Player(name, money) {
        this.name = name;
        this.money = money;
    }
    Player.prototype.pay = function (amount) {
        this.money -= amount;
        this.inCurrentPot += amount;
    };
    Player.prototype.choose = function () {
        console.log(this.name + " choose check, raise or fold");
    };
    return Player;
}());
function play(round) {
    // Make players pay big-blind and little-blind
    var firstPlayer = round % players.length;
    players[firstPlayer].pay(bigBlind / 2);
    players[firstPlayer + 1].pay(bigBlind);
    // Phases are 0: hand cards, 1: flop, 2: turn, 3: river (finished)
    var phase = 0;
    var potTotal = 0;
    var potPerPlayer = 0;
    while (phase <= 3) {
        var nextPlayer = 0;
        var playersReady = 0;
        var curPlayers = players;
        while (playersReady < curPlayers.length) {
            curPlayers[nextPlayer].choose();
            nextPlayer++;
            if (nextPlayer >= curPlayers.length) {
                nextPlayer = 0;
            }
        }
        phase++;
    }
}
window.onload = function () {
    console.log("Hello world!");
};
