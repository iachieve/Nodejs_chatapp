const socket = io();
// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('#message-input');
const $messageSendLocation = document.querySelector('#send-location');
const $messageSendMessage = document.querySelector('#send-message');
const $messages = document.querySelector('#messages');
// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', message => {
  console.log(message);
  const html = Mustache.render(locationMessageTemplate, {
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  $messageSendMessage.setAttribute('disabled', 'disabled');
  socket.emit('sendMessage', $messageFormInput.value, (err) => {
    $messageSendMessage.removeAttribute('disabled', 'disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    if (err) {
      return console.log('message blocked');
    }
    console.log('message was delivered');
  });
});

$messageSendLocation.addEventListener('click', async (e) => {
  $messageSendLocation.setAttribute('disabled', 'disabled');
  if (!navigator.geolocation) return alert('Geolocation is not supported by your browser');

  navigator.geolocation.getCurrentPosition(pos => {
    socket.emit('sendLocation', {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    }, () => {
      $messageSendLocation.removeAttribute('disabled', 'disabled');
      console.log('location shared!');
    });
  });
});