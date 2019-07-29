const express = require("express");
const app = express();
app.use(express.json());
app.listen(3002, () =>
  console.log("Test subscriber server running on port 3002")
);

const request = require("request");
function respondWithHi(threadID) {
  console.log(`Sending hi to thread: ${threadID}`);
  request(
    {
      method: "POST",
      uri: "http://localhost:3000/message",
      body: {
        password: "scoobisdead",
        message: "Hello there!",
        threadID,
        delayMillisMin: 6000,
        delayMillisMax: 10000
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
    respondWithHi(req.body.threadID);
    res.send("Success!");
  } catch (error) {
    res.send("Failure!");
  }
});
