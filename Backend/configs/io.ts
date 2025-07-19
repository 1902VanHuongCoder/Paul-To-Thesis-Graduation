import { Server } from "socket.io";
import express from "express";
import http from "http";

// Create HTTP server and integrate Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // Your frontend origin
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

export { io }; 