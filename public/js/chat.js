const socket = io();
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('#message-input');
const $messageSendLocation = document.querySelector('#send-location');
const $messageSendMessage = document.querySelector('#send-message');

socket.on('message', (msg) => console.log(msg));

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  $messageSendMessage.setAttribute('disabled', 'disabled');
  socket.emit('sendMessage', $messageFormInput.value, (err) => {
    $messageSendMessage.removeAttribute('disabled', 'disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    if (err) {
      return console.log('message blocked')
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