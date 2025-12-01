import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import route from "./routes/index.js";
import cookieParser from "cookie-parser";

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

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
