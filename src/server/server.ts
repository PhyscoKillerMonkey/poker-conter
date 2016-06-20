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
    console.log(name + " joined, ID: " + socket.id);
    me = new Player(name, socket.id);
    players.push(me);
    updateClients();
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

  socket.on("disconnect", function() {
    console.log(socket.id + " disconnected");
    players.splice(players.indexOf(me));
    updateClients();
  });
});

server.listen(3000, function() {
  console.log("Listening on port 3000");
});

function updateClients() {
  io.emit("update", new updateObject());
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
  dealer = 0,
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

  constructor(name: string, id: string, money?: number) {
    this.name = name;
    this.id = id;
    this.money = money || startingMoney;
    this.inCurrentPot = 0;
    this.folded = false;
  }

  pay(amount: number) {
    this.money -= amount;
    this.inCurrentPot += amount;
    potTotal += amount;
  }

  ready(): boolean {
    if (this.inCurrentPot == potPP) {
      return true
    } else if (this.inCurrentPot > potPP) {
      console.error("Player " + name + " has more money in pot than total...");
    }
    return false;
  } 
}

function nextPlayer() {
  currentPlayer++;
  if (currentPlayer >= players.length) {
    currentPlayer = 0;
  }
  if (players[currentPlayer].folded) {
    nextPlayer();
  }
}

// Problem may be caused when someone is folded
function allReady(): boolean {
  for (let p of players) {
    if (!p.ready) {
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
  nextPlayer();
  doTurn();
}

function raise(amount: number) {
  potPP += amount;
  let p = players[currentPlayer];
  p.pay(potPP - p.inCurrentPot);
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
  potPP = 0;

  for (let p of players) {
    p.folded = false;
    p.inCurrentPot = 0;
  }

  // Make the dealer one more, then the player one more than him
  currentPlayer = dealer;
  nextPlayer();
  dealer = currentPlayer;
  nextPlayer();
  players[currentPlayer].pay(bigBlind/2);
  nextPlayer();
  players[currentPlayer].pay(bigBlind);
  nextPlayer();

  doTurn();
}

function doTurn() {
  updateClients();
  if (folded() == players.length - 1) {
    console.log("Only one player left");
  } else if (phase == 4) {
    console.log("The game has ended, choose a winner");
  } else if (allReady()) {
    // Go into the next phase
    phase++;
    currentPlayer = -1;
    nextPlayer();
    doTurn();
  } else {
    nextPlayer();
    console.log("Player " + players[currentPlayer].name + " has to choose");
  }
}