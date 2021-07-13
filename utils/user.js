// importing meeting schema
const {Meeting}=require('../models/meeting')
// saves the record of the new user that joined
async function userJoin(id,username,room){
    return await Meeting.find({roomId:room})
    .then(async(data)=>{
        data[0].users.push({username,id});
        await data[0].save();
        return true;
    })
    .catch((err)=>{
        return false;
    })
}
// returns the record of the requested user
async function getCurrentUser(id,room){
    console.log(id,room)
    return await Meeting.find({roomId:room})
    .then(async (data)=>{
        console.log(data[0])
        for(let usr of data[0].users)
        {
            if(usr.id===id)
                return usr
        }
        return {username:"user"}
    }).catch((err)=>{
        return {username:"user"}
    })
}
// returns the username of the requested user
async function getUserName(id,room){
    return await Meeting.find({roomId:room})
    .then(async (data)=>{
        console.log("")
        for(let usr of data[0].users)
        {
            if(usr.id===id)
                return usr.username
        }
        return "user"
    }).catch((err)=>{
        return "user"
    })
}
// removes the user from the current user array
async function userLeave(id,room){
    return await Meeting.find({roomId:room})
    .then(async (data)=>{
        for(let i=0;i<data[0].users.length;i++)
        {
            if(data[0].users[i].id===id){
                data[0].users.splice(i, 1)
                await data[0].save();
            }
        }
    }).catch((err)=>{
        console.log("leaving error!!")
    })
}
// returns array of record of all the users in the room
async function getRoomUsers(room){
    return await Meeting.find({roomId:room})
    .then(async (data)=>{
        console.log("")
        return data[0].users
    }).catch((err)=>{
        console.log("error in getting room users!!")
    })
}
// exporting all the functions
module.exports={
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    getUserName
}