const login = require("facebook-chat-api");

// Create simple echo bot
login({email: "sake.jrhouse", password: "sakejr"}, (err, api) => {
    if(err) return console.error(err);

    api.listen((err, message) => {
        api.sendMessage(message.body, message.threadID);
    });
});
