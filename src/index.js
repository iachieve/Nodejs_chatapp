const Filter = require('bad-words');
const path = require('path');
const express = require('express');
// socket configuration # 1 
const http = require('http');
// socket configuration # 4
const socketio = require('socket.io');

const app = express();
// socket configuration # 2 
const server = http.createServer(app);
// socket configuration # 5
const io = socketio(server);

const { generateMessage, generateLocationMessage } = require('./utils/messages.js')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')


const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

io.on('connection', socket => {
  console.log('Server: New WebSocket connection...');



  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error)
    }
    socket.join(user.room);

    socket.emit('message', generateMessage('ChatBot', 'Welcome'));
    socket.broadcast.to(user.room).emit('message', generateMessage('ChatBot', `${user.username} has joined!`));
    io.to(user.room).emit('roomData', {
      room: user.room, 
      users: getUsersInRoom(user.room)
    });
    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    // const filter = new Filter();
    // if (filter.isProfane(message)) {
    //   return callback('Profanity is not allowed');
    // }
    const user = getUser(socket.id);
    io.to(user.room).emit('message',
      generateMessage(user.username, message));
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('locationMessage',
      generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('message', generateMessage('ChatBot', `${user} has left!`));
      io.to(user.room).emit('roomData', {
          room: user.room, 
          users: getUsersInRoom(user.room)
      });
    }
  });
});


// socket configuration # 3 user server instead of app
server.listen(PORT, console.log(`server started at ${PORT}`));


/*
  Notes:
  socket.emit => sends event to specific client
  io.emit => sends event to every connected client
  socket.broadcast.emit => sends event to all clients except the sender
  =====================
  io.to.emit => emits message to everybody in specific room
  socket.broadcast.to.emit => sends to all clients in a room except the sender
*/