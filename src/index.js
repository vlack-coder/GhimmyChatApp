const path = require("path");
const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const { sendMessage, sendLocation } = require("./utils/message");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/user");

const app = express();
const server = http.createServer(app);
// This adds websocket features to the server and also serves up a .js library for the clientside
const io = socketio(server);

const public = path.join(__dirname, "../public");
const port = process.env.PORT || 4000;

app.use(express.static(public));

io.on("connection", (socket) => {
  console.log("websocket is online too");

  //   socket.emit("message", sendMessage("welcome sir"));
  //   socket.emit()
  //   socket.broadcast.emit("message", sendMessage("a new user as joined"));

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit(
      "message",
      sendMessage(` ${user.username} has joined the room: ${user.room}`)
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        sendMessage(`${user.username} has joined the room: ${user.room}`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
    })

      
  });

  // message (it can be called anything) is passed from the chat.js   the acknowledgement is passed as a second parameter
  socket.on("sndmessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", sendMessage(user.username, message));
    // avknowledgement is called here
    callback();
  });

  socket.on("sendlocation", (location) => {
    //   let msg =  `location is longitude: ${location.longitude} and latitude: ${location.latitude}`
    const user = getUser(socket.id);
    io.emit(
      "locationmsg",
      sendLocation(user.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id)
    if (user) {
      io.to(user.room).emit(
        "message",
        sendMessage(`${user.username} has left!`)
      );
    //   io.to(user.room).emit("message", sendMessage("a user just left"));
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`this app is running on port: ${port}`);
});
