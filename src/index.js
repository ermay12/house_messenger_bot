const config = require("../config.json");
const {
  sendMessageToFacebook,
  getFacebookThreads,
  getMessagesFromFacebook,
  logInToFacebook,
  sendTypingToFacebook
} = config.test
  ? require("./test/test_facebook_api.js")
  : require("./facebook_api.js");
const {
  processNewSubscriber,
  getSubscribers,
  deleteSubscriber
} = require("./subscribers.js");
const {
  processNewSchedule,
  getScheduledEvents,
  deleteScheduledEvent
} = require("./schedule.js");
const { getRandomInt } = require("./utility.js");
const PASSWORD = config.password;
const FIRSTNAME = config.firstName;
const LASTNAME = config.lastName;
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();
app.use(express.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.listen(config.port, () =>
  console.log(`Server running on port ${config.port}`)
);

function sendMessageToSubscriber(subscriber, message, person) {
  console.log(`sending post to ${subscriber.address} message: ${message}`);
  request(
    {
      method: "POST",
      uri: subscriber.address,
      headers: { "x-api-key": subscriber.apiKey },
      body: {
        message,
        threadID: subscriber.threadID,
        person
      },
      json: true
    },
    function(error, response, body) {
      if (error) {
        return console.error("get failed:", error);
      }
      console.log("Successfully sent. Server responded with:", body);
    }
  );
}

const CHAR_PER_MINUTE = 200; //average typing speed
const MILLIS_PER_MINUTE = 60 * 1000;

function processSendMessage(req) {
  const { message, threadID } = req.body;
  let delayMillisMin = parseInt(req.body.delayMillisMin);
  let delayMillisMax = parseInt(req.body.delayMillisMax);

  const typingMillis = (message.length / CHAR_PER_MINUTE) * MILLIS_PER_MINUTE;
  const delayMillis = Math.max(
    getRandomInt(delayMillisMin, delayMillisMax) - typingMillis,
    0
  );
  setTimeout(() => {
    sendTypingToFacebook(threadID);
    setTimeout(() => {
      sendMessageToFacebook(message, threadID);
    }, typingMillis);
  }, delayMillis);
  return `Message send initiated.  Delay = ${delayMillis} Typing delay = ${typingMillis}`;
}

function processNewMessage(message, threadID, person) {
  //send message to subscribers that listen to everything
  getSubscribers().forEach(subscriber => {
    if (threadID === subscriber.threadID && subscriber.subscribeAll) {
      sendMessageToSubscriber(subscriber, message, person);
    }
  });

  message = message.trim();
  //check if the message starts with the bot's name (case insensitive)
  if (
    new RegExp(`^(@${FIRSTNAME + " " + LASTNAME}|@${FIRSTNAME})`, "i").test(
      message
    )
  ) {
    //remove the bots name from the string and trim whitespace from ends
    message = message
      .replace(
        new RegExp(`^(@${FIRSTNAME + " " + LASTNAME}|@${FIRSTNAME})`, "i"),
        ""
      )
      .trim();
    getSubscribers().forEach(subscriber => {
      //check that the message is in the right thread and that the message begins with the trigger word (case insensitive)
      if (
        threadID === subscriber.threadID &&
        new RegExp(`^(${subscriber.trigger})`, "i").test(message) &&
        !subscriber.subscribeAll
      ) {
        sendMessageToSubscriber(subscriber, message, person);
      }
    });
  }
}

function authenticate(req, res) {
  if (req.body.password !== PASSWORD) {
    res.send("Invalid Password!");
    return false;
  }
  return true;
}

app.get("/", function(req, res) {
  try {
    res.render("index", {
      threads: getFacebookThreads(),
      subscribers: getSubscribers(),
      scheduledEvents: getScheduledEvents()
    });
  } catch (error) {
    res.send("Failure: " + error);
  }
});
app.post("/subscribe", function(req, res) {
  if (authenticate(req, res) == false) {
    return;
  }
  try {
    processNewSubscriber(req);
    res.redirect("/");
  } catch (error) {
    res.send("Failure");
  }
});
app.post("/delete", function(req, res) {
  if (authenticate(req, res) == false) {
    return;
  }
  try {
    deleteSubscriber(req);
    res.redirect("/");
  } catch (error) {
    res.send("Failure: " + error);
  }
});
app.post("/message", (req, res) => {
  if (authenticate(req, res) == false) {
    return;
  }
  try {
    res.send(processSendMessage(req));
  } catch (error) {
    res.send("Failure: " + error);
  }
});

app.post("/schedule", (req, res) => {
  if (authenticate(req, res) == false) {
    return;
  }
  try {
    res.send(processNewSchedule(req));
  } catch (error) {
    res.send("Failure: " + error);
  }
});
app.post("/deleteschedule", function(req, res) {
  if (authenticate(req, res) == false) {
    return;
  }
  try {
    deleteScheduledEvent(req);
    res.redirect("/");
  } catch (error) {
    res.send("Failure: " + error);
  }
});

logInToFacebook({ email: config.fbEmail, password: config.fbPassword }, err => {
  if (err) return console.error("Failed to log into facebook.");
  console.log("Successfully logged in to facebook.");
  getMessagesFromFacebook(processNewMessage);
});
