const login = require("facebook-chat-api");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const request = require("request");
var subscribers = require("./subscribers.json");
const app = express();
app.use(express.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.listen(3000, () => console.log("Server running on port 3000"));

function getRandomInt(min, max) {
  return Math.floor(Math.random() * Math.floor(max)) + min;
}

function sendMessage(message, threadID) {
  console.log(`sending message to: ${threadID} message: ${message}`);
}

function getThreads() {
  return [
    { id: "21", name: "Eric Maynard" },
    { id: "22", name: "BBC" },
    { id: "23", name: "Sake Jr." }
  ];
}

function processNewSubscriber(req, res) {
  let subscriber = {
    name: req.body.name,
    owner: req.body.owner,
    threadID: req.body.threadID,
    trigger: req.body.trigger,
    address: req.body.address,
    apiKey: req.body.apiKey
  };
  subscribers = subscribers.filter(s => s.name !== subscriber.name);
  subscribers.push(subscriber);
  fs.writeFileSync("./subscribers.json", JSON.stringify(subscribers));
}

function processSendMessage(req, res) {
  setTimeout(() => {
    sendMessage(req.body.message, req.body.threadID);
  }, getRandomInt(5000, 10000));
  res.send(req.body.message);
}

function processNewMessage(message, threadID) {
  message = message.trim();
  //if (
  // message.startsWith("@Sake") ||
  // message.startsWith("@Sake Jr") ||
  // message.startsWith("@Sake Jr House")
  //) {
  //message = message.replace(/^(@Sake Jr House|@Sake Jr|@Sake)/i, "").trim();
  subscribers.forEach(subscriber => {
    if (
      threadID === subscriber.threadID &&
      message.startsWith(subscriber.trigger)
    ) {
      console.log("about to send a message");
      request(
        {
          method: "POST",
          uri: subscriber.address,
          headers: { "x-api-key": subscriber.apiKey },
          form: {
            message: message,
            threadID: subscriber.threadID
          }
        },
        function(error, response, body) {
          if (error) {
            return console.error("get failed:", error);
          }
          console.log("Successfully sent. Server responded with:", body);
        }
      );
    }
  });
  //}
}

function deleteSubscriber(req, res) {
  let deleteSubscriber = req.body.name;
  subscribers = subscribers.filter(s => s.name !== deleteSubscriber);
  fs.writeFileSync("./subscribers.json", JSON.stringify(subscribers));
}

app.get("/", function(req, res) {
  res.render("index", {
    threads: getThreads(),
    subscribers: subscribers
  });
});
app.post("/subscribe", function(req, res) {
  processNewSubscriber(req, res);
  res.redirect("/");
});
app.post("/delete", function(req, res) {
  deleteSubscriber(req, res);
  res.redirect("/");
});
app.post("/message", processSendMessage);

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

function getMessages() {
  setTimeout(() => {
    readline.question(`Send your message:`, message => {
      console.log(`recieved ${message}`);
      processNewMessage(message, "22");
      getMessages();
    });
  }, 1000);
}

getMessages();

/*
login({ email: "sake.jrhouse", password: "sakejr" }, (err, api) => {
  if (err) return console.error(err);
  app.get("/", (req, res) => {
    res.send("HEY!");
  });
  app.post("/", function(req, res) {
    processPost(req, res, api);
  });
  api.listen((err, event) => {
    if (err) console.log(err);
    console.log("recieved event");
    if (event.type === "message") {
      console.log("new message");
      processMessage(event, api);
    }
  });
});
*/
