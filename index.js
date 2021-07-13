// importing the express and other dependencies in our server
const express = require("express");
// creating our server
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const path = require("path");
const {
  getUserName,
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/user");
const { validRoom, createRoom } = require("./utils/check_room");
const { addMessage, getMessage } = require("./utils/message");
const {Feedback}=require('./models/meeting')
const moment = require("moment");
// setting port to 3030 if in development else will pick it from environment vaiable
const port = process.env.PORT || 3030;
// setting ejs as our view engine for rendering pages
app.set("view engine", "ejs");
// setting public as static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/meet", express.static("public"));
app.use("/chat", express.static("public"));
// telling express for using urlencoder
app.use(express.urlencoded({ extended: true }));
// rendering home page if requested
app.get("/", (req, res) => {
  res.render("home");
});
// rendering meet page if requested
app.get("/meet", (req, res) => {
  res.render("meet");
});
// rendering about page if requested
app.get("/about", (req, res) => {
  res.render("about");
});
// rendering meeting ended page if requested
app.get("/meet/ended", (req, res) => {
  res.render("end");
});
// rendering chat login page if requested
app.get("/chat", (req, res) => {
  res.render("chat");
});
// rendering feedback page if requested
app.get("/feedback", (req, res) => {
  res.render("feedback");
});
// posting our feedback on database if requested
app.post("/feedback", (req, res) => {
  let newFeedback=new Feedback({name:req.body.name,email:req.body.email,subject:req.body.subject,message:req.body.message})
  newFeedback.save();
  res.render("error", {
    errorMsg1: "Thanks for your valuable feedback!",
    errorMsg2:
    "We are trying to improve and your feedback and suggestions help us!",
  });
});
// sending request to destination room
app.post("/chat", (req, res) => {
  let roomId = req.body.meet;
  res.redirect(`/chat/${roomId}`);
});
// validating room for chating
// - if correct room is requested room is rendered
// - error page is displayed with respective error
app.get("/chat/:roomid", async (req, res) => {
  let ans = await validRoom(req.params.roomid);
  if (ans) {
    res.render("chatroom", {
      users: await getRoomUsers(req.params.roomid),
      room: req.params.roomid,
      messages: await getMessage(req.params.roomid),
    });
  } else {
    res.render("error", {
      errorMsg1: "Chat not found!",
      errorMsg2: "Check you meet link or create new meet!",
    });
  }
});
// validating room for meeting
// - if correct room is requested room is rendered
// - error page is displayed with respective error
app.get("/meet/:room/", async (req, res) => {
  let ans = await validRoom(req.params.room);
  if (ans) {
    res.render("room", { roomId: req.params.room });
  } else {
    res.render("error", {
      errorMsg1: "Meeting not found!",
      errorMsg2: "Check you meet link or create new meet!",
    });
  }
});
// for all the get request displaying error message
app.get("*", (req, res) => {
  res.render("error", {
    errorMsg1: "404 Page Not Found",
    errorMsg2: "What are you looking for?",
  });
});
// for all the post request displaying error message
app.post("*", (req, res) => {
  res.render("error", {
    errorMsg1: "404 Page Not Found",
    errorMsg2: "What are you looking for?",
  });
});
// all the socket.io server side funtions
io.on("connection", (socket) => {
  // will save the message on the server when sended from chatroom
  socket.on("sendMessage", async (msg, username, roomId) => {
    const time = moment().format("LLL");
    await addMessage(msg, username, time, roomId);
    socket.emit("sendMessage", "done");
  });
  // sends all the messages to chatroom of the requested room
  socket.on("getMessages", async (roomId) => {
    socket.emit("getMessages", await getMessage(roomId));
  });
  // creates a new room and return its id
  socket.on("createMeet", async () => {
    let newroomid = uuidv4();
    await createRoom(newroomid);
    socket.emit("createMeet", newroomid);
  });
  // all the meeting funtions 
  socket.on("join-room", (roomId, userId, userName) => {
    // will save the new user record in database
    userJoin(userId, userName, roomId);
    // add user to room
    socket.join(roomId);
    // calls the function join room which will notify 
    // all the other participants(in that meet) that new user has joined
    socket.broadcast.to(roomId).emit("user-connected", userId);
    // will save message to database
    // will send request to all the users(in the meet) to add new message 
    socket.on("message", async (message, id) => {
      const sender = await getCurrentUser(id, roomId);
      const time = moment().format("LLL");
      addMessage(message, sender.username, time, roomId);
      io.to(roomId).emit("addMessage", message, sender.username, time);
    });
    // called on disconnection od a user
    // remove its record from server
    // asks all the users to remove disconnected user
    socket.on("disconnect", () => {
      userLeave(userId, roomId);
      io.to(roomId).emit("user-disconnected", userId);
    });
    // sends all the messages stored in the database of that meeting
    socket.on("getAllMessage", async () => {
      socket.emit("getAllMessage", await getMessage(roomId));
    });
    // removes the screen share form database
    // asks users to remove from their grid
    socket.on("remove", (sid) => {
      userLeave(sid, roomId);
      socket.to(roomId).emit("remove", sid);
    });
    // returns the list of all the participants
    socket.on("getAllParticipants", async () => {
      socket.emit("getAllParticipants", await getRoomUsers(roomId));
    });
    // return the name of the requested participant
    socket.on("userNameReq", async (id) => {
      socket.emit("userNameReq", await getUserName(id, roomId));
    });
  });
});
// listening to server
server.listen(port);
