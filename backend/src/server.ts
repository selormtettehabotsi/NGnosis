import express from "express";
import coursesRouter from "./routes/courses";

const app = express();
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const corsOrigin = process.env.CORS_ORIGIN ?? "*";

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", corsOrigin);
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});
app.use(coursesRouter);

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
