// this will be helper function to display nome on the video
let dummyName = "no named";
// taking username input
// and validating it is not null
let userName = prompt("Enter name");
while (!userName) {
  userName = prompt("Name cannot be empty!! Please enter a name");
}
// initiallising the socket and the code in () is for not duplicating the users
const socket = io({ transports: ["websocket"], upgrade: false });
// creating new peer object
let peer = new Peer();
// creating object for storing all the users streams (will be used when we will remove the user)
const peers = {};
// creating video element for my video
const myVideo = createVideo("me", "me", true);
myVideo.id = "me";
// getting video grid where all the video will be added
const videoGrid = document.getElementById("video-grid");
let myVideoStream;
let screenShareOn = false;
// requesting video and audio permissions
// - if allowed will notify server new user joined
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    //add our video to the video grid
    addVideoStream(myVideo, stream);
    // once any new user is joined server will reques this function
    // to add them to our stream
    socket.on("user-connected", (id) => {
      connectToNewUser(id, stream);
      if (screenShareOn) {
        connectNewUserToScreen(id);
      }
      socket.emit("getAllParticipants");
    });
    // answering call to the peers
    peer.on("call", (call) => {
      call.answer(stream);
      peers[call.peer] = call;
      const video = createVideo("other user", call.peer);
      video.id = call.peer;
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
      peer.on("close", () => {
        video.remove();
      });
    });
    // request from server to add a new message
    socket.on("addMessage", (message, senderName, time) => {
      displayMessage(message, senderName, time);
    });
  })
  .catch((err) => { // displaying error if something went wrong
    console.log("Oh no somthing went wrong");
  });
// sending server information of our joining
peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, userName);
});
// this will add all the participants to right sidebar of participant list
socket.on("getAllParticipants", (list) => {
  let partList = document.querySelector(".participants_list");
  try {
    // first empty the paticipants list 
    while (partList.firstChild) {
      partList.removeChild(partList.lastChild);
    }
    // add all the participans form the object returned form server
    Object.keys(list).forEach((participant) => {
      let participantName = createLi(list[participant].username, false);
      partList.append(participantName);
    });
  } catch (err) {}
});
// this is called whenever user is disconnected and removing the disconnected user from our stream
socket.on("user-disconnected", (id) => {
  socket.emit("getAllParticipants");
  if (peers[id]) {
    peers[id].close();
  }
  try {
    const toDelete = document.getElementById(id);
    toDelete.remove();
  } catch (er) {}
});
// for displaying all the messages
socket.on("getAllMessage", (allMessage) => {
  allMessage.forEach((msg) =>
    displayMessage(msg.message, msg.username, msg.time)
  );
});
// for removing the screen share form our video grid
socket.on("remove", (id) => {
  socket.emit("getAllParticipants");
  try {
    const toDelete = document.getElementById(id);
    toDelete.remove();
  } catch (err) {
    console.log(err);
  }
});
// function to connect to new user
// - calls the user with given userid
// - send our stream to him for his video grid
// - add his stream to our stream
const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = createVideo("other user", userId);
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  video.id = userId;
  peers[userId] = call;
};
// adding video and playing it in our video grid
const addVideoStream = (video, stream, beg = 0) => {
  video.lastElementChild.srcObject = stream;
  video.lastElementChild.addEventListener("loadedmetadata", () => {
    video.lastElementChild.play();
  });
  if (beg) videoGrid.prepend(video);
  else videoGrid.append(video);
};
// checks if enterkey is pressed or not
// - if enterkey is pressed it will send the message to the server
// (if send button is clicked it will consider that enter key)
// - else will return
function getMsg(event) {
  if (event.keyCode != 13) return;
  const msg = document.querySelector("#text");
  if (!msg.value.length) return;
  socket.emit("message", msg.value, peer.id);
  msg.value = "";
}
// helper function for creating mesages
function createLi(message, bold) {
  const msgLi = document.createElement("li");
  msgLi.style.listStyleType = "none";
  msgLi.innerHTML = bold ? `${message.bold().fontcolor("blue")}` : message;
  return msgLi;
}
// for muting and unmuting
// - if aur audio is turned on then it will be turned off
// - else if will be turned on
function muteUnmute() {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  myVideoStream.getAudioTracks()[0].enabled = !enabled;
  const icon = document.querySelector(".mute");
  if (enabled) {
    icon.style.color = "#d2d2d2";
    icon.innerHTML = `<i class="material-icons">mic</i><span>Unmute</span>`;
  } else {
    icon.style.color = "#EB534B";
    icon.innerHTML = `<i class="material-icons">mic_off</i><span>Mute</span>`;
  }
}
// for starting/stopping video
// - if aur video stream is turned on then it will be turned off
// - else if will be turned on
function videoStartStop() {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  myVideoStream.getVideoTracks()[0].enabled = !enabled;
  const icon = document.querySelector(".stop_video");
  if (enabled) {
    icon.style.color = "#d2d2d2";
    icon.innerHTML = `<i class="material-icons">videocam</i><span>Start Video</span>`;
  } else {
    icon.style.color = "#EB534B";
    icon.innerHTML = `<i class="material-icons">videocam_off</i><span>Stop Video</span>`;
  }
}
// for displaying the messages
function displayMessage(message, senderName, time) {
  const box = document.querySelector(".all_messages");
  const user = senderName + " @ " + time;
  box.append(createLi(user, true));
  box.append(createLi(message, false));
  box.scrollTop = box.scrollHeight;
}
// for creating new video element and return video element
// - will ask server for the username
// - if element created is for current user it will add "me"
function createVideo(username, id, my = false) {
  const myVid = document.createElement("video");
  myVid.muted = my;
  const text = document.createElement("div");
  const myName = document.createElement("div");
  text.innerText = username;
  if (!my) updateNames(id, text);
  myName.append(text);
  myName.append(myVid);
  // adding request to toggle between fullscreen and pervious config
  myVid.addEventListener("dblclick", (e) => {
    if (myVid.requestFullscreen) myVid.requestFullscreen();
    else if (myVid.webkitRequestFullscreen) myVid.webkitRequestFullscreen();
    else if (myVid.msRequestFullScreen) myVid.msRequestFullScreen();
  });
  // adding event to resize the video
  myVid.addEventListener("click", (e) => {
    if (myVid.style.height === "300px") {
      myVid.style.height = "600px";
      myVid.style.width = "750px";
    } else {
      myVid.style.height = "300px";
      myVid.style.width = "400px";
    }
  });
  return myName;
}
// for geting the username form server
async function updateNames(id, ele) {
  let data = await checkEntry(id);
  console.log("");
  ele.innerText = data;
}
// helper function for getting name returns promise with the username
function checkEntry(id) {
  return new Promise(function (resolve, reject) {
    socket.emit("userNameReq", id);
    socket.once("userNameReq", function (data) {
      resolve(data);
    });
  });
}
// on ending meeting redirect us to ending page
function endMeeting() {
  window.location.href = "/meet/ended";
}