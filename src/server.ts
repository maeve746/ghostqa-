import express from "express";
import { testRouter } from "./routes/test.route";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/tests", testRouter);

app.listen(port, () => {
  console.log(`GhostQA server running at http://localhost:${port}`);
});
