const fs = require("fs");
var threads = require("../persisted_data/threads.json");
var users = require("../persisted_data/users.json");
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
  return threads;
  /*
  fbAPI.getThreadList(2, null, ["INBOX"], (err, list) => {
    if (err) return console.error(err);
    cachedThreadList = list.map(thread => ({
      id: thread.threadID,
      name: thread.name
    }));
  });
  return cachedThreadList;
  */
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
      callback(req.body.message, req.body.threadID, req.body.person);
      res.send("Success!");
    } catch (error) {
      res.send("Failure!");
    }
  });
};

exports.logInToFacebook = function(credentials, callback) {
  callback(null);
};

exports.createFBThread = function(req) {
  let thread = {
    id: req.body.id,
    name: req.body.name
  };
  threads = threads.filter(t => t.id !== thread.id);
  threads.push(thread);
  fs.writeFileSync("./persisted_data/threads.json", JSON.stringify(threads));
};

exports.deleteFBThread = function(req) {
  let deleteID = req.body.id;
  threads = threads.filter(t => t.id !== deleteID);
  fs.writeFileSync("./persisted_data/threads.json", JSON.stringify(threads));
};

exports.createFBUser = function(req) {
  let user = {
    id: req.body.id,
    name: req.body.name
  };
  users = users.filter(u => u.id !== user.id);
  users.push(user);
  fs.writeFileSync("./persisted_data/users.json", JSON.stringify(users));
};

exports.deleteFBUser = function(req) {
  let deleteID = req.body.id;
  users = users.filter(u => u.id !== deleteID);
  fs.writeFileSync("./persisted_data/users.json", JSON.stringify(users));
};

exports.getFBUsers = function() {
  return users;
};
