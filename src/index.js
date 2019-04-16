const http = require('http');
const socketio = require('socket.io');
const filter = require('bad-words');
const { generateLocationMessage, generateMessage } = require('./utils/message');
const app = require('./app');
const { addUser, getUser, getUsersInRoom, removeUser} = require('./utils/users');


const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    console.log('New WebSocket connection!');

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room});

        if (error) return callback(error);

        socket.join(user.room);

        socket.emit('handshake', generateMessage(`Welcome! ${user.username}`));
        socket.broadcast.to(user.room).emit('handshake', generateMessage(`${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });
    
    socket.on('clientMsg', (msg, callback) => {
        const user = getUser(socket.id);
        
        if (!user) {
            return callback({
                error: 'Unable to verify user'
            });
        }
        io.to(user.room).emit('message', generateMessage(msg, user.username));
        callback();
    });

    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id);
        
        if (!user) {
            return callback({
                error: 'Unable to verify user'
            });
        }

        const msg = `https://google.com/maps?q=${position.latitude},${position.longitude}`;
        io.to(user.room).emit('sendLocation', generateLocationMessage(msg, user.username));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('handshake', generateMessage(`${user.username} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

server.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}!`);
});