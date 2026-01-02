import {Server} from "socket.io";
import express from "express";
import http from "http";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";

const onlineUsers = new Map();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    }
});

io.use(socketAuthMiddleware);

io.on("connection", async (socket) => {
    const user = socket.user;
    console.log(`${user.displayName} with socket ${socket.id} connected`);

    onlineUsers.set(user._id, socket.id);

    io.emit("online-users", Array.from(onlineUsers.keys()));

    const conversations = await conversationController.getUserConversationsForSocketIO(user._id);
    conversations.forEach((id) => socket.join(id));

    socket.on("disconnect", () => {
        onlineUsers.delete(user._id);
        io.emit("online-users", Array.from(onlineUsers.keys()));
        console.log(`Socket disconnect ${socket.id}`);
    });
})

export { io, app, server };