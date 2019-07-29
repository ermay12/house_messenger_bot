const {
  sendMessageToFacebook,
  getFacebookThreads,
  getMessagesFromFacebook,
  logInToFacebook,
  sendTypingToFacebook
} = require("./test_facebook_api.js");
const {
  processNewSubscriber,
  getSubscribers,
  deleteSubscriber
} = require("./subscribers.js");
const { processNewSchedule } = require("./schedule.js");
const { getRandomInt } = require("./utility.js");
const PASSWORD = "scoobisdead";
const FIRSTNAME = "Sake";
const LASTNAME = "Jr";
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();
app.use(express.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.listen(3000, () => console.log("Server running on port 3000"));

function sendMessageToSubscriber(subscriber, message) {
  console.log(`sending post to ${subscriber.address} message: ${message}`);
  request(
    {
      method: "POST",
      uri: subscriber.address,
      headers: { "x-api-key": subscriber.apiKey },
      body: {
        message: message,
        threadID: subscriber.threadID
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
  const { password, message, threadID } = req.body;
  let delayMillisMin = parseInt(req.body.delayMillisMin);
  let delayMillisMax = parseInt(req.body.delayMillisMax);

  if (password == PASSWORD) {
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
  } else {
    return "Failure, Invalid password.";
  }
}

function processNewMessage(message, threadID) {
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
        new RegExp(`^(${subscriber.trigger})`, "i").test(message)
      ) {
        sendMessageToSubscriber(subscriber, message);
      }
    });
  }
}

app.get("/", function(req, res) {
  try {
    res.render("index", {
      threads: getFacebookThreads(),
      subscribers: getSubscribers()
    });
  } catch (error) {
    res.send("Failure: " + error);
  }
});
app.post("/subscribe", function(req, res) {
  try {
    processNewSubscriber(req);
    res.redirect("/");
  } catch (error) {
    res.send("Failure");
  }
});
app.post("/delete", function(req, res) {
  try {
    deleteSubscriber(req);
    res.redirect("/");
  } catch (error) {
    res.send("Failure: " + error);
  }
});
app.post("/message", (req, res) => {
  try {
    res.send(processSendMessage(req));
  } catch (error) {
    res.send("Failure: " + error);
  }
});

app.post("/schedule", (req, res) => {
  try {
    res.send(processNewSchedule(req));
  } catch (error) {
    res.send("Failure: " + error);
  }
});

logInToFacebook({}, (err, api) => {
  if (err) {
    console.log("Failed to log into facebook.");
    return;
  }
  console.log("Successfully logged in to facebook.");
  getMessagesFromFacebook(processNewMessage);
});
