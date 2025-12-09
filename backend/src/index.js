import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import route from "./routes/index.js";
import cookieParser from "cookie-parser";
import https from "https";
import fs from "fs";

dotenv.config();

const PORT = process.env.PORT || 5555;

const app = express();

// middeware
// This help express understand json format of request body
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

app.use(cors(corsOptions));

route(app);

// For development with self-signed certificate
if (process.env.NODE_ENV === 'development') {
  try {
    // Create self-signed certificate for development
    const options = {
      key: fs.readFileSync('./certs/key.pem'),
      cert: fs.readFileSync('./certs/cert.pem')
    };
    
    https.createServer(options, app).listen(PORT, () => {
      console.log(`HTTPS Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.log('HTTPS certificates not found, starting HTTP server');
    app.listen(PORT, () => {
      console.log(`HTTP Server is listening on port ${PORT}`);
    });
  }
} else {
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}
