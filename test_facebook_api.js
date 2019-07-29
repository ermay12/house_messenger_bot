//const login = require("facebook-chat-api");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

exports.sendMessageToFacebook = function(message, threadID) {
  console.log(`sending message to: ${threadID} message: ${message}`);
};
exports.sendTypingToFacebook = function(threadID) {
  console.log(`sending typing to: ${threadID}`);
};
exports.getFacebookThreads = function() {
  return [
    { id: "21", name: "Eric Maynard" },
    { id: "22", name: "BBC" },
    { id: "23", name: "Sake Jr." }
  ];
};

const express = require("express");
const app = express();
app.use(express.json());
app.listen(3001, () =>
  console.log("Test message receiver server running on port 3001")
);

exports.getMessagesFromFacebook = function(callback) {
  app.post("/", function(req, res) {
    try {
      callback(req.body.message, req.body.threadID);
      res.send("Success!");
    } catch (error) {
      res.send("Failure!");
    }
  });
};

exports.logInToFacebook = function(credentials, callback) {
  callback(null, null);
};

/*
login({ email: "sake.jrhouse", password: "sakejr" }, (err, api) => {
  if (err) return console.error(err);
  app.get("/", (req, res) => {
    res.send("HEY!");
  });
  app.post("/", function(req, res) {
    processPost(req, res, api);
  });
  api.listen((err, event) => {
    if (err) console.log(err);
    console.log("recieved event");
    if (event.type === "message") {
      console.log("new message");
      processMessage(event, api);
    }
  });
});
*/
