// initiallising the socket and the code in () is for not duplicating the users
// will be user for creating the meet id
const socket = io({ transports: ["websocket"], upgrade: false });
// it calls function and create a meeting id
async function generateMeetLink() {
  let meet_link = await getLink();
  copyToClipboard(meet_link);
}
// it copy the text passed to clipboard
function copyToClipboard(text) {
  const cb = navigator.clipboard;
  cb.writeText(text).then(() =>
    alert(`Meet Link :- ${text} copied to clipboard!!`)
  );
}
// for joining the user if meeting id is none empty redirect to meeting link
// else will alert user
function joinMeet(){
    const meetLink=document.getElementById("meet-link");
    if(meetLink.value){
        let link=meetLink.value;
        meetLink.value=""
        window.location.href = `/meet/${link}`;
    }
    else{
        alert("please provide a meet link!!")
    }
}
// helper function for creating meet 
// request server to create a meet and save that to database
// and then resolve the promise
async function getLink() {
  return new Promise(function (resolve, reject) {
    socket.emit("createMeet");
    socket.once("createMeet", function (data) {
      
      resolve(data);
    });
  });
}
