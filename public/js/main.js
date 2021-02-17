const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// pegar o username e sala da URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// entrar na sala
socket.emit('joinRoom', { username, room });

// pegar sala e usuários
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
})

// mensagens recebidas do servidor
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  // rolar para baixo
  chatMessages.scrollTop = chatMessages.scrollHeight;
})

// message submit
chatForm.addEventListener('submit', event => {
  event.preventDefault();

  // acessando a mensagem no campo mensagem através do ID 'msg'
  const msg = event.target.elements.msg.value;

  // emitindo mensagem para o servidor
  socket.emit('chatMessage', msg);

  // limpar campo de texto da mensagem
  event.target.elements.msg.value = '';
  // focar no campo de texto
  event.target.elements.msg.focus();
});

// renderizar mensagem na DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text}</p>
  `;
  document.querySelector('.chat-messages').appendChild(div);
}

// adicionar nome da sala na DOM
function outputRoomName(room) {
  roomName.innerHTML = room;
}

// adicionar lista de usuários
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}