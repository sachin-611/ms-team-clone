//taking input of username
let userName = prompt("Enter username");
// initiallising the socket and the code in () is for not duplicating the users
const socket = io({ transports: ["websocket"], upgrade: false });
// asking server for all the messages for current meeting/room
socket.emit("getMessages", ROOM_ID);
//defination of get messages function
//it removes all the messages (if any)
//and then inserts all the new messages
socket.on("getMessages", (arr) => {
  const ele = document.getElementById("display-message");
  while (ele.firstChild) {
    ele.removeChild(ele.lastChild);
  }
  arr.forEach((msg) =>
    ele.append(displayMessage(msg.message, msg.username, msg.time))
  );
});
// selecting input box and btn for adding events
const inpt = document.getElementById("msgbox");
const btn = document.getElementById("send-msg");
// adding event keydown if enter key is pressed then message will be sent else it will not
inpt.addEventListener("keydown", (event) => {
  getMsg(event);
});
// adding event if submit button is clicked it will send the message
btn.addEventListener("click", (event) => {
  getMsg({ keyCode: 13 });
});
// it is sends the message to server(and server send it to database)
// returns a promise resolved with all the messages
async function sendData(msg, userName, ROOM_ID) {
  return new Promise(function (resolve, reject) {
    socket.emit("sendMessage", msg.value, userName, ROOM_ID);
    socket.once("sendMessage", function (data = 1) {
      resolve(data);
    });
  });
}
// for displaying messages
async function displayAllMessage(){
  socket.emit("getMessages", ROOM_ID);
}
// a looping function that will request server every 6 sec for new messages
(function(){
  displayAllMessage()
  setTimeout(arguments.callee, 6000);
})();
// checking if wheter enter key is pressed or not
// if enter key is presed then it will send the message
async function getMsg(event) {
  if (event.keyCode != 13) return;
  const msg = inpt;
  if (!msg.value.length) return;
  await sendData(msg, userName, ROOM_ID);
  msg.value = "";
  socket.emit("getMessages", ROOM_ID);
}
// for displaying the message
// create different elements and insert values in them and display
function displayMessage(message, senderName, time) {
  let msg = document.createElement("div");
  msg.className = "message";
  let msgupper = document.createElement("p");
  msgupper.className = "meta";
  msgupper.append(senderName);
  msgupper.append(" ");
  let msgtime = document.createElement("span");
  msgtime.innerText = time;
  msgupper.append(msgtime);
  let msgtext = document.createElement("p");
  msgtext.className = "text";
  msgtext.append(message);
  msg.append(msgupper);
  msg.append(msgtext);
  return msg;
}
