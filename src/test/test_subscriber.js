const express = require("express");
const app = express();
app.use(express.json());
app.listen(3002, () =>
  console.log("Test subscriber server running on port 3002")
);

const request = require("request");
function scheduleMyself(threadID) {
  console.log(`Scheduling myself on thread: ${threadID}`);
  request(
    {
      method: "POST",
      uri: "http://localhost:3000/schedule",
      body: {
        name: "my scheduled event",
        owner: "Eric",
        address: "http://localhost:3002/schedule",
        apiKey: "akfhaofes",
        password: "scoobisdead",
        data: JSON.stringify({ threadID }),
        cron: "*/10 * * * * *",
        delete: true
      },
      json: true
    },
    function(error, response, body) {
      if (error) {
        return console.error("Failed to schedule:", error);
      }
      console.log("Successfully scheduled. Server responded with:", body);
    }
  );
}

function respondWithHi(threadID) {
  console.log(`Sending hi to thread: ${threadID}`);
  request(
    {
      method: "POST",
      uri: "http://localhost:3000/message",
      body: {
        password: "scoobisdead",
        message: "Immediate Response!",
        threadID,
        delayMillisMin: 0,
        delayMillisMax: 1
      },
      json: true
    },
    function(error, response, body) {
      if (error) {
        return console.error("Failed to send:", error);
      }
      console.log("Successfully sent. Server responded with:", body);
    }
  );
}
function respondWithEvent(threadID) {
  console.log(`Sending event to thread: ${threadID}`);
  request(
    {
      method: "POST",
      uri: "http://localhost:3000/message",
      body: {
        password: "scoobisdead",
        message: "Scheduled response!",
        threadID,
        delayMillisMin: 10000,
        delayMillisMax: 20000
      },
      json: true
    },
    function(error, response, body) {
      if (error) {
        return console.error("Failed to send:", error);
      }
      console.log("Successfully sent. Server responded with:", body);
    }
  );
}

app.post("/", function(req, res) {
  try {
    console.log("New Message!");
    console.log(`Message: ${req.body.message}`);
    console.log(`threadID: ${req.body.threadID}`);
    console.log(`person: ${req.body.person}`);
    respondWithHi(req.body.threadID);
    scheduleMyself(req.body.threadID);
    res.send("Success!");
  } catch (error) {
    res.send("Failure!");
  }
});

app.post("/schedule", function(req, res) {
  try {
    console.log("Schedule Event!");
    console.log(`Data: `);
    console.dir(req.body.data);
    respondWithEvent(req.body.data.threadID);
    res.send("Success!");
  } catch (error) {
    console.log("failure: " + error);
    res.send("Failure!: " + error);
  }
});
