const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// definir pasta estática para exibir as telas
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';

// rodar quando um cliente conectar
io.on('connection', socket => {
  // entrar na sala de chat
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    // fazendo o usuário entrar na sala
    socket.join(user.room);

    // bem-vindo ao novo usuário
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // transmitir quando um usuário conectar
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} entrou no chat`));

    // enviar usuários e informação da sala
    io.to(user.room).emit('roomUsers', { 
      room: user.room,
      users: getRoomUsers(user.room),
     });
  });

  // ouvir o evento chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    // enviar a mensagem para todos os clientes
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // transmitir quando um usuário desconectar
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} saiu do chat`));

      // enviar usuários e informação da sala
      io.to(user.room).emit('roomUsers', { 
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(3000, () => console.log('Servidor rodando na porta 3000'));