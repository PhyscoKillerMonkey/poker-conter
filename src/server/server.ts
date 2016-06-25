/// <reference path="../../typings/index.d.ts" />

import express = require("express");
let app = express();

import http = require("http");
let server = http.createServer(app);
import socketio = require("socket.io");
let io = socketio(server);

import { Player, PokerManager } from "./poker";

// Setup the public folder for the web server
app.use(express.static("public"));

app.get("/", function(req, res) {
  let filename = "index.html";
  res.sendFile(__dirname + "/" + filename, function(err) {
    if (err) {
      console.error(err);
      res.status(err.status).end();
    }
  });
});

server.listen(3000, function() {
  console.log("Listening on port 3000");
});



let users: {[name: string]: {id: string, socket: SocketIO.Socket, room: string}} = {};
let rooms: {[name: string]: Room} = {};

io.on("connection", function(socket) {
  console.log("ID " + socket.id + " is connecting...");
  let userName = undefined;

  socket.on("disconnect", function() {
    console.log("User '" + userName + "', ID '" + socket.id + "' disconnected");
    if (userName != undefined && users[userName].room != undefined) {
      console.log("User " + userName + " is leaving room " + users[userName].room);
      rooms[users[userName].room].leave(socket.id);
    }
    users[userName] = undefined;
    roomUpdate();
  });

  socket.on("getName", function(data) {
    if (!users[data.name]) {
      users[data.name] = { id: socket.id, socket: socket, room: undefined }
      userName = data.name;
      socket.emit("nameStatus", { avaliable: true });
      roomUpdate(socket);
      console.log("User '" + userName + "' connected");
    } else {
      socket.emit("nameStatus", { avaliable: false });
    }
  });

  socket.on("joinRoom", function(data) {
    // Only allow client to connect to one room
    if (users[userName].room == undefined) {
      socket.join(data.room);
      users[userName].room = data.room;
      if (rooms[data.room] == undefined) {
        rooms[data.room] = new Room(data.room);
      }
      rooms[data.room].join(userName, socket.id);
      roomUpdate();
      rooms[data.room].gameUpdate();
    }
  });
});

function roomUpdate(socket?: SocketIO.Socket) {
  let rooms: {[room: string]: string[]} = {};

  for (let r in io.sockets.adapter.rooms) {
    if (r.substr(0, 2) != "/#") {
      let sockets: string[] = [];
      for (let user in io.sockets.adapter.rooms[r].sockets) {
        sockets.push(user);
      }
      rooms[r] = sockets;
    }
  }

  if (socket) {
    socket.emit("roomUpdate", rooms);
  } else {
    io.sockets.emit("roomUpdate", rooms);
  }
}

class Room {
  name: string;
  game: PokerManager;
  inProgress = false;

  constructor(name: string) {
    this.name = name;
    this.game = new PokerManager(this);
  }

  join(name: string, id: string): Player {
    let player = new Player(name, id, this.game.startingMoney);
    this.game.players.push(player);
    return player;
  }

  leave(id: string) {
    let players = this.game.players;
    for (let p of players) {
      if (p.id == id) {
       players.splice(players.indexOf(p));
      }
    }
    this.gameUpdate();
  }

  startGame() {

  }

  gameUpdate() {
    io.to(this.name).emit("update", {
      players: this.game.players,
      currentPlayer: this.game.currentPlayer,
      dealer: this.game.dealer,
      potTotal: this.game.potTotal,
      potPP: this.game.potPP,
      round: this.game.round
    });
  }
}