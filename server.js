const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

let rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("createRoom", (room) => {
    if (!rooms[room]) {
      rooms[room] = { players: [] };
      console.log(`Room ${room} created`);
    }
    rooms[room].players.push(socket.id);
    socket.join(room);
    io.to(room).emit("updatePlayers", rooms[room].players);
  });

  socket.on("sendCard", (data) => {
    io.to(data.room).emit("receiveCard", { player: socket.id, card: data.card });
  });

  socket.on("disconnect", () => {
    for (let room in rooms) {
      rooms[room].players = rooms[room].players.filter(id => id !== socket.id);
      io.to(room).emit("updatePlayers", rooms[room].players);
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
