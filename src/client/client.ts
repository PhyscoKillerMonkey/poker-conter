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
  container: document.getElementById("container"),
  roundDisplay: document.getElementById("roundDisplay"),
  potDisplay: document.getElementById("potDisplay"),
  moneyDisplay: document.getElementById("moneyDisplay"),
  leaderboard: document.getElementById("leaderboard"),
  checkButton: document.getElementById("checkButton"),
  chipsContainer: document.getElementById("chipsContainer"),
  raiseDisplay: document.getElementById("raiseDisplay"),
  loginContainer: document.getElementById("loginContainer"),
  loginText: document.getElementById("loginText"),
  nameInput: <HTMLInputElement>document.getElementById("nameInput")
}

let socket = io();
let userName = "";

function submitName() {
  socket.emit("join", page.nameInput.value);
  userName = page.nameInput.value;
}

socket.on("nameAvaliable", function() {
  console.log("Name was accepted");
  page.loginContainer.hidden = true;
  page.container.classList.remove("blur");
});

socket.on("nameTaken", function() {
  page.loginText.innerHTML = "Name is already taken, please choose another:"
})

function startGame() {
  socket.emit("startGame");
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
});

function winnerIs(player: Player) {
  socket.emit("winnerIs", player);
}

// For testing, probably don't want this
socket.on("reconnect", function() {
  if (userName != "") {
    socket.emit("join", userName);
  }
});

function updateDisplay(data?: updateObject) {
  if (data) {
    page.roundDisplay.innerHTML = "Round: <b>" + data.round + "</b>";
    page.potDisplay.innerHTML = "Pot: <b>" + data.potTotal + "</b>";

    let pName = data.players[data.currentPlayer].name;
    let betDifference = data.potPP - data.players[data.currentPlayer].inCurrentPot;
    if (betDifference != 0 && pName == userName) {
      page.checkButton.innerHTML = "Call " + betDifference;
    } else {
      page.checkButton.innerHTML = "Check";
    }

    page.leaderboard.innerHTML = "";
    for (let p of data.players) {
      let line = document.createElement("p");
      if (p.name == userName) {
        p.name = "Me";
        page.moneyDisplay.innerHTML = "Money: <b>" + p.money + "</b>";
      }
      if (p.folded) {
        line.innerHTML = "<s>" + p.name + ": <b>" + p.money + "</b></s>";
      } else {
        line.innerHTML = p.name + ": <b>" + p.money + "</b>";
      }
      if (data.players[data.currentPlayer] == p) {
        line.innerHTML += " <b>&#8592</b>";
      }
      page.leaderboard.appendChild(line);
    }
  }

  page.raiseDisplay.innerHTML = raiseAmount.toString(); 
}

let raiseAmount = 1;

function check() {
  console.log("Check");
  socket.emit("check");
}

function changeRaise(amount: number) {
  raiseAmount += amount;
  if (raiseAmount <= 0) {
    raiseAmount = 1;
  }
  updateDisplay();
}

function raise() {
  console.log("Raise " + raiseAmount);
  socket.emit("raise", raiseAmount);
}

function fold() {
  console.log("Fold");
  socket.emit("fold");
}