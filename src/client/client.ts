/// <reference path="../../typings/index.d.ts" />

var socket = io();

socket.emit("join", "Username");