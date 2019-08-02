const fs = require("fs");
var threads = require("./persisted_data/threads.json");
var users = require("./persisted_data/users.json");
const { Client } = require("libfb");
const client = new Client();

exports.sendMessageToFacebook = function(message, threadID) {
  console.log(`sending message to: ${threadID} message: ${message}`);
  client.sendMessage(threadID, message);
};
exports.sendTypingToFacebook = function(threadID) {
  console.log(`sending typing to: ${threadID}`);
  client.sendTypingState(threadID, true);
};
exports.getFacebookThreads = function() {
  return threads;
};

function getSender(senderID, callback) {
  user = users.find(user => user.senderID === senderID);
  if (user === undefined) {
    callback("Unknown");
    return;
  }
  callback(user.name);
}
exports.getMessagesFromFacebook = function(callback) {
  client.on("message", message => {
    console.log("Got a message!");
    console.log(message.message);
    getSender(message.authorId, senderName => {
      callback(message.message, message.threadId, senderName);
    });
  });
};

exports.logInToFacebook = function(credentials, callback) {
  client.login(credentials.email, credentials.password).then(() => {
    callback(null);
  });
};

exports.createFBThread = function(req) {
  let thread = {
    id: req.body.id,
    name: req.body.name
  };
  threads = threads.filter(t => t.id !== thread.id);
  threads.push(threads);
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
