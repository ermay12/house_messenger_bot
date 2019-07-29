const fs = require("fs");
var scheduledEvents = require("./schedule.json");

exports.processNewSchedule = function(req) {
  let scheduledEvent = {
    name: req.body.name,
    owner: req.body.owner,
    address: req.body.address,
    apiKey: req.body.apiKey,
    data: req.body.data
  };
  scheduledEvents = scheduledEvents.filter(s => s.name !== scheduledEvent.name);
  scheduledEvents.push(scheduledEvent);
  fs.writeFileSync("./schedule.json", JSON.stringify(scheduledEvents));
};

exports.getScheduledEvents = function() {
  return scheduledEvents;
};

function deleteScheduledEvent(name) {
  scheduledEvents = scheduledEvents.filter(s => s.name !== name);
  fs.writeFileSync("./schedule.json", JSON.stringify(scheduledEvents));
}

exports.loadScheduledEvents = function() {
  return scheduledEvents;
};
