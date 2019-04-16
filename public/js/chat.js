const socket = io();
const $messageForm = document.querySelector('form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $messages = document.querySelector('#messages');
const $locationButton = document.querySelector('#share-location');
const $sideBar = document.querySelector('#sidebar');

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const sendLocationMessageTemplate = document.querySelector('#sendLocation-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href= '/';
    }
});

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild;

    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight;

    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;
    console.log(containerHeight, newMessageHeight, scrollOffset);

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
};

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = e.target.elements.message.value;
    if (!message) return;
    $messageFormInput.setAttribute('disabled', 'disabled');
    $messageFormButton.setAttribute('disabled', 'disabled');
    
    socket.emit('clientMsg', message, (error) => {
        $messageFormInput.removeAttribute('disabled');
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if (error) {
            return console.log('Error:');
        }
        console.log('Message delivered!');
    });

});

document.querySelector('#share-location').addEventListener('click', (e) => {
    e.preventDefault();
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!');
    }

    $locationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        const myPos = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', myPos, (error) => {
            $locationButton.removeAttribute('disabled');
            if (error) {
                return console.log('Error:');
            }
            console.log('Message delivered!');
        });
    });
});

socket.on('handshake', (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        username: 'Admin',
        createdAt: moment(message.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        username: message.username,
        createdAt: moment(message.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('sendLocation', (message) => {
    const html = Mustache.render(sendLocationMessageTemplate, {
        message: message.url,
        username: message.username,
        createdAt: moment(message.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({ room, users }) => {
    console.log(room, users);

    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users: users
    });

    $sideBar.innerHTML = html;
});