const fs = require("fs");
const login = require("facebook-chat-api");
var threads = require("./persisted_data/threads.json");
var users = require("./persisted_data/users.json");
var fbAPI = null;
var cachedThreadList = [];

exports.sendMessageToFacebook = function(message, threadID) {
  console.log(`sending message to: ${threadID} message: ${message}`);
  fbAPI.sendMessage({ body: message }, threadID);
};
exports.sendTypingToFacebook = function(threadID) {
  console.log(`sending typing to: ${threadID}`);
  fbAPI.sendTypingIndicator(threadID);
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

function getSender(senderID, callback) {
  user = users.find(user => user.senderID === senderID);
  if (user === undefined) {
    callback("Unknown");
    return;
  }
  callback(user.name);
  /*
  fbAPI.getUserInfo(senderID, (err, obj) => {
    if (err) return console.error(err);
    callback(obj.name);
  });
  */
}
exports.getMessagesFromFacebook = function(callback) {
  fbAPI.listen((err, message) => {
    if (err) return console.error(err);
    console.log("new message");
    getSender(message.senderID, senderName => {
      callback(message.body, message.threadID, senderName);
    });
  });
};
exports.logInToFacebook = function(credentials, callback) {
  login(credentials, (err, api) => {
    if (err) return console.error(err);
    fbAPI = api;
    exports.getFacebookThreads();
    callback(err);
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
