import express = require("express");
var app = express();

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

app.listen(3000, function() {
  console.log("Listening on port 3000");
});