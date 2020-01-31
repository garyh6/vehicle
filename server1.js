require("dotenv").config();

const express = require('express')
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const routes = require('./routes')
// app.use(express.static(path.join(__dirname, 'client/build')));



app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

io.on("connection", function(socket) {
  console.log(`Socket ${socket.id} connected.`);

  socket.emit("add prop", { name: "speed", value: 100 }, ({ err, res }) => {
    console.log("************ err", err);
    if (err) return console.log(err);
    console.log("************ res", res);
    // console.log("*", `prop: ${name} = ${value}.`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected.`);
  });
});



server.listen(4000);
console.log("Server is running on localhost:4000");