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
function byID(id) {
    return document.getElementById(id);
}
// DOM elements
var page = {
    gameContainer: byID("gameContainer"),
    roundDisplay: byID("roundDisplay"),
    potDisplay: byID("potDisplay"),
    moneyDisplay: byID("moneyDisplay"),
    leaderboard: byID("leaderboard"),
    checkButton: byID("checkButton"),
    raiseContainer: byID("raiseContainer"),
    raiseInput: byID("raiseInput"),
    loginContainer: byID("loginContainer"),
    loginText: byID("loginText"),
    nameInput: byID("nameInput"),
    cards: byID("cardContainer"),
    winContainer: byID("winContainer"),
    roomContainer: byID("roomContainer"),
    roomInput: byID("roomInput"),
    existingRooms: byID("existingRooms"),
    startButton: byID("startButton")
};
var socket = io();
var userName = undefined;
var players = [];
function submitName(useExisting) {
    if (!useExisting) {
        userName = page.nameInput.value;
    }
    socket.emit("getName", { name: userName });
}
socket.on("nameStatus", function (data) {
    if (data.avaliable) {
        console.log("Name was accepted");
        page.loginContainer.hidden = true;
        page.roomContainer.hidden = false;
    }
    else {
        page.loginText.innerHTML = "Name is already taken, please choose another:";
    }
});
function joinRoom(room) {
    if (!room) {
        room = page.roomInput.value;
    }
    socket.emit("joinRoom", { room: room });
    page.roomContainer.hidden = true;
    page.gameContainer.classList.remove("blur");
}
socket.on("roomUpdate", function (rooms) {
    console.log(rooms);
    var e = page.existingRooms;
    e.innerHTML = "<p>" + e.children[0].innerHTML + "</p>";
    var _loop_1 = function(room) {
        var button = document.createElement("button");
        button.innerText = room;
        button.onclick = function () { joinRoom(room); };
        e.appendChild(button);
    };
    for (var room in rooms) {
        _loop_1(room);
    }
});
function startGame() {
    socket.emit("startGame");
    page.startButton.hidden = true;
}
socket.on("update", function (data) {
    console.log(data);
    if (data) {
        page.roundDisplay.innerHTML = "Round: <b>" + data.round + "</b>";
        page.potDisplay.innerHTML = "Pot: <b>" + data.potTotal + "</b>";
        // Our money
        page.leaderboard.innerHTML = "";
        for (var _i = 0, _a = data.players; _i < _a.length; _i++) {
            var p = _a[_i];
            var para = document.createElement("p");
            if (p.name == userName) {
                para.innerHTML = "Me";
            }
            else {
                para.innerHTML = p.name;
            }
            para.innerHTML += ": <b>" + p.money + "</b>";
            if (p.inCurrentPot != 0) {
                para.innerHTML += " &#10132; " + p.inCurrentPot;
            }
            if (p.folded) {
                para.innerHTML = "<s>" + para.innerHTML + "</s>";
            }
            if (data.currentPlayer == data.players.indexOf(p)) {
                para.innerHTML = "<u>" + para.innerHTML + "</u>";
            }
            page.leaderboard.appendChild(para);
        }
        if (data.currentPlayer >= 0 && data.players[data.currentPlayer].name == userName) {
            console.log("Our turn");
        }
        else {
            console.log("Not our turn");
        }
        // Check whether to show the start button
        if (data.round == 0 && data.players[0].name == userName) {
            page.startButton.hidden = false;
        }
        switch (data.phase) {
            case 0:
                page.cards.children[0].classList.remove("filled");
                page.cards.children[1].classList.remove("filled");
                page.cards.children[2].classList.remove("filled");
                page.cards.children[3].classList.remove("filled");
                page.cards.children[4].classList.remove("filled");
                break;
            case 3:
                page.cards.children[4].classList.add("filled");
            case 2:
                page.cards.children[3].classList.add("filled");
            case 1:
                page.cards.children[0].classList.add("filled");
                page.cards.children[1].classList.add("filled");
                page.cards.children[2].classList.add("filled");
                break;
        }
    }
});
socket.on("chooseWinner", function () {
    console.log("Time to choose the winner");
    page.winContainer.hidden = false;
    page.gameContainer.classList.add("blur");
    page.winContainer.innerHTML = "<p>Choose the winner:</p>";
    for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
        var p = players_1[_i];
        if (!p.folded) {
            page.winContainer.innerHTML += "<button class='button' onclick=winnerIs('" + p.id + "')>" + p.name + "</button>";
        }
    }
});
function winnerIs(id) {
    console.log("Winner is " + id);
    socket.emit("winnerIs", id);
    page.winContainer.hidden = true;
    page.gameContainer.classList.remove("blur");
}
// For testing, probably don't want this
socket.on("reconnect", function () {
    if (userName != undefined) {
        submitName(true);
    }
});
function check() {
    console.log("Check");
    socket.emit("play", { move: "check" });
}
function raise() {
    var r = page.raiseInput.value;
    console.log("Raise " + r);
    socket.emit("play", { move: "raise", amount: parseInt(r) });
    hideRaiseContainer(true);
}
function hideRaiseContainer(hide) {
    if (hide) {
        page.raiseContainer.hidden = true;
        page.gameContainer.classList.remove("blur");
    }
    else {
        page.raiseContainer.hidden = false;
        page.gameContainer.classList.add("blur");
        page.raiseInput.value = "1";
    }
}
function fold() {
    console.log("Fold");
    socket.emit("play", { move: "fold" });
}
//# sourceMappingURL=client.js.map