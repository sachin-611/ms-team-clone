// function for creating right side bar
function create_right() {
  const sidebar = document.getElementsByClassName("meet_right")[0];
  const videobar = document.getElementsByClassName("meet_left")[0];
  videobar.style.flex = "0.8";
  sidebar.style.flex = "0.2";
}
// function for removing right side bar
function destroy_right() {
  const sidebar = document.getElementsByClassName("meet_right")[0];
  const videobar = document.getElementsByClassName("meet_left")[0];
  empty(sidebar);
  videobar.style.flex = "1";
  sidebar.style.flex = "0";
}
// function for generating header for right side bar
function genrateHeader(data) {
  let text = document.createElement("h3");
  text.append(data);
  let header = document.createElement("div");
  header.className = "header";
  header.append(text);
  return header;
}
// function for removing all the childs (this is helper function)
function empty(ele) {
  while (ele.firstChild) {
    ele.removeChild(ele.lastChild);
  }
}
// variables to see if right sidebar is visible or not
let chatBoxVisible = false;
let right_visible = false,parListVisible = false;
// function for displaying right sidebar
// - if side bar is opened as participant list then it will remove it
// - it empty right sidebar
// - it get all the participant list by requesting from server
// - inserts all the participants in the list and disply them
function getAllParticipants() {
  if (right_visible && parListVisible) {
    right_visible = parListVisible = false;
    return destroy_right();
  }
  parListVisible = right_visible = true;
  chatBoxVisible = false;
  empty(document.getElementsByClassName("meet_right")[0]);
  create_right();
  const sidebar = document.getElementsByClassName("meet_right")[0];
  sidebar.append(genrateHeader("Participants List"));
  let ele = document.createElement("ul");
  ele.className = "participants_list";
  sidebar.append(ele);
  socket.emit("getAllParticipants");
}
// function for displaying right sidebar
// - if side bar is opened as chat it will remove it
// - it empty right sidebar
// - it create side bar with input and send message button
// - it get all the messages by requesting from server
// - inserts all the messages(with username time and messages) in the list and disply them
async function chat() {
  if (right_visible && chatBoxVisible) {
    right_visible = chatBoxVisible = false;
    return destroy_right();
  }
  right_visible = chatBoxVisible = true;
  parListVisible = false;
  empty(document.getElementsByClassName("meet_right")[0]);
  create_right();
  const sidebar = document.getElementsByClassName("meet_right")[0];
  sidebar.append(genrateHeader("Chat"));
  let element = document.createElement("ul");
  element.className = "all_messages";
  sidebar.append(element);
  let ndiv = document.createElement("div");
  ndiv.className = "new_message";
  let inpt = document.createElement("input");
  inpt.type = "text";
  inpt.id = "text";
  inpt.placeholder = "Type a new message...";
  inpt.addEventListener("keydown", (event) => {
    getMsg(event);
  });
  ndiv.append(inpt);
  element = document.createElement("button");
  element.id = "send";
  element.addEventListener("click", (event) => {
    getMsg({ keyCode: 13 });
  });
  element.innerText = "send";
  ndiv.append(element);
  sidebar.append(ndiv);
  await socket.emit("getAllMessage");
}
// this copy the text passed to the clipboard
function copyToClipboard(text) {
  const cb = navigator.clipboard;
  cb.writeText(text).then(() =>
    alert(`Meet Link :- ${text} copied to clipboard!!`)
  );
}
// this function copy the current room meeting id
function inviteParticipant(){
  copyToClipboard(ROOM_ID)
}
