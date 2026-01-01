import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import route from "./routes/index.js";
import cookieParser from "cookie-parser";
import { app, server } from "./socket/index.js";

dotenv.config();

const PORT = process.env.PORT || 5555;

// middeware
// This help express understand json format of request body
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

route(app);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});