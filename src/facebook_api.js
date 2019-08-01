const login = require("facebook-chat-api");
const threads = require("./persisted_data/threads.json");
const users = require("./persisted_data/users.json");
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
