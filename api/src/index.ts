import express from "express";
import cors from "cors";
import { connectDB } from "./lib/prisma";
import authRouter from "./routes/auth.routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.listen(port, () => {
  connectDB();
  console.log(`Server is running at http://localhost:${port}`);
});
