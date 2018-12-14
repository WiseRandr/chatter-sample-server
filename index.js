const app = require("express")();
const http = require("http");
const socketIo = require('socket.io');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const port = process.env.PORT || 8383;

const chatUser = require('./model/chatuser');
const Message = require('./model/chat');

const route = require('./route');

app.use(route);

const server = http.createServer(app);
const io = socketIo(server);

// Make a mongo connection first
mongoose.connect('mongodb://wise:wise0123@ds047474.mlab.com:47474/chatter');
mongoose.connection.once('open', () => {console.log('Mongo connected')}).on('error', (err) => {console.log(err)});

io.on('connection', socket => {
    socket.on('register', ({name, username, email, password}) => {
        console.log('Registration proccess ...');
        chatUser.findOne({email: email}).then((res) => {
            if(res === null || (res.username !== username && res.email !== email)) {
                var chatter = new chatUser({
                    name: name,
                    username: username,
                    email: email,
                    password: password
                });

                chatter.save().then(() => {
                    console.log('Saving ...');
                    socket.emit('registered', {
                        name: name,
                        username: username,
                        email: email,
                        password: password
                    });
                });
            }
        });
    });
    
    socket.on('login', ({email, password}) => {
        console.log('Login process ...');
        chatUser.findOne({email: email, password: password}).then((res) => {
            console.log('login proccess finished');
            io.sockets.emit('logged', res);
        });
    });

    socket.on('updateUser', (user) => {
        console.log("Updating process ...");
        chatUser.findOne({username: user.username}).then((res) => {
            res.name = user.name ? user.name : res.name;
            res.username = user.username ? user.username : res.username;
            res.email = user.email ? user.email : res.email;

            var newUser = new chatUser(res);
            newUser.save().then(()=>{
                console.log('Updated')
                io.sockets.emit('updatedUser', res);
            });
        });
    });

    socket.on('sendMessage', (message) => {
        message.time = Date.now();
        var msg = new Message(message);
        msg.save().then(() => {
            io.sockets.emit('receiveMessage', message);
        });
    });

    socket.on('preparingChat', function() {
        Message.find({}).then(messages => {
            var configs = {};
            configs.messages = messages;

            io.sockets.emit('finished', configs);
        });
    });

    socket.on('typing', name => socket.broadcast.emit('receiveTyping', name));
});

server.listen(port, () => {console.log('Express server is running on port', port)});