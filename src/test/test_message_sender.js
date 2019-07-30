const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

const request = require("request");

function sendMessage(message, threadID, person) {
  console.log(`Sending ${message} to ${threadID}`);
  request(
    {
      method: "POST",
      uri: "http://localhost:3001/",
      body: { message, threadID, person },
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

function getMessages() {
  setTimeout(() => {
    readline.question(`What is your message:`, message => {
      readline.question(`Enter thread id:`, threadID => {
        readline.question(`Enter person:`, person => {
          sendMessage(message, threadID, person);
          getMessages();
        });
      });
    });
  }, 1000);
}

getMessages();
