const users = []

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        // console.log(users.splice(index, 1))
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

// addUser({
//     id: 12,
//     username: 'ife',
//     room: 'love'
// })

// addUser({
//     id: 18,
//     username: 'joey',
//     room: 'love'
// })

// addUser({
//     id: 13,
//     username: 'lekan',
//     room: 'lover'
// })
// addUser({
//     id: 13,
//     username: 'lekan',
//     room: 'lover'
// })
// console.log(users)
// removeUser(13)

// console.log(users)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}