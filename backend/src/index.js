import 'dotenv/config';
import express from "express";
import cors from "cors";
import route from "./routes/index.js";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 5555;

const app = express();

// middeware
// This help express understand json format of request body
const allowedOrigins = [
  `https://${process.env.FRONTEND_HOST}`,
  'http://localhost:5173',
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

route(app);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
