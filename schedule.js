const fs = require("fs");
const CronJob = require("cron").CronJob;
var scheduledEvents = require("./schedule.json");
var scheduledJobs = {};
var _ = require("lodash");

function scheduleEvent(scheduledEvent) {
  try {
    console.log(`scheduling ${scheduledEvent.name}`);
    const job = new CronJob(scheduledEvent.cron, function() {
      alertSubscriber(scheduledEvent);
    });
    scheduledJobs[scheduledEvent.name] = job;
    job.start();
  } catch (error) {
    console.log("Failed to schedule event:" + error);
  }
}

exports.processNewSchedule = function(req) {
  let scheduledEvent = {
    name: req.body.name,
    owner: req.body.owner,
    address: req.body.address,
    apiKey: req.body.apiKey,
    cron: req.body.cron,
    data: JSON.parse(req.body.data),
    delete: req.body.delete
  };
  scheduledEvents = scheduledEvents.filter(s => s.name !== scheduledEvent.name);
  scheduledEvents.push(scheduledEvent);
  fs.writeFileSync("./schedule.json", JSON.stringify(scheduledEvents));
  scheduleEvent(scheduledEvent);
  return "Scheduled!";
};

function deleteScheduledEvent(scheduledEventName) {
  let eventsToDelete = scheduledEvents.filter(
    s => s.name === scheduledEventName
  );
  scheduledEvents = scheduledEvents.filter(s => s.name !== scheduledEventName);
  fs.writeFileSync("./schedule.json", JSON.stringify(scheduledEvents));
  if (eventsToDelete.length > 0) {
    scheduledJobs[eventsToDelete[0].name].stop();
    delete scheduledJobs[eventsToDelete[0].name];
  }
}

exports.deleteScheduledEvent = req => deleteScheduledEvent(req.body.name);

exports.getScheduledEvents = function() {
  return scheduledEvents;
};

const request = require("request");

function alertSubscriber(scheduledEvent) {
  console.log("About to alert subscriber");
  request(
    {
      method: "POST",
      uri: scheduledEvent.address,
      headers: { "x-api-key": scheduledEvent.apiKey },
      body: {
        data: scheduledEvent.data
      },
      json: true
    },
    function(error, response, body) {
      if (scheduledEvent.delete) {
        deleteScheduledEvent(scheduledEvent.name);
      }
      if (error) {
        return console.error("Failed to alert scheduled subscriber:", error);
      }
      console.log("Successfully alerted scheduled subscriber.");
    }
  );
}

function rescheduleAllEvents() {
  scheduledEvents.forEach(scheduledEvent => {
    scheduleEvent(scheduledEvent);
  });
}

rescheduleAllEvents();
