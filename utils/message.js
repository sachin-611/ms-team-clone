// importing meeting schema
const {Meeting}=require('../models/meeting')
// add the message to the database
// - find the room/meeting
// - insert a new message in the array of the current mesage
// - save it to database
async function addMessage(message, username, time, room) {
  await Meeting.find({roomId:room})
  .then(async (data)=>{
    if(data.length){
      data[0].msg.push({message:message,username:username,time:time});
      data[0].save()
    }
  })
  .catch((err)=>{
    console.log("unable to save message",err)
    return false;
  })
}
// creates an new array of the messages of the requested room
async function getMessage(roomReq) {
  let allMessages=[]
  await Meeting.find({"roomId":roomReq})
  .then((data)=>{
    if(data.length===0)
      return allMessages;
    (data[0].msg).forEach((msg)=>{
      allMessages.push({"username":(msg.username),"message":(msg.message),"time":(msg.time)})
    })
  })
  .catch((err)=>{
    console.log("error at getMessage function",err);
  })
  return allMessages
}
// exporting both functions
module.exports = {
  addMessage,
  getMessage,
};
