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
  betButton: document.getElementById("betButton"),
  leaderboard: document.getElementById("leaderboard"),
  winButtonsInner: document.getElementById("winButtonsInner")
}

var socket = io();

socket.emit("join", "Username");

socket.on("update", function(data: updateObject) {
  console.log(data);
  page.roundDisplay.innerHTML = "Round: " + data.round;
  page.phaseDisplay.innerHTML = "Phase: " + data.phase;
  page.potTotal.innerHTML = "Pot: £" + data.potTotal;

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
});

// For testing, probably don't want this
socket.on("reconnect", function() {
  socket.emit("join", "Username");
});