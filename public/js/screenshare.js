// declaring variables used in screen sharing
let speer;
let sid;
let sstream;
// function to call all other users for adding the new screen
const connectNewUserToScreen = (userId) => {
  speer.call(userId, sstream);
};
// screen share function
// - share the screen if not shared
// - if screen is shared then it will request for removing the screen to all users
const shareScreen = () => {
  const icon = document.querySelector(".screen");
  if (screenShareOn === false) {
    // requesting screen
    navigator.mediaDevices
      .getDisplayMedia({
        cursor: true,
        video: true,
        audio: true,
      })
      .then((stream) => {
        sstream = stream;
        // if allowed then creating new object and asking for joining it in there stream
        speer = new Peer();
        speer.on("open", (id) => {
          sid = id;
          socket.emit("join-room", ROOM_ID, id, userName + "screen");
          socket.emit("getAllParticipants");
        });
        speer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (stream) => {});
        });
        socket.emit("remove", sid);
        icon.innerHTML = `<i class="material-icons">stop_screen_share</i><span>Stop Sharing screen</span>`;
        icon.style.color = "#EB534B";
        screenShareOn = true;
      })
      .catch((err) => {
        console.log("error accessing the screen!", err);
      });
  } else {
    // stoping the screen share
    sstream.getVideoTracks()[0].stop();
    // disconnecting
    speer.disconnect();
    // asking all other user to remove
    socket.emit("remove", sid);
    socket.emit("getAllParticipants");
    icon.style.color = "#d2d2d2";
    icon.innerHTML = `<i class="material-icons">screen_share</i><span>Share screen</span>`;
    screenShareOn = false;
  }
};
