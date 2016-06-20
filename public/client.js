/// <reference path="../../typings/index.d.ts" />
// Object to pass to the clients when the game state changes
var updateObject = (function () {
    function updateObject() {
    }
    return updateObject;
}());
var Player = (function () {
    function Player() {
    }
    return Player;
}());
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
var socket = io();
socket.emit("join", "Username");
socket.on("update", function (data) {
    console.log(data);
    page.roundDisplay.innerHTML = "Round: " + data.round;
    page.phaseDisplay.innerHTML = "Phase: " + data.phase;
    page.potTotal.innerHTML = "Pot: £" + data.potTotal;
    page.leaderboard.innerHTML = "";
    for (var _i = 0, _a = data.players; _i < _a.length; _i++) {
        var p = _a[_i];
        var line = document.createElement("p");
        if (p.folded) {
            line.innerHTML = "<s>" + p.name + " £" + p.money + "</s>";
        }
        else {
            line.innerHTML = p.name + " £" + p.money;
        }
        page.leaderboard.appendChild(line);
    }
});
// For testing, probably don't want this
socket.on("reconnect", function () {
    socket.emit("join", "Username");
});
//# sourceMappingURL=client.js.map