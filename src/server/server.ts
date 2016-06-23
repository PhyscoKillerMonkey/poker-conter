/// <reference path="../../typings/index.d.ts" />

import express = require("express");
let app = express();
import http = require("http");
let server = http.createServer(app);
import socketio = require("socket.io");
let io = socketio(server);

// Setup the public folder for the web server
app.use(express.static("public"));

app.get("/", function(req, res) {
  let filename = "index.html";
  res.sendFile(__dirname + "/" + filename, function(err) {
    if (err) {
      console.error(err);
      res.status(err.status).end();
    } else {
      console.log("Sent: " + filename);
    }
  });
});

io.on("connection", function(socket) {
  let me: Player;
  console.log(socket.id + " connected");

  function myTurn(): boolean {
    if (players[currentPlayer] == me) {
      return true;
    } else {
      return false;
    }
  }

  socket.on("join", function(name: string) {
    let taken = false;
    for (let p of players) {
      if (p.name == name) {
        taken = true;
      }
    }
    if (me == undefined && !taken) {
      console.log(name + " joined, ID: " + socket.id);
      me = new Player(name, socket.id);
      players.push(me);
      updateClients();
      socket.emit("nameAvaliable")
    } else {
      console.log("Name: " + name + ", not avaliable");
      socket.emit("nameTaken");
    }
  });

  socket.on("startGame", function() {
    if (players.length >= 2) {
      newRound();
    } else {
      console.log("Not enough players to start");
    }
  });

  socket.on("check", function() {
    if (myTurn()) {
      console.log(me.name + " checked");
      check();
    } else {
      console.log("Not " + me.name + "'s turn");
    }
  });

  socket.on("raise", function(amount: number) {
    if (myTurn()) {
      console.log(me.name + " raised £" + amount);
      raise(amount);
    } else {
      console.log("Not " + me.name + "'s turn");
    }
  });

  socket.on("fold", function() {
    if (myTurn()) {
      console.log(me.name + " folded");
      fold();
    } else {
      console.log("Not " + me.name + "'s turn");
    }
  });

  socket.on("winnerIs", function(player: Player) {
    winnerIs(player);
  });

  socket.on("disconnect", function() {
    console.log(socket.id + " disconnected");
    players.splice(players.indexOf(me));
    me = undefined;
    updateClients();
  });
});

server.listen(3000, function() {
  console.log("Listening on port 3000");
});

function updateClients() {
  io.emit("update", new updateObject());
}

function clientMessage(player: Player, msg: string) {
  io.to(player.id).emit(msg);
}

// Object to pass to the clients when the game state changes
class updateObject {
  players: Player[];
  currentPlayer: number;
  dealer: number;
  potTotal: number;
  potPP: number;
  round: number;
  phase: number;

  constructor() {
    this.players = players;
    this.currentPlayer = currentPlayer;
    this.dealer = dealer;
    this.potTotal = potTotal;
    this.potPP = potPP;
    this.round = round;
    this.phase = phase;
  }
}



/*************************************/
/*          Poker Game Code          */
/*************************************/

let startingMoney = 100,
  bigBlind = 4;

let players: Player[] = [],
  currentPlayer = 0,
  dealer = -1,
  potTotal = 0,
  potPP = 0,
  round = 0,
  phase = 0;

class Player {
  name: string;
  id: string;
  money: number;
  inCurrentPot: number;
  folded: boolean;
  played: boolean;

  constructor(name: string, id: string, money?: number) {
    this.name = name;
    this.id = id;
    this.money = money || startingMoney;
    this.inCurrentPot = 0;
    this.folded = false;
    this.played = false;
  }

  pay(amount: number) {
    this.money -= amount;
    this.inCurrentPot += amount;
    potTotal += amount;
  }

  ready(): boolean {
    if (this.folded || (this.played && this.inCurrentPot == potPP)) {
      return true
    } else if (this.inCurrentPot > potPP) {
      console.error("Player " + this.name + " has more money in pot than total...");
    } else {
      return false;
    }
  } 
}

function nextPlayer() {
  currentPlayer++;
  if (currentPlayer >= players.length) {
    // console.log("Out of bounds with " + currentPlayer);
    currentPlayer = 0;
  }
  if (players[currentPlayer].folded) {
    // console.log(currentPlayer + " folded, skipping");
    nextPlayer();
  }
}

// Problem may be caused when someone is folded
function allReady(): boolean {
  for (let p of players) {
    if (!p.ready()) {
      return false;
    }
  }
  return true;
}

function folded(): number {
  let f = 0;
  for (let p of players) {
    if (p.folded) {
      f++;
    }
  }
  return f;
}

function check() {
  let p = players[currentPlayer];
  p.pay(potPP - p.inCurrentPot);
  p.played = true;
  nextPlayer();
  doTurn();
}

function raise(amount: number) {
  potPP += amount;
  let p = players[currentPlayer];
  p.pay(potPP - p.inCurrentPot);
  p.played = true;
  nextPlayer();
  doTurn();
}

function fold() {
  players[currentPlayer].folded = true;
  nextPlayer();
  doTurn();
}

function newRound() {
  round++;
  phase = 0;
  potTotal = 0;
  potPP = bigBlind;

  for (let p of players) {
    p.folded = false;
    p.inCurrentPot = 0;
    p.played = false;
  }

  // Make the dealer one more, then the player one more than him
  currentPlayer = dealer;
  nextPlayer();
  dealer = currentPlayer;
  console.log(players[dealer].name + " is dealer");
  nextPlayer();
  console.log(players[currentPlayer].name + " is SB");
  players[currentPlayer].pay(bigBlind/2);
  nextPlayer();
  console.log(players[currentPlayer].name + " is BB");
  players[currentPlayer].pay(bigBlind);
  console.log(players[currentPlayer+1].name + " is UTG");
  nextPlayer();

  doTurn();
}

function doTurn() {
  updateClients();
  if (folded() == players.length - 1) {
    console.log("Only one player left");
    // Find the remaining player and make them the winner
    for (let p of players) {
      if (!p.folded) {
        winnerIs(p);
      }
    }
  } else if (phase == 4) {
    console.log("The game has ended, " + players[0].name + " is choosing a winner");
    clientMessage(players[0], "chooseWinner");
  } else if (allReady()) {
    // Go into the next phase
    console.log("Everybody is ready, going into the next phase");
    phase++;
    currentPlayer = dealer;

    for (let p of players) {
      p.played = false;
    }
    doTurn();
  } else {
    updateClients();
    console.log("Player " + players[currentPlayer].name + " has to choose");
    clientMessage(players[currentPlayer], "choose");
  }
}

function winnerIs(player: Player) {
  console.log("Winner is " + player.name);
  player.money += potTotal;
  newRound();
}