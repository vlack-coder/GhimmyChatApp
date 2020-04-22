const socket = io();

const messageform = document.querySelector("#msgform");
const formbutton = messageform.querySelector("input");
const test = document.querySelector("#test");
const displaylocation = document.querySelector("#display-location");

const testtemplate = document.querySelector("#test-template").innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const locationtemplate = document.querySelector("#location-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = test.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = test.offsetHeight

  // Height of test container
  const containerHeight = test.scrollHeight

  // How far have I scrolled?
  const scrollOffset = test.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
      test.scrollTop = test.scrollHeight
  }
}


socket.on("message", (message) => {
  const html = Mustache.render(testtemplate, {
    message: message.text,
    username: (message.username).toUpperCase(),
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  test.insertAdjacentHTML("beforeend", html);
    console.log(username)
    autoscroll()
});

socket.on("locationmsg", ({ location, createdAt, username }) => {
  const html = Mustache.render(locationtemplate, {
    location,
    username: username.toUpperCase(),
    createdAt: moment(createdAt).format("h:mma"),
  });
  test.insertAdjacentHTML("beforeend", html);
  // console.log(location.username)
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

messageform.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.elements.msg.value;
  socket.emit("sndmessage", message, () => {
    //   formbutton.value = ''
    e.target.elements.msg.value = "";
    console.log("message delivered, fuck off");
  });
});

document.querySelector("#location").addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("your browser is not supported");
  }
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    socket.emit("sendlocation", {
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
    // console.log(coords.latitude)
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/"; //redirection to login page
  }
});
