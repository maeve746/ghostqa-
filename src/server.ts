import express from "express";
import path from "node:path";
import { testRouter } from "./routes/test.route";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/tests", testRouter);
app.use("/api/test", testRouter);

app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  },
);

app.listen(port, () => {
  console.log(`GhostQA server running at http://localhost:${port}`);
});
