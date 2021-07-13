// checking if we are in production mode or in local to get database url
// if we are on local then we will require dotenv to acess 
// environment variables from .env file
if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}
const dbURL=process.env.DB_URL
//conecting mongo database
const mongoose = require("mongoose");
mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connection stablished!");
  })
  .catch((err) => {
    console.log("oh no!!", err);
  });
//creating meeting schema
const meetingSchema = new mongoose.Schema({
  roomId: String,
  msg: [{ message: String, username: String, time: String }],
  users:[{username:String,id:String}]
});
const Meeting=mongoose.model('Meeting',meetingSchema)
//creating feedback schema
const feedbackSchema = new mongoose.Schema({
  name:String,
  email:String,
  subject:String,
  message:String  
});
const Feedback=mongoose.model('Feedback',feedbackSchema)
// exporting both of the schema
module.exports={Meeting,Feedback}