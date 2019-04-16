const users = [];

const addUser = ({ id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const existingUser = users.find(user => user.room === room && user.username === username);

    if (existingUser) {
        console.log('User in use');
        return {
            error: 'User in use!'
        }
    }

    const user = {
        id: id,
        username: username,
        room: room
    };

    users.push(user);
    return {user};
};

const getUser = (id) => {
    return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter(user => user.room === room);
};

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

module.exports = {
    addUser,
    getUser,
    getUsersInRoom,
    removeUser
};