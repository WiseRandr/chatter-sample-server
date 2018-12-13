const app = require("express")();
const http = require("http");
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const port = 8383;

const chatUser = require('./model/chatuser');

const route = require('./route');

app.use(route);

const server = http.createServer(app);
const io = socketIo(server);

// Make a mongo connection first
mongoose.connect('mongodb://localhost:27017/chatter');
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

    io.sockets.on('connect', () => console.log('User connected'));
});

server.listen(port, () => {console.log('Express server is running on port', port)});