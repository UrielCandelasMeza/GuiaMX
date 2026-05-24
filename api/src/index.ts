import express from "express";
import cors from "cors";
import { connectDB } from "./lib/prisma";
import authRouter from "./routes/auth.routes";
import documentosRouter from "./routes/documentos.routes";
import tramitesRouter from "./routes/tramites.routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/documentos", documentosRouter);
app.use("/tramites", tramitesRouter);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
