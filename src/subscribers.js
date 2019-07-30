const fs = require("fs");
var subscribers = require("./persisted_data/subscribers.json");

exports.processNewSubscriber = function(req) {
  let subscriber = {
    name: req.body.name,
    owner: req.body.owner,
    threadID: req.body.threadID,
    trigger: req.body.trigger,
    subscribeAll: req.body.subscribeAll,
    address: req.body.address,
    apiKey: req.body.apiKey
  };
  subscribers = subscribers.filter(s => s.name !== subscriber.name);
  subscribers.push(subscriber);
  fs.writeFileSync("./subscribers.json", JSON.stringify(subscribers));
};

exports.getSubscribers = function() {
  return subscribers;
};

exports.deleteSubscriber = function(req) {
  let deleteSubscriber = req.body.name;
  subscribers = subscribers.filter(s => s.name !== deleteSubscriber);
  fs.writeFileSync("./subscribers.json", JSON.stringify(subscribers));
};
