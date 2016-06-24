/// <reference path="../../typings/index.d.ts" />

import express = require("express");
let app = express();

import http = require("http");
let server = http.createServer(app);
import socketio = require("socket.io");
let io = socketio(server);

import { Player, PokerManager } from "./poker.ts";

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



let users: {[name: string]: {id: string, socket: SocketIO.Socket, room: string}} = {};

io.on("connection", function(socket) {
  console.log("ID " + socket.id + " is connecting...");
  let userName = undefined;
  // updateRooms(socket);

  socket.on("getName", function(data) {
    if (!users[data.name]) {
      users[data.name] = { id: socket.id, socket: socket, room: undefined }
      userName = data.name;
      socket.emit("nameStatus", { avaliable: true });
    } else {
      socket.emit("nameStatus", { avaliable: false });
    }
  });

  socket.on("joinRoom", function(data) {
    if (users[userName].room == undefined) {
      socket.join(data.room);
      users[userName].room = data.room;
      // updateRooms();
    }
  });
});

function roomUpdate(socket: SocketIO.Socket)