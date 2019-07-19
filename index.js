const login = require("facebook-chat-api");
const express = require("express");
const fs = require("fs");
var subscribers = require("./subscribers.json");
const app = express();
app.use(express.json());
app.listen(3000, () => console.log("Server running on port 3000"));

function processPost(req, res) {
  let message = req.body;
  if (message.type === "config") {
    res.set({
      "Content-Type": "application/json"
    });
    res.send(JSON.stringify(subscribers));
  }
  console.log(message);
  res.send("success");
  //api.sendMessage(message.body, message.threadID);
}

function processMessage(event, api) {
  let message = event.body.trim();
  if (
    message.startsWith("@Sake Jr House") ||
    message.startsWith("@Sake Jr") ||
    message.startsWith("@Sake Jr House")
  ) {
    message = message.replace(/^(@Sake Jr House|@Sake Jr|@Sake)/i, "").trim();
    if (message.startsWith("hook")) {
      message = message.replace(/^(hook)/i, "").trim();
      let name = message.slice(0, message.indexOf(" "));
      message = message.slice(message.indexOf(" ") + 1).trim();
      let triggers = JSON.parse(message.slice(0, message.indexOf("]") + 1));
      let address = message.slice(message.indexOf("]") + 1).trim();
      let subscriber = {
        name: name,
        owner: event.senderID,
        threadID: event.threadID,
        triggers: triggers,
        address: address
      };
      subscribers = subscribers.filter(s => s.name !== subscriber.name);
      subscribers.push(subscriber);
      fs.writeFileSync("./subscribers.json", JSON.stringify(subscribers));

      api.sendMessage("`" + event.threadID + "`", event.threadID);
      return;
    }
    if (message.startsWith("config")) {
      console.log("config request");
      api.sendMessage(
        "`" +
          JSON.stringify(
            subscribers.filter(s => s.threadID === event.threadID)
          ),
        event.threadID + "`"
      );
      return;
    }
  }
}
app.post("/", function(req, res) {
  processPost(req, res);
});
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
