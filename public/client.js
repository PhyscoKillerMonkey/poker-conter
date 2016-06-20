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
    raiseButton: document.getElementById("betButton"),
    leaderboard: document.getElementById("leaderboard"),
    winButtonsInner: document.getElementById("winButtonsInner"),
    nameField: document.getElementById("name")
};
var socket = io();
var userName = "";
function submitName() {
    socket.emit("join", page.nameField.value);
    userName = page.nameField.value;
}
socket.on("update", function (data) {
    console.log(data);
    console.log("We are " + socket.id);
    page.roundDisplay.innerHTML = "Round: " + data.round;
    page.phaseDisplay.innerHTML = "Phase: " + data.phase;
    page.potTotal.innerHTML = "Pot: £" + data.potTotal;
    page.playerPot.innerHTML = "Per player: £" + data.potPP;
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
    if (userName != "") {
        socket.emit("join", userName);
    }
});
var raiseAmount = 1;
function check() {
    socket.emit("check");
}
function lowerRaise() {
    raiseAmount--;
    if (raiseAmount >= 0) {
        raiseAmount = 1;
    }
    page.raiseButton.innerHTML = "Raise £" + raiseAmount;
}
function increaseRaise() {
    raiseAmount++;
    page.raiseButton.innerHTML = "Raise £" + raiseAmount;
}
function raise() {
    socket.emit("raise", raiseAmount);
}
function fold() {
    socket.emit("fold");
}
//# sourceMappingURL=client.js.map