// importing meeting schema
const {Meeting}=require('../models/meeting')
// check whether room exist or not in the database
async function validRoom(id){
    return await Meeting.find({roomId:id})
    .then((data)=>{
      return (data.length)
    }).catch((err)=>{
      console.log("error in valid room function",err)
      return (0)
    })
}
// check whether requested id exisit or not
// if it does not exist it save it to database and return saved
// else return already exists
async function createRoom(id){
  let pos=await validRoom(id);
  if(!pos){
    try{
      let newMeet=new Meeting({roomId:id,msg:[],users:[]})
      await newMeet.save();
      return "saved"
    }catch(err){
      return "failed"
    }
  }
  else{
    return "already exists"
  }
}
// exporting both functions
module.exports={
    createRoom,
    validRoom
}