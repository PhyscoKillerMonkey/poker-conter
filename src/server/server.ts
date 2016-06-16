/// <reference path="../../typings/index.d.ts" />

import express = require("express");
let app = express();
import http = require("http");
let server = http.createServer(app);
import socketio = require("socket.io");
let io = socketio(server);

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
  console.log("A user connected");

  socket.on("disconnect", function() {
    console.log("User disconnected");
  });
});

server.listen(3000, function() {
  console.log("Listening on port 3000");
});