import express from "express";
import coursesRouter from "./routes/courses";

const app = express();
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

app.use(express.json());
app.use(coursesRouter);

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
