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


const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

io.on('connection', socket => {
  console.log('Server: New WebSocket connection...');

  socket.emit('message', generateMessage('Welcome'));
  socket.broadcast.emit('message', generateMessage('A new user has joined'));

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed');
    }
    io.emit('message', generateMessage(message));
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
      callback();
  });

  socket.on('disconnect', () => {
    io.emit('message', generateMessage('a user has left'));
  });
});


// socket configuration # 3 user server instead of app
server.listen(PORT, console.log(`server started at ${PORT}`));