/// <reference path="../../typings/index.d.ts" />

// Object to pass to the clients when the game state changes
class updateObject {
  players: Player[];
  currentPlayer: number;
  dealer: number;
  potTotal: number;
  potPP: number;
  round: number;
  phase: number;
}

class Player {
  name: string;
  id: string;
  money: number;
  inCurrentPot: number;
  folded: boolean; 
}

// DOM elements
let page = {
  roundDisplay: document.getElementById("roundDisplay"),
  phaseDisplay: document.getElementById("phaseDisplay"),
  playerName: document.getElementById("nameDisplay"),
  potTotal: document.getElementById("potDisplay"),
  playerPot: document.getElementById("potPPDisplay"),
  checkButton: document.getElementById("checkButton"),
  raiseButton: document.getElementById("betButton"),
  leaderboard: document.getElementById("leaderboard"),
  winButtonsInner: document.getElementById("winButtonsInner"),
  nameField: <HTMLInputElement>document.getElementById("name")
}

let socket = io();
let userName = "";

function submitName() {
  socket.emit("join", page.nameField.value);
  userName = page.nameField.value;
}

function startGame() {
  socket.emit("startGame");
}

function winnerIs(player: Player) {
  socket.emit("winnerIs", player);
}

socket.on("update", function(data: updateObject) {
  console.log(data);
  console.log("We are " + socket.id);
  updateDisplay(data);
});

socket.on("choose", function() {
  console.log("Time to choose");
});

socket.on("chooseWinner", function() {
  console.log("Time to choose the winner");
})

// For testing, probably don't want this
socket.on("reconnect", function() {
  if (userName != "") {
    socket.emit("join", userName);
  }
});

function updateDisplay(data?: updateObject) {
  if (data) {
    page.roundDisplay.innerHTML = "Round: " + data.round;
    page.phaseDisplay.innerHTML = "Phase: " + data.phase;
    page.potTotal.innerHTML = "Pot: £" + data.potTotal;
    page.playerPot.innerHTML = "Per player: £" + data.potPP;
    
    let betDifference = data.potPP - data.players[data.currentPlayer].inCurrentPot;
    if (betDifference == 0) {
      page.checkButton.innerHTML = "Check";
    } else {
      page.checkButton.innerHTML = "Call £" + betDifference;
    }

    page.leaderboard.innerHTML = "";
    for (let p of data.players) {
      let line = document.createElement("p");
      if (p.folded) {
        line.innerHTML = "<s>" + p.name + " £" + p.money + "</s>";
      } else {
        line.innerHTML = p.name + " £" + p.money;
      }
      page.leaderboard.appendChild(line);
    }
  }
  page.raiseButton.innerHTML = "Raise £" + raiseAmount; 
}

let raiseAmount = 1;

function check() {
  socket.emit("check");
}

function lowerRaise() {
  raiseAmount--;
  if (raiseAmount <= 0) {
    raiseAmount = 1;
  }
  updateDisplay();
}

function increaseRaise() {
  raiseAmount++;
  updateDisplay();
}

function raise() {
  socket.emit("raise", raiseAmount);
}

function fold() {
  socket.emit("fold");
}