import 'dotenv/config';
import express from "express";
import cors from "cors";
import route from "./routes/index.js";
import cookieParser from "cookie-parser";
import { app, server } from "./socket/index.js";
import path from "path";
import auctionCron from './jobs/auctionCron.js';

const PORT = process.env.PORT || 5555;

// middeware
// This help express understand json format of request body
const allowedOrigins = [
  `${process.env.FRONT_HOST}`,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(
  "/assets",
  express.static(path.resolve(process.cwd(), "src", "assets"))
);

auctionCron();

route(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(err.status || 400).json({
    message: err.message || "An unexpected error occurred"
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
