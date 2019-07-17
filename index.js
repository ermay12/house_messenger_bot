const login = require("facebook-chat-api");
const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('HEY!')
});
app.listen(3000, () => console.log('Server running on port 3000'));

// Create simple echo bot
login({email: "sake.jrhouse", password: "sakejr"}, (err, api) => {
    if(err) return console.error(err);

    api.listen((err, message) => {
        api.sendMessage(message.body, message.threadID);
    });
});
